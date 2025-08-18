import React, { useState, useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Image, Alert, Platform, Dimensions } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import Helmet from '@expo/vector-icons/FontAwesome6';
import Search from '@expo/vector-icons/FontAwesome';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../database/firebaseConfig";
import EngenieerModal from "../components/modal/EngenieerModal";

const MedicalRecord = ({ route, navigation }) => {
  const { projectName, updateMedicalRecordData, Idproject } = route.params || {};
  
  const [modalEngineerVisible, setModalEngineerVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedEngineer, setSelectedEngineer] = useState(null);

  // Detectar se é web e obter dimensões da tela
  const isWeb = Platform.OS === 'web';
  const { width: screenWidth } = Dimensions.get('window');
  const isLargeScreen = screenWidth > 768;

  // Estados para os dados do equipamento
  const [pressaoProjeto, setPressaoProjeto] = useState('');
  const [pressaoMaximaOperacao, setPressaoMaximaOperacao] = useState('');
  const [pressaoInterna, setPressaoInterna] = useState('');
  const [pressaoExterna, setPressaoExterna] = useState('');
  const [temperaturaMinima, setTemperaturaMinima] = useState('');
  const [temperaturaMaxima, setTemperaturaMaxima] = useState('');
  const [pesoTotal, setPesoTotal] = useState('');
  const [pesoVazio, setPesoVazio] = useState('');
  const [diametroNominalInterno, setDiametroNominalInterno] = useState('');
  const [pmtaCasco, setPmtaCasco] = useState('');
  const [pmtaTampo, setPmtaTampo] = useState('');

  // Estados para materiais
  const [materialPes, setMaterialPes] = useState('');
  const [materialBase, setMaterialBase] = useState('');
  const [materialLuvas, setMaterialLuvas] = useState('');

  // Estados para soldas tampo/casco
  const [soldaTampoCascoLocal, setSoldaTampoCascoLocal] = useState('');
  const [soldaTampoCascoCodigo, setSoldaTampoCascoCodigo] = useState('');
  const [soldaTampoCascoMetodo, setSoldaTampoCascoMetodo] = useState('');
  const [soldaTampoCascoEficiencia, setSoldaTampoCascoEficiencia] = useState('');
  const [soldaTampoCascoRadiografia, setSoldaTampoCascoRadiografia] = useState('');

  // Estados para soldas casco/casco
  const [soldaCascoCascoLocal, setSoldaCascoCascoLocal] = useState('');
  const [soldaCascoCascoCodigo, setSoldaCascoCascoCodigo] = useState('');
  const [soldaCascoCascoMetodo, setSoldaCascoCascoMetodo] = useState('');
  const [soldaCascoCascoEficiencia, setSoldaCascoCascoEficiencia] = useState('');
  const [soldaCascoCascoRadiografia, setSoldaCascoCascoRadiografia] = useState('');

  // Estados para procedimentos e precauções
  const [procedimentosInspecao, setProcedimentosInspecao] = useState('');
  const [precaucoes, setPrecaucoes] = useState('');

  // Carregar dados existentes se for edição
  useEffect(() => {
    if (updateMedicalRecordData) {
      setPressaoProjeto(updateMedicalRecordData.pressaoProjeto || '');
      setPressaoMaximaOperacao(updateMedicalRecordData.pressaoMaximaOperacao || '');
      setPressaoInterna(updateMedicalRecordData.pressaoInterna || '');
      setPressaoExterna(updateMedicalRecordData.pressaoExterna || '');
      setTemperaturaMinima(updateMedicalRecordData.temperaturaMinima || '');
      setTemperaturaMaxima(updateMedicalRecordData.temperaturaMaxima || '');
      setPesoTotal(updateMedicalRecordData.pesoTotal || '');
      setPesoVazio(updateMedicalRecordData.pesoVazio || '');
      setDiametroNominalInterno(updateMedicalRecordData.diametroNominalInterno || '');
      setPmtaCasco(updateMedicalRecordData.pmtaCasco || '');
      setPmtaTampo(updateMedicalRecordData.pmtaTampo || '');
      setMaterialPes(updateMedicalRecordData.materialPes || '');
      setMaterialBase(updateMedicalRecordData.materialBase || '');
      setMaterialLuvas(updateMedicalRecordData.materialLuvas || '');
      setSoldaTampoCascoLocal(updateMedicalRecordData.soldaTampoCascoLocal || '');
      setSoldaTampoCascoCodigo(updateMedicalRecordData.soldaTampoCascoCodigo || '');
      setSoldaTampoCascoMetodo(updateMedicalRecordData.soldaTampoCascoMetodo || '');
      setSoldaTampoCascoEficiencia(updateMedicalRecordData.soldaTampoCascoEficiencia || '');
      setSoldaTampoCascoRadiografia(updateMedicalRecordData.soldaTampoCascoRadiografia || '');
      setSoldaCascoCascoLocal(updateMedicalRecordData.soldaCascoCascoLocal || '');
      setSoldaCascoCascoCodigo(updateMedicalRecordData.soldaCascoCascoCodigo || '');
      setSoldaCascoCascoMetodo(updateMedicalRecordData.soldaCascoCascoMetodo || '');
      setSoldaCascoCascoEficiencia(updateMedicalRecordData.soldaCascoCascoEficiencia || '');
      setSoldaCascoCascoRadiografia(updateMedicalRecordData.soldaCascoCascoRadiografia || '');
             setProcedimentosInspecao(updateMedicalRecordData.procedimentosInspecao || '');
       setPrecaucoes(updateMedicalRecordData.precaucoes || '');
       setSelectedEngineer(updateMedicalRecordData.selectedEngineer || null);
    }
  }, [updateMedicalRecordData]);

  // Carregar dados do Firebase se for edição
  useEffect(() => {
    if (Idproject) {
      setIsEdit(true);
      const loadMedicalRecordData = async () => {
        try {
          const inspectionRef = doc(db, "inspections", Idproject);
          const docSnapshot = await getDoc(inspectionRef);

          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            const medicalData = data.inspection.medicalRecord || {};
            
            setPressaoProjeto(medicalData.pressaoProjeto || '');
            setPressaoMaximaOperacao(medicalData.pressaoMaximaOperacao || '');
            setPressaoInterna(medicalData.pressaoInterna || '');
            setPressaoExterna(medicalData.pressaoExterna || '');
            setTemperaturaMinima(medicalData.temperaturaMinima || '');
            setTemperaturaMaxima(medicalData.temperaturaMaxima || '');
            setPesoTotal(medicalData.pesoTotal || '');
            setPesoVazio(medicalData.pesoVazio || '');
            setDiametroNominalInterno(medicalData.diametroNominalInterno || '');
            setPmtaCasco(medicalData.pmtaCasco || '');
            setPmtaTampo(medicalData.pmtaTampo || '');
            setMaterialPes(medicalData.materialPes || '');
            setMaterialBase(medicalData.materialBase || '');
            setMaterialLuvas(medicalData.materialLuvas || '');
            setSoldaTampoCascoLocal(medicalData.soldaTampoCascoLocal || '');
            setSoldaTampoCascoCodigo(medicalData.soldaTampoCascoCodigo || '');
            setSoldaTampoCascoMetodo(medicalData.soldaTampoCascoMetodo || '');
            setSoldaTampoCascoEficiencia(medicalData.soldaTampoCascoEficiencia || '');
            setSoldaTampoCascoRadiografia(medicalData.soldaTampoCascoRadiografia || '');
            setSoldaCascoCascoLocal(medicalData.soldaCascoCascoLocal || '');
            setSoldaCascoCascoCodigo(medicalData.soldaCascoCascoCodigo || '');
            setSoldaCascoCascoMetodo(medicalData.soldaCascoCascoMetodo || '');
            setSoldaCascoCascoEficiencia(medicalData.soldaCascoCascoEficiencia || '');
            setSoldaCascoCascoRadiografia(medicalData.soldaCascoCascoRadiografia || '');
            setProcedimentosInspecao(medicalData.procedimentosInspecao || '');
            setPrecaucoes(medicalData.precaucoes || '');
            setSelectedEngineer(medicalData.selectedEngineer || null);
          }
        } catch (error) {
          console.error("Erro ao carregar dados do prontuário:", error);
        }
      };
      loadMedicalRecordData();
    }
  }, [Idproject]);

  const collectMedicalRecordData = () => {
    const medicalRecordData = {
      pressaoProjeto,
      pressaoMaximaOperacao,
      pressaoInterna,
      pressaoExterna,
      temperaturaMinima,
      temperaturaMaxima,
      pesoTotal,
      pesoVazio,
      diametroNominalInterno,
      pmtaCasco,
      pmtaTampo,
      materialPes,
      materialBase,
      materialLuvas,
      soldaTampoCascoLocal,
      soldaTampoCascoCodigo,
      soldaTampoCascoMetodo,
      soldaTampoCascoEficiencia,
      soldaTampoCascoRadiografia,
      soldaCascoCascoLocal,
      soldaCascoCascoCodigo,
      soldaCascoCascoMetodo,
      soldaCascoCascoEficiencia,
      soldaCascoCascoRadiografia,
      procedimentosInspecao,
      precaucoes,
      selectedEngineer,
    };

    navigation.navigate('Inspeção', { 
      projectName, 
      Idproject,
      updateMedicalRecordData: medicalRecordData 
    });
    
    console.log("Dados do prontuário coletados e enviados:", medicalRecordData);
    return medicalRecordData;
  };

  const updateMedicalRecordDataInDb = async () => {
    if (!Idproject) {
      Alert.alert("Erro", "Não foi possível atualizar dados do prontuário, tente novamente.");
      return;
    }
    
    const medicalRecordData = {
      pressaoProjeto,
      pressaoMaximaOperacao,
      pressaoInterna,
      pressaoExterna,
      temperaturaMinima,
      temperaturaMaxima,
      pesoTotal,
      pesoVazio,
      diametroNominalInterno,
      pmtaCasco,
      pmtaTampo,
      materialPes,
      materialBase,
      materialLuvas,
      soldaTampoCascoLocal,
      soldaTampoCascoCodigo,
      soldaTampoCascoMetodo,
      soldaTampoCascoEficiencia,
      soldaTampoCascoRadiografia,
      soldaCascoCascoLocal,
      soldaCascoCascoCodigo,
      soldaCascoCascoMetodo,
      soldaCascoCascoEficiencia,
      soldaCascoCascoRadiografia,
      procedimentosInspecao,
      precaucoes,
      selectedEngineer,
    };

    navigation.navigate('Inspeção', { 
      Idproject, 
      updateMedicalRecordData: medicalRecordData 
    });
    
    console.log("Dados do prontuário atualizados:", medicalRecordData);
    return medicalRecordData;
  };

  return (
    <View style={[styles.container, isWeb && isLargeScreen && styles.webContainer]}>
      <View style={[{ width: '100%' }, isWeb && isLargeScreen && { maxWidth: 800 }]}>
        <ScrollView 
          style={[
            isWeb ? { height: '100vh', paddingHorizontal: 0 } : {},
          ]}
          contentContainerStyle={[
            { paddingBottom: 50 },
            isWeb && { paddingBottom: 100 }
          ]}
          showsVerticalScrollIndicator={!isWeb}
        >
          <Pressable 
            style={[styles.button, isWeb && { cursor: 'pointer' }]} 
            onPress={() => setModalEngineerVisible(true)}
          >
            <Helmet name="helmet-safety" size={24} color="black" />
            <Text style={isWeb ? { fontSize: 16 } : {}}>
              {selectedEngineer ? selectedEngineer.name : "Selecione um engenheiro"}
            </Text>
            <AntDesign name="down" size={24} color="black" />
          </Pressable>

          <EngenieerModal
            modalEngineerVisible={modalEngineerVisible}
            setModalEngineerVisible={setModalEngineerVisible}
            setEngenieer={setSelectedEngineer}
          />

          <View>
            <Text style={styles.title}>DADOS DO EQUIPAMENTO</Text>
            <TextInput 
              style={[styles.textAreas, isWeb && { borderColor: '#d1d5db' }]} 
              placeholder='Pressão de projeto' 
              value={pressaoProjeto}
              onChangeText={setPressaoProjeto}
            />
            <TextInput 
              style={[styles.textAreas, isWeb && { borderColor: '#d1d5db' }]} 
              placeholder='Pressão máxima de operação' 
              value={pressaoMaximaOperacao}
              onChangeText={setPressaoMaximaOperacao}
            />
            <TextInput 
              style={[styles.textAreas, isWeb && { borderColor: '#d1d5db' }]} 
              placeholder='Pressão interna' 
              value={pressaoInterna}
              onChangeText={setPressaoInterna}
            />
            <TextInput 
              style={[styles.textAreas, isWeb && { borderColor: '#d1d5db' }]} 
              placeholder='Pressão externa' 
              value={pressaoExterna}
              onChangeText={setPressaoExterna}
            />
            <TextInput 
              style={[styles.textAreas, isWeb && { borderColor: '#d1d5db' }]} 
              placeholder='Temperatura mínima' 
              value={temperaturaMinima}
              onChangeText={setTemperaturaMinima}
            />
            <TextInput 
              style={[styles.textAreas, isWeb && { borderColor: '#d1d5db' }]} 
              placeholder='Temperatura máxima' 
              value={temperaturaMaxima}
              onChangeText={setTemperaturaMaxima}
            />
            <TextInput 
              style={[styles.textAreas, isWeb && { borderColor: '#d1d5db' }]} 
              placeholder='Peso total' 
              value={pesoTotal}
              onChangeText={setPesoTotal}
            />
            <TextInput 
              style={[styles.textAreas, isWeb && { borderColor: '#d1d5db' }]} 
              placeholder='Peso vazio' 
              value={pesoVazio}
              onChangeText={setPesoVazio}
            />
            <TextInput 
              style={[styles.textAreas, isWeb && { borderColor: '#d1d5db' }]} 
              placeholder='Diâmetro nominal interno' 
              value={diametroNominalInterno}
              onChangeText={setDiametroNominalInterno}
            />
            <TextInput 
              style={[styles.textAreas, isWeb && { borderColor: '#d1d5db' }]} 
              placeholder='PMTA casco' 
              value={pmtaCasco}
              onChangeText={setPmtaCasco}
            />
            <TextInput 
              style={[styles.textAreas, isWeb && { borderColor: '#d1d5db' }]} 
              placeholder='PMTA tampo' 
              value={pmtaTampo}
              onChangeText={setPmtaTampo}
            />
          </View>

          <View>
            <Text style={styles.title}>MATERIAIS</Text>
            <TextInput 
              style={[styles.textAreas, isWeb && { borderColor: '#d1d5db' }]} 
              placeholder='Pés' 
              value={materialPes}
              onChangeText={setMaterialPes}
            />
            <TextInput 
              style={[styles.textAreas, isWeb && { borderColor: '#d1d5db' }]} 
              placeholder='Base' 
              value={materialBase}
              onChangeText={setMaterialBase}
            />
            <TextInput 
              style={[styles.textAreas, isWeb && { borderColor: '#d1d5db' }]} 
              placeholder='Luvas, tubos e / ou bocais' 
              value={materialLuvas}
              onChangeText={setMaterialLuvas}
            />
          </View>

          <View>
            <Text style={styles.title}>ASPECTOS CONSTRUTIVOS</Text>
            <Text style={styles.title}>SOLDAS TAMPO/CASCO</Text>
            <TextInput 
              style={[styles.textAreas, isWeb && { borderColor: '#d1d5db' }]} 
              placeholder='Local' 
              value={soldaTampoCascoLocal}
              onChangeText={setSoldaTampoCascoLocal}
            />
            <TextInput 
              style={[styles.textAreas, isWeb && { borderColor: '#d1d5db' }]} 
              placeholder='Código Projeto' 
              value={soldaTampoCascoCodigo}
              onChangeText={setSoldaTampoCascoCodigo}
            />
            <TextInput 
              style={[styles.textAreas, isWeb && { borderColor: '#d1d5db' }]} 
              placeholder='Método' 
              value={soldaTampoCascoMetodo}
              onChangeText={setSoldaTampoCascoMetodo}
            />
            <TextInput 
              style={[styles.textAreas, isWeb && { borderColor: '#d1d5db' }]} 
              placeholder='Eficiência' 
              value={soldaTampoCascoEficiencia}
              onChangeText={setSoldaTampoCascoEficiencia}
            />
            <TextInput 
              style={[styles.textAreas, isWeb && { borderColor: '#d1d5db' }]} 
              placeholder='Radiografia' 
              value={soldaTampoCascoRadiografia}
              onChangeText={setSoldaTampoCascoRadiografia}
            />

            <Text style={styles.title}>SOLDAS CASCO/CASCO</Text>
            <TextInput 
              style={[styles.textAreas, isWeb && { borderColor: '#d1d5db' }]} 
              placeholder='Local' 
              value={soldaCascoCascoLocal}
              onChangeText={setSoldaCascoCascoLocal}
            />
            <TextInput 
              style={[styles.textAreas, isWeb && { borderColor: '#d1d5db' }]} 
              placeholder='Código Projeto' 
              value={soldaCascoCascoCodigo}
              onChangeText={setSoldaCascoCascoCodigo}
            />
            <TextInput 
              style={[styles.textAreas, isWeb && { borderColor: '#d1d5db' }]} 
              placeholder='Método' 
              value={soldaCascoCascoMetodo}
              onChangeText={setSoldaCascoCascoMetodo}
            />
            <TextInput 
              style={[styles.textAreas, isWeb && { borderColor: '#d1d5db' }]} 
              placeholder='Eficiência' 
              value={soldaCascoCascoEficiencia}
              onChangeText={setSoldaCascoCascoEficiencia}
            />
            <TextInput 
              style={[styles.textAreas, isWeb && { borderColor: '#d1d5db' }]} 
              placeholder='Radiografia' 
              value={soldaCascoCascoRadiografia}
              onChangeText={setSoldaCascoCascoRadiografia}
            />
          </View>

          <View>
            <Text style={styles.title}>PROCEDIMENTOS DE INSPEÇÃO</Text>
            <TextInput 
              style={[styles.textAreas, isWeb && { borderColor: '#d1d5db', minHeight: 80 }]} 
              placeholder='Procedimentos de Inspeção'
              value={procedimentosInspecao}
              multiline
              onChangeText={setProcedimentosInspecao}
            />
          </View>

          <View>
            <Text style={styles.title}>PRECAUÇÕES</Text>
            <TextInput 
              style={[styles.textAreas, isWeb && { borderColor: '#d1d5db', minHeight: 80 }]} 
              placeholder='Precauções'
              value={precaucoes}
              multiline
              onChangeText={setPrecaucoes}
            />
          </View>
          
          <Pressable 
            style={styles.registerTampoInferior}
            onPress={isEdit ? updateMedicalRecordDataInDb : collectMedicalRecordData}
          >
            <Text style={styles.registerTampoInferiorText}>
              {isEdit ? "Atualizar Prontuário" : "Criar Prontuário"}
            </Text>
            <AntDesign name="plus" size={24} color="white" />
          </Pressable>
        </ScrollView>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: Platform.OS === 'web' ? 20 : 20,
    alignItems: 'center',
    maxWidth: Platform.OS === 'web' ? 800 : '100%',
    alignSelf: 'center',
  },
  textAreas: {
    borderColor: 'gray',
    borderBottomWidth: 1,
    marginBottom: Platform.OS === 'web' ? 10 : 5,
    paddingVertical: Platform.OS === 'web' ? 12 : 10,
    paddingHorizontal: Platform.OS === 'web' ? 8 : 0,
    borderRadius: 5,
    fontSize: Platform.OS === 'web' ? 16 : 14,
    ...(Platform.OS === 'web' && {
      outlineStyle: 'none',
      borderWidth: 1,
      borderBottomWidth: 1,
    }),
  },
  title: {
    textAlign: 'center',
    fontSize: Platform.OS === 'web' ? 20 : 18,
    fontWeight: 'bold',
    backgroundColor: '#1d4ed8',
    color: 'white',
    padding: Platform.OS === 'web' ? 15 : 10,
    borderRadius: 10,
    marginBottom: Platform.OS === 'web' ? 15 : 10,
    marginTop: Platform.OS === 'web' ? 10 : 0,
  },
  button: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: "#7dd3fc",
    paddingVertical: Platform.OS === 'web' ? 15 : 20,
    paddingHorizontal: Platform.OS === 'web' ? 15 : 20,
    marginVertical: 10,
    borderRadius: 10,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    }),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: Platform.OS === 'web' ? 'wrap' : 'nowrap',
  },
  selectedButton: {
    backgroundColor: '#1d4ed8',
    paddingVertical: Platform.OS === 'web' ? 12 : 15,
    paddingHorizontal: Platform.OS === 'web' ? 15 : 20,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: Platform.OS === 'web' ? 10 : 0,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  selectedButtonText: {
    color: '#fff',
    fontSize: Platform.OS === 'web' ? 16 : 14,
  },
  registerTampoInferior: {
    backgroundColor: '#1d4ed8',
    width: Platform.OS === 'web' ? '100%' : '90%',
    margin: Platform.OS === 'web' ? 0 : 10,
    marginTop: Platform.OS === 'web' ? 20 : 10,
    marginBottom: Platform.OS === 'web' ? 20 : 10,
    padding: Platform.OS === 'web' ? 15 : 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    }),
  },
  registerTampoInferiorText: {
    color: '#fff',
    fontSize: Platform.OS === 'web' ? 16 : 14,
    fontWeight: Platform.OS === 'web' ? '600' : 'normal',
  },
  imageRow: {
    flexDirection: 'row',
    flexWrap: Platform.OS === 'web' ? 'wrap' : 'nowrap',
  },
  imageBox: {
    width: Platform.OS === 'web' ? 120 : 100,
    height: Platform.OS === 'web' ? 120 : 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'gray',
    marginRight: 10,
    marginBottom: Platform.OS === 'web' ? 10 : 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  addImageBox: {
    justifyContent: 'center',
    alignItems: 'center',
    width: Platform.OS === 'web' ? 120 : 100,
    height: Platform.OS === 'web' ? 120 : 100,
    borderWidth: 1,
    borderColor: 'gray',
    marginRight: 10,
    marginBottom: Platform.OS === 'web' ? 10 : 0,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  imageText: {
    marginTop: 5,
    color: 'gray',
    fontSize: Platform.OS === 'web' ? 14 : 12,
  },
  webContainer: {
    minHeight: '100vh',
    justifyContent: 'flex-start',
    paddingVertical: 20,
  },
});

export default MedicalRecord;
