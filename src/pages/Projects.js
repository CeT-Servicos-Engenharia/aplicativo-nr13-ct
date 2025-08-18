import React, { useState, useEffect } from "react";
import {
  Alert,
  Modal,
  Pressable,
  TextInput,
  View,
  StyleSheet,
  Text,
  FlatList,
  Platform,
} from "react-native";
import Search from "@expo/vector-icons/FontAwesome";
import Helmet from "@expo/vector-icons/FontAwesome6";
import Archive from "@expo/vector-icons/FontAwesome5";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as FileSystem from "expo-file-system";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../database/firebaseConfig";

const Projects = ({ navigation, route }) => {
  const [isEditMode, setIsEditMode] = useState("");
  const [isIDProjectEditable, setIsIDProjectEditable] = useState("");
  const [modalClientsVisible, setModalClientsVisible] = useState(false);
  const [modalEngineerVisible, setModalEngineerVisible] = useState(false);
  const [modalAnalystVisible, setModalAnalystVisible] = useState(false);
  const [clients, setClients] = useState([]);
  const [engenieers, setEngenieers] = useState([]);
  const [analysts, setAnalysts] = useState([]);
  const [createViewClientsRegisterModal, setCreateViewClientsRegisterModal] =
    useState(false);
  const [loading, setLoading] = useState(true);
  const [regsiterNumProject, setRegisterNumProject] = useState("");

  // Project information states
  const [empresa, setEmpresa] = useState("");
  const [numeroProjeto, setNumeroProjeto] = useState("");
  const [artProjeto, setArtProjeto] = useState("");
  const [descricaoRevisao, setDescricaoRevisao] = useState("");

  // Selection states
  const [client, setClient] = useState("");
  const [engenieer, setEngenieer] = useState("");
  const [analyst, setAnalyst] = useState("");

  const fetchInspectionCount = async () => {
    try {
      const inspectionsCollection = collection(db, "inspections");
      const inspectionsSnapshot = await getDocs(inspectionsCollection);
      const count = inspectionsSnapshot.size;
      setNumeroProjeto((count + 1).toString());
    } catch (error) {
      console.error("Erro ao buscar a quantidade de inspeções:", error);
      Alert.alert("Erro", "Não foi possível buscar a quantidade de inspeções.");
    }
  };

  useEffect(() => {
    fetchInspectionCount();
  }, []);

  useEffect(() => {
    if (route.params?.project) {
      const { project } = route.params;
      setIsEditMode(true);
      setIsIDProjectEditable(project.id);
      setEmpresa(project.empresa || "");
      setRegisterNumProject(project.numeroProjeto || "");
      setArtProjeto(project.artProjeto || "");
      setDescricaoRevisao(project.descricaoRevisao || "");
      setClient(project.client || "");
      setEngenieer(project.engenieer || "");
      setAnalyst(project.analyst || "");
    }
  }, [route.params?.project]);

  const loadClients = async () => {
    try {
      const clientsCollection = collection(db, "clients");
      const clientsQuery = query(
        clientsCollection,
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(clientsQuery);
      const clientsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClients(clientsList);
    } catch (error) {
      console.error("Erro ao carregar clientes: ", error);
      Alert.alert("Erro", "Não foi possível carregar a lista de clientes.");
    }
  };

  const loadEngenieers = async () => {
    try {
      const engeniersCollection = collection(db, "engenieer");
      const engenieersQuery = query(
        engeniersCollection,
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(engenieersQuery);
      const engenieerList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEngenieers(engenieerList);
    } catch (error) {
      console.error("Erro ao carregar engenheiros: ", error);
      Alert.alert("Erro", "Não foi possível carregar a lista de engenheiros.");
    }
  };

  const loadAnalysts = async () => {
    try {
      const analystsCollection = collection(db, "analyst");
      const analystsQuery = query(
        analystsCollection,
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(analystsQuery);
      const analystsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(analystsList);
      setAnalysts(analystsList);
    } catch (error) {
      console.error("Erro ao carregar analistas: ", error);
      Alert.alert("Erro", "Não foi possível carregar a lista de analistas.");
    }
  };

  useEffect(() => {
    if (createViewClientsRegisterModal) {
      loadClients();
    }
    if (modalEngineerVisible) {
      loadEngenieers();
    }
    if (modalAnalystVisible) {
      loadAnalysts();
    }
  }, [
    modalEngineerVisible,
    createViewClientsRegisterModal,
    modalAnalystVisible,
  ]);

  const saveProjectData = async () => {
    const projectData = {
      empresa,
      numeroProjeto,
      artProjeto,
      descricaoRevisao,
      client: client ? client.id : "",
      engenieer,
      analyst,
      revisoes: [],
    };

    if (Platform.OS === "web") {
      try {
        localStorage.setItem(
          `project_${numeroProjeto}`,
          JSON.stringify(projectData)
        );
        console.log("Dados salvos no LocalStorage:", projectData);

        Alert.alert("Sucesso", "Dados do projeto salvos no navegador!");
        navigation.navigate("Equipamento", {
          projectName: numeroProjeto,
          clientId: client ? client.id : "",
        });
      } catch (error) {
        console.error("Erro ao salvar projeto na web: ", error);
        Alert.alert("Erro", "Não foi possível salvar o projeto.");
      }
    } else {
      const dir = FileSystem.documentDirectory + "projects/";
      const filePath = `${dir}${numeroProjeto}.json`;

      try {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
        await FileSystem.writeAsStringAsync(
          filePath,
          JSON.stringify(projectData)
        );

        Alert.alert("Sucesso", "Dados do projeto salvos no cache!");
        navigation.navigate("Equipamento", {
          projectName: numeroProjeto,
          clientId: client ? client.id : "",
        });
      } catch (error) {
        console.error("Erro ao salvar projeto no cache: ", error);
        Alert.alert("Erro", "Não foi possível salvar o projeto.");
      }
    }
  };

  const updateProjectData = async () => {
    const projectData = {
      empresa,
      numeroProjeto,
      artProjeto,
      descricaoRevisao,
      client: client ? client.id : "",
      engenieer,
      analyst,
      createdAt: new Date(),
      revisoes: [],
    };

    try {
      // Atualize os dados no Firestore
      const projectRef = doc(db, "inspections", route.params.project.id);
      await updateDoc(projectRef, projectData);

      if (Platform.OS === "web") {
        alert("Projeto atualizado com sucesso!");
      } else {
        Alert.alert("Sucesso", "Projeto atualizado com sucesso!");
      }

      // Navegue para a próxima página
      navigation.navigate("Equipamento", {
        Idproject: route.params.project.id,
        clientId: client ? client.id : "",
      });
    } catch (error) {
      console.error("Erro ao atualizar o projeto:", error);

      if (Platform.OS === "web") {
        alert("Erro ao atualizar o projeto. Verifique o console.");
      } else {
        Alert.alert("Erro", "Não foi possível atualizar o projeto.");
      }
    }
  };

  const [searchTerm, setSearchTerm] = useState("");

  // Filtra os clientes com base no termo de busca
  const filteredClients = clients.filter((client) =>
    client.person.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEngineers = engenieers.filter(
    (engineer) =>
      engineer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engineer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInspector = analysts.filter(
    (inspector) =>
      inspector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspector.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.containerInfoProjects}>
        <TextInput
          style={styles.textAreas}
          placeholder="Empresa do projeto"
          value={empresa}
          onChangeText={setEmpresa}
        />
        <TextInput
          style={styles.textAreas}
          placeholder="ART do projeto"
          value={artProjeto}
          onChangeText={setArtProjeto}
        />
        <TextInput
          style={styles.textAreas}
          placeholder="Descrição da revisão"
          value={descricaoRevisao}
          onChangeText={setDescricaoRevisao}
        />
        <Text>Número do projeto: {numeroProjeto}</Text>

        {/* Select Client Button */}
        <Pressable
          style={styles.button}
          onPress={() => setCreateViewClientsRegisterModal(true)}
        >
          <AntDesign name="team" size={24} color="black" />
          <Text>{client ? client.name : "Selecione um cliente"}</Text>
          <AntDesign name="down" size={24} color="black" />
        </Pressable>

        <Modal
          visible={createViewClientsRegisterModal}
          transparent={true}
          onRequestClose={() => setCreateViewClientsRegisterModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContainerInternal}>
              <Text style={styles.title}>Clientes cadastrados</Text>
              <View style={styles.textInputModalSearch}>
                <Search
                  name="search"
                  size={24}
                  color="gray"
                  style={{ paddingRight: 10 }}
                />
                <TextInput
                  placeholder="Procurar"
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                />
              </View>

              {filteredClients.length > 0 ? (
                <FlatList
                  data={filteredClients}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => {
                        setClient({ id: item.id, name: item.person });
                        setCreateViewClientsRegisterModal(false);
                      }}
                    >
                      <View style={styles.lineClientsInOpen}>
                        <Text>{item.person}</Text>
                      </View>
                    </Pressable>
                  )}
                />
              ) : (
                <Text style={styles.noClientsText}>
                  Nenhum cliente cadastrado.
                </Text>
              )}

              <Pressable
                style={styles.closeButton}
                onPress={() => setCreateViewClientsRegisterModal(false)}
              >
                <Text>Fechar</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Select Engineer Button */}
        <Pressable
          style={styles.button}
          onPress={() => setModalEngineerVisible(true)}
        >
          <Helmet name="helmet-safety" size={24} color="black" />
          <Text>{engenieer ? engenieer.name : "Selecione um engenheiro"}</Text>
          <AntDesign name="down" size={24} color="black" />
        </Pressable>

        {/* Select Analyst Button */}
        <Pressable
          style={styles.button}
          onPress={() => setModalAnalystVisible(true)}
        >
          <Archive name="archive" size={24} color="black" />
          <Text>{analyst ? analyst.name : "Selecione um analista"}</Text>
          <AntDesign name="down" size={24} color="black" />
        </Pressable>

        {/* Save Project Button */}
        <Pressable
          style={styles.button}
          onPress={isEditMode ? updateProjectData : saveProjectData}
        >
          <Text>
            {isEditMode ? "Atualizar dados do projeto" : "Criar projeto"}
          </Text>
          <AntDesign name="plus" size={24} color="black" />
        </Pressable>
      </View>

      {/* Modal for Engineers */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalEngineerVisible}
        onRequestClose={() => setModalEngineerVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.overlay} />
          <View style={styles.modalContent}>
            <View style={styles.headerModal}>
              <Text style={styles.titleModal}>Selecionar Engenheiro</Text>
              <Pressable
                style={styles.closeModal}
                onPress={() => setModalEngineerVisible(false)}
              >
                <AntDesign name="closecircle" size={24} color="red" />
              </Pressable>
            </View>
            <View style={styles.textInputModalSearch}>
              <Search
                name="search"
                size={24}
                color="gray"
                style={{ paddingRight: 10 }}
              />
              <TextInput
                placeholder="Procurar"
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>

            {filteredEngineers.length > 0 ? (
              <FlatList
                data={filteredEngineers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      setEngenieer({ id: item.id, name: item.name });
                      setModalEngineerVisible(false);
                    }}
                  >
                    <View style={styles.lineClientsInOpen}>
                      <Text>{item.name}</Text>
                      <Text>{item.email}</Text>
                    </View>
                  </Pressable>
                )}
              />
            ) : (
              <Text style={styles.noClientsText}>Nenhum engenheiro encontrado.</Text>
            )}

            <Pressable
              style={styles.addClientModal}
              onPress={() => navigation.navigate("Cadastro de Engenheiro")}
            >
              <Text style={styles.addClientText}>Cadastrar Engenehiro</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal for Analysts */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalAnalystVisible}
        onRequestClose={() => setModalAnalystVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.overlay} />
          <View style={styles.modalContent}>
            <View style={styles.headerModal}>
              <Text style={styles.titleModal}>Selecionar Inspetor</Text>
              <Pressable
                style={styles.closeModal}
                onPress={() => setModalAnalystVisible(false)}
              >
                <AntDesign name="closecircle" size={24} color="red" />
              </Pressable>
            </View>
            <View style={styles.textInputModalSearch}>
              <Search
                name="search"
                size={24}
                color="gray"
                style={{ paddingRight: 10 }}
              />
              <TextInput
                placeholder="Procurar"
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>

            {filteredInspector.length > 0 ? (
              <FlatList
                data={filteredInspector}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      setAnalyst({ id: item.id, name: item.name });
                      setModalAnalystVisible(false);
                    }}
                  >
                    <View style={styles.lineClientsInOpen}>
                      <Text>{item.name}</Text>
                      <Text>{item.email}</Text>
                    </View>
                  </Pressable>
                )}
              />
            ) : (
              <Text style={styles.noClientsText}>Nenhum engenheiro encontrado.</Text>
            )}

            <Pressable
              style={styles.addClientModal}
              onPress={() => {
                navigation.navigate("Cadastro de Analista");
                setModalAnalystVisible(false);
              }}
            >
              <Text style={styles.addClientText}>Cadastrar Analista</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  containerInfoProjects: {
    flex: 1,
    justifyContent: "space-between",
  },
  textAreas: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#007BFF",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainerInternal: {
    width: "90%",
    height: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  lineClientsInOpen: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  noClientsText: {
    textAlign: "center",
    marginTop: 20,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f44336",
    borderRadius: 5,
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    margin: 20,
    width: "80%",
    alignItems: "center",
  },
  headerModal: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  closeModal: {
    padding: 10,
  },
  titleModal: {
    fontSize: 20,
    fontWeight: "bold",
  },
  textInputModalSearch: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    width: "100%",
    marginVertical: 10,
  },
  addClientModal: {
    backgroundColor: "#007BFF",
    borderRadius: 5,
    padding: 10,
    width: "100%",
    marginVertical: 10,
    alignItems: "center",
  },
  addClientText: {
    color: "#fff",
  },
});

export default Projects;
