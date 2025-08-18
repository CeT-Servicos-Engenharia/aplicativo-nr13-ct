import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Alert, FlatList } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import Helmet from '@expo/vector-icons/FontAwesome6';
import Search from '@expo/vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import EngenieerModal from '../components/modal/EngenieerModal';
import PerformingHydrostaticTest from '../components/modal/PerformingHydrostaticTest';
import { db } from '../../database/firebaseConfig';
import { arrayUnion, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';


const HydrostaticTest = ({ route, visible, onClose }) => {
  const { projectName = 'projeto desconhecido', Idproject } = route.params || {};
  const [engenieers, setEngenieers] = useState([]);
  const [engenieer, setEngenieer] = useState("");
  const [modalEngineerVisible, setModalEngineerVisible] = useState(false);
  const [modalPerformingHydrostaticTest, setModalPerformingHydrostaticTest] = useState(false);
  const [drawing, setDrawing] = useState('');
  const [procedure, setProcedure] = useState('');
  const [addendum, setAddendum] = useState('');
  const [inspectionStandard, setInspectionStandard] = useState('');
  const [artReference, setArtReference] = useState('');
  const [revision, setRevision] = useState('');
  const [material, setMaterial] = useState('');
  const [executionList, setExecutionList] = useState([]);
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [selectedResultInspection, setSelectedResultInspection] = useState({
    approved: false,
    failed: false,
  });

  console.log("idProject:", Idproject);
  console.log("Dados da inspeção pelo ID: ")

  useEffect(() => {
    if (Idproject) {
      const loadInspectionData = async () => {
        try {
          const inspectionRef = doc(db, "inspections", Idproject);
          const docSnapshot = await getDoc(inspectionRef);

          if (docSnapshot.exists()) {
            const data = docSnapshot.data();

            if (data.testHydrostatic) {
              const testHydrostaticData = data.testHydrostatic;

              console.log("testHydrostaticData completo:", JSON.stringify(testHydrostaticData, null, 2));

              testHydrostaticData.forEach((hydrostaticItem) => {
                if (hydrostaticItem["Execução do teste"]) {
                  hydrostaticItem["Execução do teste"].forEach((executionItem) => {
                    console.log("Item de execução do teste:", executionItem);
                  });
                } else {
                  console.log("Execução do teste está indefinido ou vazio.");
                }

                // Preenchendo os campos
                setDrawing(hydrostaticItem.Desenho || "");
                setProcedure(hydrostaticItem.Procedimento || "");
                setAddendum(hydrostaticItem.Adenda || "");
                setInspectionStandard(hydrostaticItem["Norma de inspeção"] || "");
                setArtReference(hydrostaticItem["ART de refencia"] || "");
                setRevision(hydrostaticItem.Revisao || "");
                setMaterial(hydrostaticItem.Material || "");
                setExecutionList(hydrostaticItem["Execução do teste"] || []);
                setSelectedResultInspection({
                  approved: hydrostaticItem.Resultado === "approved",
                  failed: hydrostaticItem.Resultado === "failed",
                });
              });

            }
          }
        } catch (error) {
          console.log("Erro ao carregar os dados: ", error)
        }
      };
      loadInspectionData()
    }
  }, [Idproject])

  const handleSelectResult = (result) => {
    setSelectedResultInspection({
      approved: result === 'approved',
      failed: result === 'failed',
    });
  };

  const handleSaveTest = (data) => {
    if (editingItemIndex !== null) {
      const updatedList = [...executionList];
      updatedList[editingItemIndex] = data;
      setExecutionList(updatedList);
    } else {
      setExecutionList([...executionList, data]);
    }
    setEditingItemIndex(null);
    setModalPerformingHydrostaticTest(false);
  };

  const saveHydrostaticTestData = async () => {
    const projectData = {
      Desenho: drawing,
      Procedimento: procedure,
      Adenda: addendum,
      "Norma de inspeção": inspectionStandard,
      "ART de refencia": artReference,
      Revisao: revision,
      Material: material,
      "Execução do teste": executionList,
      Resultado: selectedResultInspection.approved ? 'approved' : selectedResultInspection.failed ? 'failed' : 'pending',
    };

    console.log("Dados salvos no teste: ", projectData)

    if (!Idproject) {
      Alert.alert("Erro", "ID do projeto não foi encontrado.");
      return
    }

    try {
      const inspectionRef = doc(db, "inspections", Idproject);
      await updateDoc(inspectionRef, {
        testHydrostatic: arrayUnion(projectData),
      });
      Alert.alert("Sucesso", "Dados do teste hidrostático salvos com sucesso no Firebase!");
    } catch (error) {
      console.error("Erro ao salvar os dados no Firebase: ", error);
      Alert.alert("Erro", "Não foi possível salvar os dados no Firebase.");
    }

    /*     const dir = FileSystem.documentDirectory + `projects/${projectName}/${hydrostaticTest}`;
    const filePath = `${dir}${projectName}.json`;


    try {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(projectData));
      Alert.alert('Sucesso', 'Dados do projeto salvos com sucesso!');
      console.log(filePath, JSON.stringify(projectData))
      navigation.navigate("Inspeção", { projectName: projectName.replace('.json', '') });
    } catch (error) {
      console.error('Erro ao salvar projeto: ', error);
      Alert.alert('Erro', 'Não foi possível salvar o projeto.');
    }
      */

  };

  return (
    <View style={styles.container}>
      <View>
        <ScrollView>
          <EngenieerModal
            modalEngineerVisible={modalEngineerVisible}
            setModalEngineerVisible={setModalEngineerVisible}
            setEngenieer={setEngenieer}
          />

          <Pressable
            style={styles.button}
            onPress={() => setModalEngineerVisible(true)}
          >
            <Helmet name="helmet-safety" size={24} color="black" />
            <Text>{engenieer ? engenieer.name : "Selecione um engenheiro"}</Text>
            <AntDesign name="down" size={24} color="black" />
          </Pressable>


          <TextInput
            style={styles.textAreas}
            placeholder='Desenho'
            value={drawing}
            onChangeText={setDrawing}
          />
          <TextInput
            style={styles.textAreas}
            placeholder='Procedimento'
            value={procedure}
            onChangeText={setProcedure}
          />
          <TextInput
            style={styles.textAreas}
            placeholder='Adenda'
            value={addendum}
            onChangeText={setAddendum}
          />
          <TextInput
            style={styles.textAreas}
            placeholder='Norma de inspeção'
            value={inspectionStandard}
            onChangeText={setInspectionStandard}
          />
          <TextInput
            style={styles.textAreas}
            placeholder='ART de referência'
            value={artReference}
            onChangeText={setArtReference}
          />
          <TextInput
            style={styles.textAreas}
            placeholder='Revisão'
            value={revision}
            onChangeText={setRevision}
          />
          <TextInput
            style={styles.textAreas}
            placeholder='Material do equipamento'
            value={material}
            onChangeText={setMaterial}
          />

          <PerformingHydrostaticTest
            visible={modalPerformingHydrostaticTest}
            setModalVisible={setModalPerformingHydrostaticTest}
            content={editingItemIndex !== null ? executionList[editingItemIndex] : null}
            onSave={handleSaveTest}
          />

          <Pressable style={styles.button} onPress={() => setModalPerformingHydrostaticTest(true)}>
            <AntDesign name="tool" size={24} color="black" />
            <Text>Execução do Teste Hidrostático</Text>
            <AntDesign name="plus" size={24} color="black" />
          </Pressable>

          {executionList.length > 0 && (
            <View style={{
              paddingTop: 0,
              backgroundColor: "#F0F9FF",
              borderRadius: 5,
              paddingBottom: 5
            }}>
              <FlatList
                data={executionList}
                keyExtractor={(item, index) => index.toString()}
                ListHeaderComponent={() => (
                  <View style={{
                    padding: 10,
                    backgroundColor: "#1d4ed8",
                    borderRadius: 5,
                    marginBottom: 5
                  }}>
                    <Text style={{
                      fontWeight: "bold",
                      fontSize: 16,
                      color: "#fff",
                      textAlign: "center",
                    }}>Lista de Testes</Text>
                  </View>

                )}
                renderItem={({ item, index }) => (
                  <View>
                    <View style={{ padding: 10, borderColor: "#E2E8F0", borderWidth: 1, margin: 5, borderRadius: 5 }}>
                      <Text>{item.component} - {item.fluid}</Text>
                      <Text>{item.testDuration} min - {item.testDate}</Text>
                    </View>
                  </View>
                )}
              />
            </View>
          )}

          <Pressable style={styles.button} onPress={() => setModalEngineerVisible(true)}>
            <Helmet name="helmet-safety" size={24} color="black" />
            <Text>Manômetros</Text>
            <AntDesign name="down" size={24} color="black" />
          </Pressable>

          <View>
            <Text style={styles.title}>Situação para aprovação</Text>
            <View style={styles.buttonContainer}>
              <Pressable
                style={[
                  styles.button,
                  selectedResultInspection.approved && styles.selectedButton,
                ]}
                onPress={() => handleSelectResult('approved')}
              >
                <Text
                  style={[
                    styles.buttonText,
                    selectedResultInspection.approved && styles.selectedButtonText,
                  ]}
                >
                  Aprovado
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.button,
                  selectedResultInspection.failed && styles.selectedButton,
                ]}
                onPress={() => handleSelectResult('failed')}
              >
                <Text
                  style={[
                    styles.buttonText,
                    selectedResultInspection.failed && styles.selectedButtonText,
                  ]}
                >
                  Reprovado
                </Text>
              </Pressable>
            </View>
          </View>

          <Pressable style={styles.registerHydrostaticTest} onPress={() => saveHydrostaticTestData()}>
            <Text style={styles.registerTampoInferiorText}>Registrar Teste Hisdrotático</Text>
            <AntDesign name="plus" size={24} color="white" />
          </Pressable>
        </ScrollView>

      </View >
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  textAreas: {
    borderColor: 'gray',
    borderBottomWidth: 1,
    marginBottom: 5,
    paddingVertical: 10,
    borderRadius: 5,
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    width: 'auto',
    minWidth: '45%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: "#7dd3fc",
    paddingVertical: 15,
    paddingHorizontal: 25,
    marginVertical: 10,
    borderRadius: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectedButton: {
    backgroundColor: '#1d4ed8',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginRight: 10,
  },
  selectedButtonText: {
    color: '#fff',
  },
  registerHydrostaticTest: {
    backgroundColor: '#1d4ed8',
    width: '100%',
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  registerTampoInferiorText: {
    color: '#fff',
  },
  imageRow: {
    flexDirection: 'row',
  },
  imageBox: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'gray',
    marginRight: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  addImageBox: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: 'gray',
    marginRight: 10,
  },
  imageText: {
    marginTop: 5,
    color: 'gray',
  },
  closeModal: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    right: '10%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  headerModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleModal: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  textInputModalSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  noClients: {
    marginVertical: 20,
    alignItems: 'center',
  },
  addClientModal: {
    backgroundColor: '#1d4ed8',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addClientText: {
    color: 'white',
    marginRight: 10,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'semibold',
    color: '#000',
  },
});

export default HydrostaticTest;
