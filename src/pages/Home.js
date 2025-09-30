import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Text,
  Pressable,
  View,
  StyleSheet,
  Modal,
  FlatList,
  Alert,
  TextInput,
  LogBox,
  Platform,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Fontisto from "@expo/vector-icons/Fontisto";
import Plus from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import * as FileSystem from "expo-file-system";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
} from "firebase/firestore";
import { db, storage } from "../../database/firebaseConfig";
import ClientsModal from "../components/modal/ClientsModal";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const Home = ({ navigation }) => {
  LogBox.ignoreAllLogs();

  const [clients, setClients] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [createOrContinueProjectModal, setcreateOrContinueProjectModal] =
    useState(false);
  const [
    createRegisterOrViewClientsModal,
    setCreateRegisterOrViewClientsModal,
  ] = useState(false);
  const [createViewClientsRegisterModal, setCreateViewClientsRegisterModal] =
    useState(false);
  const [projectCount, setProjectCount] = useState(0);
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedProjectData, setSelectedProjectData] = useState(null);
  const [currentProjectName, setCurrentProjectName] = useState(null);


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
      console.log(clientsList); // Verifique o que está sendo retornado
      setClients(clientsList);
    } catch (error) {
      console.error("Erro ao carregar clientes: ", error);
      Alert.alert("Erro", "Não foi possível carregar a lista de clientes.");
    }
  };

  useEffect(() => {
    if (createViewClientsRegisterModal) {
      loadClients();
    }
  }, [createViewClientsRegisterModal]);
  useFocusEffect(
    useCallback(() => {
      const loadProjects = async () => {
        const dir = FileSystem.documentDirectory + "projects/";
        try {
          const files = await FileSystem.readDirectoryAsync(dir);
          setProjects(files);
          setProjectCount(files.length);
        } catch (error) {
          console.error("Erro ao carregar os projetos: ", error);
          setProjects([]);
        }
      };
      loadProjects();
      setModalVisible(false);
    }, [])
  );

  const createNewProject = async () => {
    if (Platform.OS === 'web') {
      const existingProjects = JSON.parse(localStorage.getItem('projects')) || [];
      const newProject = { name: newProjectName, data: {} };
      localStorage.setItem('projects', JSON.stringify([...existingProjects, newProject]));
      setProjects([...projects, newProject]);
      setProjectCount(projectCount + 1);
      setNewProjectName("");
      setcreateOrContinueProjectModal(false);
      navigation.navigate("Projetos");
    } else {
      const dir = FileSystem.documentDirectory + "projects/";
      const filePath = `${dir}${newProjectName}.json`;
      try {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
        await FileSystem.writeAsStringAsync(
          filePath,
          JSON.stringify({ name: newProjectName, data: {} })
        );
        setProjects([...projects, `${newProjectName}.json`]);
        setProjectCount(projectCount + 1);
        setNewProjectName("");
        setcreateOrContinueProjectModal(false);
        navigation.navigate("Projetos");
      } catch (error) {
        console.error("Erro ao criar projeto: ", error);
        Alert.alert("Erro", "Não foi possível criar o projeto.");
      }
    }
  };

  const [selectedClient, setSelectedClient] = useState(null);
  const [isClientModalVisible, setIsClientModalVisible] = useState(false);

  const uploadInspectionToFirebase = async (projectName) => {
    try {
      const dirPath = `${FileSystem.documentDirectory}projects/`;
      const filePath = `${dirPath}${projectName}`;

      // Verifica se o arquivo existe
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (!fileInfo.exists) {
        console.log("Arquivo não encontrado:", filePath);
        Alert.alert("Erro", "Arquivo de inspeção não encontrado.");
        return;
      }
      else {
        console.log("ProjectName do arquivo json: ", projectName);
      }

      // Lê o arquivo JSON
      const jsonData = await FileSystem.readAsStringAsync(filePath);
      const inspectionData = JSON.parse(jsonData);

      console.log("Inspeção a ser salva: ", inspectionData);

      setCurrentProjectName(projectName);

      setIsClientModalVisible(true);

    } catch (error) {
      console.error("Erro ao enviar inspeção para o Firebase:", error);
      Alert.alert("Erro", "Falha ao enviar inspeção. Verifique o console.");
    }
  };

  const handleSelectClient = async (client) => {
    try {
      const dir = FileSystem.documentDirectory + "projects/";

      console.log("🛠️ Cliente selecionado:", client);
      console.log("📁 ProjectName carregado:", currentProjectName);

      const filePath = `${dir}${currentProjectName}`;
      const jsonData = await FileSystem.readAsStringAsync(filePath);
      let inspectionData = JSON.parse(jsonData);

      // 🛠️ Ajuste para salvar apenas o ID do cliente
      inspectionData.client = client.id;
      inspectionData.clientId = client.id; // Mantendo compatibilidade

      if (inspectionData.images?.length) {
        const localImages = inspectionData.images.filter((uri) =>
          uri.startsWith("file:///")
        );

        if (localImages.length > 0) {
          console.log("📤 Fazendo upload das imagens...");
          const uploadedImageUrls = await uploadImagesToStorage(localImages);

          // 🔹 Substituir imagens locais pelos links do Firebase
          inspectionData.images = uploadedImageUrls;
        }
      }

      // Salva no Firebase
      await addDoc(collection(db, "inspections"), inspectionData);

      console.log("✅ Inspeção enviada com sucesso:", currentProjectName);
      Alert.alert("Sucesso", "Inspeção enviada ao Firebase!");

      await FileSystem.deleteAsync(filePath, { idempotent: true });
      console.log("🗑️ Arquivo local removido:", filePath);

      // Atualiza o estado
      setSelectedClient(client);
      setIsClientModalVisible(false);
    } catch (error) {
      console.error("❌ Erro ao salvar cliente na inspeção:", error);
    }
  };

  const uploadImagesToStorage = async (imageUris) => {
    const imageUrls = await Promise.all(
      imageUris.map(async (uri, index) => {
        try {
          const imageRef = ref(
            storage,
            `inspections/image_${Date.now()}_${index}.jpg`
          );

          // Buscar o arquivo como blob
          const response = await fetch(uri);
          const blob = await response.blob();

          // Determinar o tipo MIME
          const contentType = blob.type || "image/jpeg";

          // Upload com metadata
          const metadata = { contentType };
          await uploadBytes(imageRef, blob, metadata);

          // Obter a URL de download
          const downloadURL = await getDownloadURL(imageRef);
          return downloadURL;
        } catch (error) {
          console.error("Erro no upload de imagem:", error);
          throw error;
        }
      })
    );
    return imageUrls;
  };

  const registerClient = () => {
    try {
      navigation.navigate("Cadastro de Cliente");
      setCreateRegisterOrViewClientsModal(false);
    } catch (e) {
      Alert.error(error);
    }
  };

  const openProject = async (project) => {
    try {
      if (project) {
        setModalVisible(false);
        navigation.navigate("Equipamento", {
          projectName: project.replace(".json", ""),
        });
      } else {
        Alert.alert("Erro", "O projeto não foi encontrado ou não existe.");
      }
    } catch (error) {
      console.error("Erro ao abrir o projeto: ", error);
      Alert.alert("Erro", "Houve um problema ao tentar abrir o projeto.");
    }
  };

  const deleteProject = async (project) => {
    Alert.alert(
      "Atenção",
      "Tem certeza que deseja excluir este projeto? Não será possível recupera-lo",
      [
        {
          text: "Cancelar",
          onPress: () => console.log("Não vai ser excluido"),
        },
        {
          text: "Excluir",
          onPress: async () => {
            try {
              const dir = FileSystem.documentDirectory + "projects/";
              const filePath = `${dir}${project}`;

              await FileSystem.deleteAsync(filePath);

              const updatedProject = projects.filter((p) => p !== project);
              setProjects(updatedProject);
              setProjectCount(updatedProject.length);

              console.log("Foi de X");
            } catch (error) {
              console.log(error);
              Alert.error(
                "Erro",
                `Não foi possivel excluir o projeto ${error}`
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.button}
        onPress={() => setCreateRegisterOrViewClientsModal(true)}
      >
        <AntDesign name="book" size={24} color="black" />
        <Text>Encontrar Clientes</Text>
        <Fontisto name="zoom" size={24} color="black" />
      </Pressable>

      <Modal
        visible={createRegisterOrViewClientsModal}
        transparent={true}
        onRequestClose={() => setCreateRegisterOrViewClientsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContainerInternal}>
            <Text style={styles.title}>Clientes</Text>
            <Pressable style={styles.button} onPress={registerClient}>
              <Text>Cadastrar Cliente</Text>
            </Pressable>

            <Pressable
              style={styles.button}
              onPress={() => setCreateViewClientsRegisterModal(true)}
            >
              <Text>Clientes cadastrados</Text>
            </Pressable>

            <Pressable
              style={styles.closeButton}
              onPress={() => setCreateRegisterOrViewClientsModal(false)}
            >
              <Text>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={createViewClientsRegisterModal}
        transparent={true}
        onRequestClose={() => setCreateViewClientsRegisterModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContainerInternal}>
            <Text style={styles.title}>Clientes cadastrados</Text>

            <View style={styles.textInputModalSearch}>
              <FontAwesome
                name="search"
                size={24}
                color="gray"
                style={{ paddingRight: 10 }}
              />
              <TextInput placeholder="Procurar" />
            </View>

            {clients.length > 0 ? (
              <FlatList
                data={clients}
                keyExtractor={(item) => item.id} // Certifique-se de que 'id' é realmente o ID do cliente
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.lineClientsInOpen}
                    onPress={async () => {
                      console.log(
                        "Navegando para projetos do cliente:",
                        item.id
                      );
                      setCreateRegisterOrViewClientsModal(false);
                      setCreateViewClientsRegisterModal(false);
                      navigation.navigate("Inspeções por Cliente", {
                        client: item,
                        clientId: item.id, // Passando o clientId
                      });
                    }}
                  >
                    <Text>
                      {item.person} - {item.cnpj}
                    </Text>
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

      <Pressable
        style={styles.button}
        onPress={() => setcreateOrContinueProjectModal(true)}
      >
        <Text>{projectCount}</Text>
        <Text>Projetos</Text>
        <Plus name="plus" size={24} color="black" />
      </Pressable>

      {/* Modal to create or continue a project */}
      <Modal
        visible={createOrContinueProjectModal}
        transparent={true}
        onRequestClose={() => setcreateOrContinueProjectModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContainerInternal}>
            <Text style={styles.title}>Projetos</Text>
            <Pressable style={styles.button} onPress={createNewProject}>
              <Text>Criar novo projeto</Text>
            </Pressable>

            <Pressable
              style={styles.button}
              onPress={() => setModalVisible(true)}
            >
              <Text>Projetos em aberto</Text>
            </Pressable>

            <Pressable
              style={styles.closeButton}
              onPress={() => setcreateOrContinueProjectModal(false)}
            >
              <Text>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {isClientModalVisible && (
        <ClientsModal
          onClose={() => setIsClientModalVisible(false)}
          onSelectClient={handleSelectClient}
          visible={isClientModalVisible}
        />
      )}

      {/* Modal to list existing projects */}
      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContainerInternal}>
            <Text style={styles.title}>Projetos em aberto</Text>
            <FlatList
              data={projects}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <View style={styles.lineProjectsInOpen}>
                  <Pressable
                    style={styles.projectButton}
                    onPress={() =>
                      openProject(item) &&
                      setcreateOrContinueProjectModal(false)
                    }
                  >
                    {projects.length > 0 ? (
                      <Text>{item.replace(".json", "")}</Text>
                    ) : (
                      <Text>Não existem projetos abertos</Text>
                    )}
                  </Pressable>
                  <Pressable
                    style={styles.buttonDeleteProject}
                    onPress={() => uploadInspectionToFirebase(item)}
                  >
                    <Feather name="upload" size={24} color="black" />
                  </Pressable>
                  <Pressable
                    style={styles.buttonDeleteProject}
                    onPress={() => deleteProject(item)}
                  >
                    <Feather name="trash-2" size={24} color="black" />
                  </Pressable>
                </View>
              )}
            />
            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text>Fechar</Text>
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
    padding: 10,
  },
  button: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#7dd3fc",
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainerInternal: {
    width: "90%",
    height: "auto",
    maxHeight: "95%",
    minHeight: "45%",

    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  projectButton: {
    justifyContent: "center",
    backgroundColor: "#7dd3fc",
    padding: 20,
    marginVertical: 5,
    width: "70%",
    borderRadius: 10,
    alignItems: "center",
  },
  closeButton: {
    backgroundColor: "#7dd3fc",
    padding: 10,
    marginTop: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    width: "100%",
    borderRadius: 10,
    marginVertical: 10,
    borderColor: "#d4d4d4",
    borderWidth: 1,
  },
  title: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  lineProjectsInOpen: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonDeleteProject: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 50,
  },
  projectDetails: {
    fontSize: 16,
    marginVertical: 5,
    color: "#333",
  },
  lineClientsInOpen: {
    backgroundColor: "#7dd3fc",
    width: "100%",
    padding: 20,
    marginVertical: 5,
    borderRadius: 10,
  },
  textInputModalSearch: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 5,
  },
});

export default Home;
