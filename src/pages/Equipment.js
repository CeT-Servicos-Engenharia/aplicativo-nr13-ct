import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  TouchableOpacity,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as FileSystem from "expo-file-system";
import AddImageInProjectModal from "../components/modal/AddImageInProjectModal";
import SelectDropdown from "react-native-select-dropdown";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../../database/firebaseConfig";
import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import Entypo from "@expo/vector-icons/Entypo";
import FluidClassModal from "../components/modal/FluidClassModal";
import NetInfo from "@react-native-community/netinfo";

const Equipment = ({ route, navigation }) => {
  const { projectName, clientId, Idproject } = route.params || {
    projectName: "projeto desconhecido",
    clientId: "",
    Idproject: "",
  };

  const [isEditMode, setIsEditMode] = useState(false);
  const [images, setImages] = useState([null, null, null, null, null, null]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const imageLabels = [
    "Geral",
    "Traseira",
    "Direita",
    "Esquerda",
    "Frontal",
    "Placa",
  ];
  const [formData, setFormData] = useState({
    tipoEquipamento: "Caldeira",
    nomeEquipamento: "",
    numeroPatrimonio: "",
    tipoEquipamentoEspecifico: "",
    localInstalacao: "",
    servicoEquipamento: "",
    categoriaCaldeira: "",
    categoriaVasoPressao: "",
    fabricante: "",
    numeroSerie: "",
    anoFabricacao: "",
    pressaoMaxima: "",
    prssaoTesteHidrostaticoFabricacao: "",
    codProjeto: "",
    anoEdicao: "",
    capacidadeProducaoVapor: "",
    areaSuperficieAquecimento: "",
    fluidosServico: "",
    fluidServiceClass: "",
    grupoRisco: "",
    temperaturaProjeto: "",
    temperaturaTrabalho: "",
    tipoVolume: "",
    volume: "",
    combustivelPrincipal: "",
    combustivelAuxiliar: "",
    regimeTrabalho: "",
    tipoOperacao: "",
    unidadePressaoMaxima: "kPa",
  });

  const [isConnected, setIsConnected] = useState(null); // Inicialmente indefinido

  useEffect(() => {
    const checkConnection = async () => {
      const state = await NetInfo.fetch();
      setIsConnected(state.isConnected);
    };
  
    // Executa ao iniciar o app
    checkConnection();
  
    // Monitoramento contínuo da conexão
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
  
    return () => unsubscribe();
  }, []);

  // Log do estado
  console.log(`Está no modo: ${isConnected ? "ON" : "OFF"}`);



  const [isModalFluidClass, setIsModalFluidClass] = useState(false);

  const handleOpenModalFluidClass = () => {
    setIsModalFluidClass(true);
  };

  const handleCloseModalFluidClass = () => {
    setIsModalFluidClass(false);
  };

  useEffect(() => {
    const loadInspectionData = async () => {
      if (Idproject && clientId) {
        setIsEditMode(true);
        console.log(Idproject);

        try {
          const inspectionRef = doc(db, "inspections", Idproject);
          const docSnapshot = await getDoc(inspectionRef);

          if (docSnapshot.exists()) {
            const inspectionData = docSnapshot.data();
            console.log("Dados puxados: ", inspectionData)
            setFormData(inspectionData);
            setImages(
              inspectionData.images || [null, null, null, null, null, null]
            );
          } else {
          }
        } catch (error) {
          console.log(error);
        }
      }
    };

    loadInspectionData();
  }, [projectName]);

  const typeEquipmentsInNr13 = [
    { title: "Caldeira" },
    { title: "Vaso de Pressão" },
    { title: "Tubulação" },
    { title: "Tanque Metálico" },
  ];

  const typeCaldeiraInNr13 = [
    { title: "Flamotubular Horizontal" },
    { title: "Flamotubular Vertical" },
    { title: "Aquatubular" },
    { title: "Mista" },
  ];

  const typeVasoPressaoInNr13 = [
    { title: "Horizontal" },
    { title: "Vertical" },
  ];

  const fluidDescriptions = {
    A: [
      "Fluidos Inflamáveis",
      "Fluidos Combustíveis com Temperatura Igual ou Superior a 200°C",
      "Fluidos Tóxicos com Limite de Tolerância Igual ou Inferior a 20 ppm",
      "Hidrogênio",
      "Acetileno",
    ],
    B: [
      "Fluidos combustíveis com temperatura inferior a 200°C",
      "Fluidos tóxicos com limite de tolerância superior a 20 ppm",
    ],
    C: [
      "Vapor d'água",
      "Gases asfixiantes simples",
      "Ar comprimido",
    ],
    D: ["Outros fluidos sem classificação específica"],
  };

  const [selectedFluidClass, setSelectedFluidClass] = useState("");

  const handleSelectFluidClass = (className) => {
    setSelectedFluidClass(className);
    setFormData((prev) => ({ ...prev, fluidServiceClass: className }));
  };

  const pressaoDeTrabalho = [
    { title: "kgf/cm²" },
    { title: "MPa" },
    { title: "bar" },
    { title: "kPa" },
    { title: "psi" },
  ];

  const volumes = [{ title: "L" }, { title: "m³" }];

  const convertToKPa = (value, unit) => {
    switch (unit) {
      case "MPa":
        return value * 1000; // 1 MPa = 1000 kPa
      case "bar":
        return value * 100; // 1 bar = 100 kPa
      case "kgf/cm²":
        return value * 98.0665; // 1 kgf/cm² = 98.0665 kPa
      case "psi":
        return value * 6.89476; // 1 psi = 6.89476 kPa
      case "kPa":
        return value; // already in kPa
      default:
        return value;
    }
  };

  const convertToMPa = (value, unit) => {
    switch (unit) {
      case "kPa":
        return value / 1000; // 1 kPa = 0.001 MPa
      case "bar":
        return value / 10; // 1 bar = 0.1 MPa
      case "kgf/cm²":
        return value * 0.0980665; // 1 kgf/cm² = 0.0980665 MPa
      case "psi":
        return value * 0.00689476; // 1 psi = 0.00689476 MPa
      case "MPa":
        return value; // already in MPa
      default:
        return value; // return value as-is for unsupported units
    }
  };


  // Função para calcular o grupo de risco
  const calcularGrupoRisco = (pressao, volume, unidadePressao = "MPa", typeVolume) => {
    // Verifica se os parâmetros são válidos
    if (!pressao || !volume) {
      console.error("Parâmetros inválidos para cálculo do grupo de risco:", { pressao, volume });
      return "Parâmetros inválidos";
    }

    const pressureInMPa = convertToMPa(pressao, unidadePressao);
    const volumeInM3 = 0;

    if (pressureInMPa === null) {
      return "Unidade de pressão inválida";
    }


    // Converte o volume para m³, caso necessário
    if (typeVolume === "L") {
      volumeInM3 = volume / 1000;
      console.log(volumeInM3)
    }

    // Calcula o produto P × V
    const produtoPV = pressureInMPa * volumeInM3;

    // Determina o grupo de risco
    if (produtoPV > 100) {
      return 1;
    } else if (produtoPV > 30) {
      return 2;
    } else if (produtoPV > 2.5) {
      return 3;
    } else if (produtoPV > 1) {
      return 4;
    } else {
      return 5;
    }
  };

  // Função para determinar a categoria com base no grupo de risco e classe de fluido
  const determinarCategoria = (grupoRisco, classeFluido) => {
    const tabelaCategorias = {
      A: { 1: "I", 2: "I", 3: "II", 4: "III", 5: "III" },
      B: { 1: "I", 2: "II", 3: "III", 4: "IV", 5: "IV" },
      C: { 1: "I", 2: "II", 3: "III", 4: "IV", 5: "V" },
      D: { 1: "II", 2: "III", 3: "IV", 4: "V", 5: "V" },
    };

    const classeUpperCase = classeFluido?.toUpperCase();


    if (!classeUpperCase || !tabelaCategorias[classeUpperCase] || !tabelaCategorias[classeUpperCase][grupoRisco]) {
      console.error("Classe ou grupo de risco inválido:", { classeUpperCase, grupoRisco });
      return "Classe ou grupo de risco inválido";
    }
    return tabelaCategorias[classeUpperCase][grupoRisco];
  };

  // Uso das funções
  const pressao = parseFloat(formData.pressaoMaxima) || 0;
  const volume = parseFloat(formData.volume) || 0;
  const typeVolume = formData.tipoVolume
  const classeFluido = formData.fluidServiceClass;

  const grupoRisco = calcularGrupoRisco(pressao, volume, typeVolume);
  const categoria = determinarCategoria(grupoRisco, classeFluido);
  formData.categoriaVasoPressao = categoria;

  console.log("Grupo de Risco:", grupoRisco);
  formData.grupoRisco = grupoRisco;
  console.log("Categoria do Vaso de Pressão:", categoria);


  const boilerCategory = (pressaoMaxima, unidade) => {
    const pressionInKPa = convertToKPa(parseFloat(pressaoMaxima), unidade);
    if (pressionInKPa >= 1960) {
      return (formData.categoriaCaldeira = "Categoria A");
    } else if (pressionInKPa > 60 && pressionInKPa < 1960) {
      return (formData.categoriaCaldeira = "Categoria B");
    } else {
      return "Fora dos padrões de medições da NR-13";
    }
  };

  const categoryBoiler = boilerCategory(
    formData.pressaoMaxima,
    formData.unidadePressaoMaxima
  );

  console.log(isEditMode);
  const loadData = async () => {
    console.log("Valor de projectName:", projectName);
    if (!isEditMode) {
      if (!projectName) {
        return;
      }
      const filePath = `${FileSystem.documentDirectory}projects/${projectName}.json`;
      try {
        const fileContents = await FileSystem.readAsStringAsync(filePath);
        const data = JSON.parse(fileContents);
        setFormData(data);
        setImages(data.images || [null, null, null, null, null, null]);
      } catch (error) {
      }
    }
  };

  useEffect(() => {
    if (!isEditMode) {
      loadData();
    }
  }, [isEditMode]);

  useEffect(() => {
    const loadData = async () => {
      console.log("Carregando dados do projeto:", projectName);

      if (Platform.OS === "web") {
        try {
          const fileContents = localStorage.getItem(`project_${projectName}`);
          if (fileContents) {
            const data = JSON.parse(fileContents);
            console.log("Dados carregados do LocalStorage:", data);
          } else {
            console.log("Nenhum projeto encontrado no LocalStorage.");
            Alert.alert("Erro", "Projeto não encontrado no navegador.");
          }
        } catch (error) {
          console.error("Erro ao carregar dados no navegador: ", error);
        }
      } else {
        const filePath = `${FileSystem.documentDirectory}projects/${projectName}.json`;
        console.log("Caminho do arquivo no cache:", filePath);
        try {
          const fileContents = await FileSystem.readAsStringAsync(filePath);
          const data = JSON.parse(fileContents);
          console.log("Dados carregados do cache:", data);
        } catch (error) {
          console.error("Erro ao carregar dados do cache: ", error);
        }
      }
    };

    loadData();
  }, [projectName]);

  const uploadImageToFirebase = async (imageUri) => {
    try {
      // Reduz o tamanho do arquivo antes do upload
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const storage = getStorage();
      const storageRef = ref(storage, `inspections/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`);

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      return downloadURL;
    } catch (error) {
      console.error("Erro no upload:", error);
      throw error;
    }
  };

  const openImagePickerAsync = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.5,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [1, 1],
      base64: false,
    });

    if (!pickerResult.canceled && selectedIndex !== null) {
      const imageUri = pickerResult.assets[0].uri;
      if (!isConnected) {
        const localUri = `${FileSystem.documentDirectory}offline-image-${Date.now()}.jpg`
        await FileSystem.copyAsync({ from: imageUri, to: localUri });
        const newImages = [...images];
        newImages[selectedIndex] = localUri;
        setImages(newImages);
        console.log("Imagem salva localmente:", localUri);
      } else {
        try {
          const newImages = [...images];
          newImages[selectedIndex] = "loading"; // Indica que está carregando
          setImages(newImages);
          
          const uploadedImageUrl = await uploadImageToFirebase(pickerResult.assets[0].uri);
          newImages[selectedIndex] = uploadedImageUrl;
          setImages(newImages);
        } catch (error) {
          console.error("Erro ao fazer upload da imagem:", error);
          Alert.alert("Erro", "Não foi possível fazer upload da imagem. Tente novamente.");
          const newImages = [...images];
          newImages[selectedIndex] = null;
          setImages(newImages);
        }
      }
      setModalVisible(false);
    }
  };

  const openCameraAsync = async () => {
    let permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera is required!");
      return;
    }

    let cameraResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.5,
      aspect: [1, 1],
      base64: false,
    });

    if (!cameraResult.canceled && selectedIndex !== null) {
      const imageUri = cameraResult.assets[0].uri;
      if (!isConnected) {
        const localUri = `${FileSystem.documentDirectory}offline-image-${Date.now()}.jpg`
        await FileSystem.copyAsync({ from: imageUri, to: localUri });
        const newImages = [...images];
        newImages[selectedIndex] = localUri;
        setImages(newImages);
        console.log("Imagem salva localmente:", localUri);
      } else {
        try {
          const newImages = [...images];
          newImages[selectedIndex] = "loading"; // Indica que está carregando
          setImages(newImages);
          
          const uploadedImageUrl = await uploadImageToFirebase(cameraResult.assets[0].uri);
          newImages[selectedIndex] = uploadedImageUrl;
          setImages(newImages);
        } catch (error) {
          console.error("Erro ao fazer upload da imagem:", error);
          Alert.alert("Erro", "Não foi possível fazer upload da imagem. Tente novamente.");
          const newImages = [...images];
          newImages[selectedIndex] = null;
          setImages(newImages);
        }
      }
      setModalVisible(false);
    }
  };

  const handleImagePress = (index) => {
    setSelectedIndex(index);
    setModalVisible(true);
  };

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const saveProject = async (projectName, equipmentData) => {
    if (Platform.OS === "web") {
      try {
        const projectDataString = localStorage.getItem(
          `project_${projectName}`
        );
        let projectData = projectDataString
          ? JSON.parse(projectDataString)
          : {};

        projectData = {
          ...projectData,
          ...equipmentData,
        };

        localStorage.setItem(
          `project_${projectName}`,
          JSON.stringify(projectData)
        );
        console.log("Projeto atualizado no LocalStorage:", projectData);

        navigation.navigate("Inspeção", {
          projectName,
          clientId: projectData.clientId,
          tipoEquipamento: projectData.tipoEquipamento,
          categoriaVasoPressao: projectData.categoriaVasoPressao
        });
      } catch (error) {
        console.error("Erro ao salvar o equipamento no projeto (web):", error);
        Alert.alert("Erro", "Não foi possível salvar o equipamento.");
      }
    } else {
      try {
        const dir = FileSystem.documentDirectory + "projects/";
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
        const filePath = `${dir}${projectName}.json`;

        await FileSystem.writeAsStringAsync(
          filePath,
          JSON.stringify(equipmentData)
        );
        console.log("Arquivo salvo no cache em:", filePath);

        navigation.navigate("Inspeção", {
          projectName,
          clientId: equipmentData.clientId,
          tipoEquipamento: equipmentData.tipoEquipamento,
          categoriaVasoPressao: equipmentData.categoriaVasoPressao
        });
      } catch (error) {
        console.error("Erro ao salvar o projeto no cache:", error);
        Alert.alert(
          "Erro",
          "Falha ao salvar o projeto no cache. Verifique o console para mais detalhes."
        );
      }
    }
  };

  const handleSaveData = async () => {
    if (!projectName) {
      Alert.alert("Erro", "Nome do projeto inválido ou não fornecido.");
      return;
    }

    const dataToSave = {
      ...formData,
      images,
      clientId,
    };

    try {
      await saveProject(projectName, dataToSave);
      console.log(projectName);
      Alert.alert("Sucesso", "Dados salvos com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      Alert.alert("Erro", "Não foi possível salvar os dados: " + error.message);
    }
  };

  handleUpdateData = async () => {
    const projectData = {
      ...formData,
      images,
    };

    if (Idproject) {
      const projectRef = doc(db, "inspections", Idproject);

      try {
        await updateDoc(projectRef, projectData);
        Alert.alert("Sucesso", "Dados atualizados com sucesso!");
        navigation.navigate("Inspeção", { Idproject: Idproject });
      } catch (error) {
        console.error("Erro ao atualizar os dados:", error);
        Alert.alert("Erro", "Falha ao atualizar os dados.");
      }
    } else {
      Alert.alert("Erro", "ID do projeto não fornecido.");
    }
  };

  const renderFields = () => {
    switch (formData.tipoEquipamento) {
      case "Caldeira":
        return (
          <ScrollView style={styles.infosEquipments}>
            <View>
              <TextInput
                style={styles.textInput}
                placeholder="Nome do Equipamento"
                value={formData.nomeEquipamento}
                onChangeText={(text) =>
                  handleInputChange("nomeEquipamento", text)
                }
              />

              <TextInput
                style={styles.textInput}
                placeholder="Número de Patrimônio"
                keyboardType="numeric"
                value={formData.numeroPatrimonio}
                onChangeText={(text) =>
                  handleInputChange("numeroPatrimonio", text)
                }
              />
              <SelectDropdown
                data={typeCaldeiraInNr13}
                onSelect={(typeCaldeiraInNr13) => {
                  handleInputChange("tipoCaldeira", typeCaldeiraInNr13.title);
                }}
                renderButton={(selectedItem, isOpened) => {
                  return (
                    <View style={styles.dropdownButtonStyle}>
                      <Text style={styles.textInputDropDown}>
                        {(selectedItem && selectedItem.title) ||
                          "Tipo de caldeira"}
                      </Text>
                      <AntDesign name="down" size={24} color="black" />
                    </View>
                  );
                }}
                renderItem={(item, index, isSelected) => {
                  return (
                    <View
                      style={{
                        ...styles.dropdownItemStyle,
                        ...(isSelected && { backgroundColor: "#2563eb" }),
                      }}
                    >
                      <Text style={styles.dropdownItemTxtStyle}>
                        {item.title}
                      </Text>
                    </View>
                  );
                }}
                showsVerticalScrollIndicator={false}
              />

              <TextInput
                style={styles.textInput}
                placeholder="Local de instalação"
                value={formData.localInstalacao}
                onChangeText={(text) =>
                  handleInputChange("localInstalacao", text)
                }
              />

              <TextInput
                style={styles.textInput}
                placeholder="Serviço do equipamento"
                value={formData.servicoEquipamento}
                onChangeText={(text) =>
                  handleInputChange("servicoEquipamento", text)
                }
              />

              <View style={styles.containerPlacaIdentificacao}>
                <Text style={styles.title}>
                  Dados da placa de identificação
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Fabricante"
                  value={formData.fabricante}
                  onChangeText={(text) => handleInputChange("fabricante", text)}
                />

                <TextInput
                  style={styles.textInput}
                  placeholder="Número de Série"
                  keyboardType="numeric"
                  value={formData.numeroSerie}
                  onChangeText={(text) =>
                    handleInputChange("numeroSerie", text)
                  }
                />

                <TextInput
                  style={styles.textInput}
                  placeholder="Ano de Fabricação"
                  keyboardType="numeric"
                  value={formData.anoFabricacao}
                  onChangeText={(text) =>
                    handleInputChange("anoFabricacao", text)
                  }
                />

                <View style={styles.containerSelectTypeValuePressaoTrabalho}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.inputWithDropdown}
                      placeholder="Pressão Máxima de Trabalho Admissível"
                      value={formData.pressaoMaxima}
                      onChangeText={(text) =>
                        handleInputChange("pressaoMaxima", text)
                      }
                      keyboardType="numeric"
                    />
                    <SelectDropdown
                      data={pressaoDeTrabalho}
                      onSelect={(selectedUnit) => {
                        handleInputChange(
                          "unidadePressaoMaxima",
                          selectedUnit.title
                        );
                      }}
                      renderButton={(selectedItem, isOpened) => {
                        return (
                          <TouchableOpacity style={styles.dropdownTypeValue}>
                            <Text style={styles.textInputDropDown}>
                              {(selectedItem && selectedItem.title) ||
                                "kgf/cm²"}
                            </Text>
                            <AntDesign name="down" size={24} color="black" />
                          </TouchableOpacity>
                        );
                      }}
                      renderItem={(item, index, isSelected) => {
                        return (
                          <View
                            style={{
                              ...styles.dropdownItemStyle,
                              ...(isSelected && { backgroundColor: "#2563eb" }),
                            }}
                          >
                            <Text style={styles.dropdownItemTxtStyle}>
                              {item.title}
                            </Text>
                          </View>
                        );
                      }}
                      showsVerticalScrollIndicator={false}
                      dropdownStyle={styles.dropdownStyle}
                    />
                  </View>
                </View>

                <View style={styles.containerSelectTypeValuePressaoTrabalho}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.inputWithDropdown}
                      placeholder="Pressão de Teste Hidrostático de Fabricação"
                      value={formData.pressaoTeste}
                      onChangeText={(text) =>
                        handleInputChange("pressaoTeste", text)
                      }
                      keyboardType="numeric"
                    />
                    <SelectDropdown
                      data={pressaoDeTrabalho}
                      onSelect={(selectedUnit) => {
                        handleInputChange(
                          "unidadePressaoMaxima",
                          selectedUnit.title
                        );
                      }}
                      renderButton={(selectedItem, isOpened) => {
                        return (
                          <TouchableOpacity style={styles.dropdownTypeValue}>
                            <Text style={styles.textInputDropDown}>
                              {(selectedItem && selectedItem.title) ||
                                "kgf/cm²"}
                            </Text>
                            <AntDesign name="down" size={24} color="black" />
                          </TouchableOpacity>
                        );
                      }}
                      renderItem={(item, index, isSelected) => {
                        return (
                          <View
                            style={{
                              ...styles.dropdownItemStyle,
                              ...(isSelected && { backgroundColor: "#2563eb" }),
                            }}
                          >
                            <Text style={styles.dropdownItemTxtStyle}>
                              {item.title}
                            </Text>
                          </View>
                        );
                      }}
                      showsVerticalScrollIndicator={false}
                      dropdownStyle={styles.dropdownStyle}
                    />
                  </View>
                </View>

                <View style={styles.inputContainerWhithInfoInFinal}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.inputWithDropdown}
                      placeholder="Capacidade de Produção de Vapor"
                      value={formData.capacidadeProducaoVapor}
                      onChangeText={(text) =>
                        handleInputChange("capacidadeProducaoVapor", text)
                      }
                      keyboardType="numeric"
                    />
                    <Text style={styles.unitLabel}>kgv/h</Text>
                  </View>
                </View>

                <View style={styles.inputContainerWhithInfoInFinal}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.inputWithDropdown}
                      placeholder="Área da superfície de aquecimento"
                      value={formData.areaSuperficieAquecimento}
                      onChangeText={(text) =>
                        handleInputChange("areaSuperficieAquecimento", text)
                      }
                      keyboardType="numeric"
                    />
                    <Text style={styles.unitLabel}>m²</Text>
                  </View>
                </View>

                <TextInput
                  style={styles.textInput}
                  placeholder="Ano de Edição"
                  value={formData.anoEdicao}
                  onChangeText={(text) => handleInputChange("anoEdicao", text)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.containerCategorizacao}>
                <View>
                  <Text style={styles.title}>Categorização</Text>

                  <View style={styles.inputContainerWhithInfoInFinal}>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.inputWithDropdown}
                        placeholder="Temperatura do projeto"
                        value={formData.temperaturaProjeto}
                        onChangeText={(text) =>
                          handleInputChange("temperaturaProjeto", text)
                        }
                        keyboardType="numeric"
                      />
                      <Text style={styles.unitLabel}>°C</Text>
                    </View>
                  </View>

                  <View style={styles.inputContainerWhithInfoInFinal}>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.inputWithDropdown}
                        placeholder="Temperatura de trabalho"
                        value={formData.temperaturaTrabalho}
                        onChangeText={(text) =>
                          handleInputChange("temperaturaTrabalho", text)
                        }
                        keyboardType="numeric"
                      />
                      <Text style={styles.unitLabel}>°C</Text>
                    </View>
                  </View>

                  <View style={styles.containerSelectTypeValuePressaoTrabalho}>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.inputWithDropdown}
                        placeholder="Volume"
                        value={formData.volume}
                        onChangeText={(text) =>
                          handleInputChange("volume", text)
                        }
                        keyboardType="numeric"
                      />
                      <SelectDropdown
                        data={volumes}
                        onSelect={(selectedUnit) => {
                          handleInputChange("tipoVolume", selectedUnit.title);
                        }}
                        renderButton={(selectedItem, isOpened) => {
                          return (
                            <TouchableOpacity style={styles.dropdownTypeValue}>
                              <Text style={styles.textInputDropDown}>
                                {(selectedItem && selectedItem.title) ||
                                  "Tipo de Valor"}
                              </Text>
                              <AntDesign name="down" size={24} color="black" />
                            </TouchableOpacity>
                          );
                        }}
                        renderItem={(item, index, isSelected) => {
                          return (
                            <View
                              style={{
                                ...styles.dropdownItemStyle,
                                ...(isSelected && {
                                  backgroundColor: "#2563eb",
                                }),
                              }}
                            >
                              <Text style={styles.dropdownItemTxtStyle}>
                                {item.title}
                              </Text>
                            </View>
                          );
                        }}
                        showsVerticalScrollIndicator={false}
                        dropdownStyle={styles.dropdownStyle}
                      />
                    </View>
                  </View>

                  <Text>PMTA: {categoryBoiler}</Text>
                </View>
              </View>

              <View style={styles.containerDadosOperacionais}>
                <Text style={styles.title}>Dados Operacionais</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Combustível Principal"
                  value={formData.combustivelPrincipal}
                  onChangeText={(text) =>
                    handleInputChange("combustivelPrincipal", text)
                  }
                />

                <TextInput
                  style={styles.textInput}
                  placeholder="Combustível Auxilir"
                  value={formData.combustivelAuxiliar}
                  onChangeText={(text) =>
                    handleInputChange("combustivelAuxiliar", text)
                  }
                />

                <TextInput
                  style={styles.textInput}
                  placeholder="Regime de trabalho"
                  value={formData.regimeTrabalho}
                  onChangeText={(text) =>
                    handleInputChange("regimeTrabalho", text)
                  }
                />

                <TextInput
                  style={styles.textInput}
                  placeholder="Tipo de Operação"
                  value={formData.tipoOperacao}
                  onChangeText={(text) =>
                    handleInputChange("tipoOperacao", text)
                  }
                />
              </View>
            </View>
            <Pressable onPress={isEditMode ? handleUpdateData : handleSaveData}>
              <View style={styles.buttonFunctionsInModal}>
                <AntDesign name="save" size={24} color="white" />
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {isEditMode ? "Atualizar equipamento" : "Salvar Equipamento"}
                </Text>
                <AntDesign name="plus" size={24} color="white" />
              </View>
            </Pressable>
          </ScrollView>
        );
      case "Vaso de Pressão":
        return (
          <ScrollView style={styles.infosEquipments}>
            <View>
              <TextInput
                style={styles.textInput}
                placeholder="Nome do Equipamento"
                value={formData.nomeEquipamento}
                onChangeText={(text) =>
                  handleInputChange("nomeEquipamento", text)
                }
              />

              <TextInput
                style={styles.textInput}
                placeholder="Número de Patrimônio"
                keyboardType="numeric"
                value={formData.numeroPatrimonio}
                onChangeText={(text) =>
                  handleInputChange("numeroPatrimonio", text)
                }
              />

              <SelectDropdown
                data={typeVasoPressaoInNr13}
                onSelect={(typeVasoPressaoInNr13) => {
                  handleInputChange(
                    "tipoVasoPressao",
                    typeVasoPressaoInNr13.title
                  );
                }}
                renderButton={(selectedItem, isOpened) => {
                  return (
                    <View style={styles.dropdownButtonStyle}>
                      <Text style={styles.textInputDropDown}>
                        {(selectedItem && selectedItem.title) ||
                          "Tipo Vaso de Pressão"}
                      </Text>
                      <AntDesign name="down" size={24} color="black" />
                    </View>
                  );
                }}
                renderItem={(item, index, isSelected) => {
                  return (
                    <View
                      style={{
                        ...styles.dropdownItemStyle,
                        ...(isSelected && { backgroundColor: "#2563eb" }),
                      }}
                    >
                      <Text style={styles.dropdownItemTxtStyle}>
                        {item.title}
                      </Text>
                    </View>
                  );
                }}
                showsVerticalScrollIndicator={false}
              />

              <TextInput
                style={styles.textInput}
                placeholder="Local de instalação"
                value={formData.localInstalacao}
                onChangeText={(text) =>
                  handleInputChange("localInstalacao", text)
                }
              />

              <TextInput
                style={styles.textInput}
                placeholder="Serviço do equipamento"
                value={formData.servicoEquipamento}
                onChangeText={(text) =>
                  handleInputChange("servicoEquipamento", text)
                }
              />

              <View style={styles.containerPlacaIdentificacao}>
                <Text style={styles.title}>
                  Dados da placa de identificação
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Fabricante"
                  value={formData.fabricante}
                  onChangeText={(text) => handleInputChange("fabricante", text)}
                />

                <TextInput
                  style={styles.textInput}
                  placeholder="Número de Série"
                  keyboardType="numeric"
                  value={formData.numeroSerie}
                  onChangeText={(text) =>
                    handleInputChange("numeroSerie", text)
                  }
                />

                <TextInput
                  style={styles.textInput}
                  placeholder="Ano de Fabricação"
                  keyboardType="numeric"
                  value={formData.anoFabricacao}
                  onChangeText={(text) =>
                    handleInputChange("anoFabricacao", text)
                  }
                />

                <View style={styles.containerSelectTypeValuePressaoTrabalho}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.inputWithDropdown}
                      placeholder="Pressão Máxima de Trabalho Admissível"
                      value={formData.pressaoMaxima}
                      onChangeText={(text) =>
                        handleInputChange("pressaoMaxima", text)
                      }
                      keyboardType="numeric"
                    />
                    <SelectDropdown
                      data={pressaoDeTrabalho}
                      onSelect={(selectedUnit) => {
                        handleInputChange(
                          "unidadePressaoMaxima",
                          selectedUnit.title
                        );
                      }}
                      renderButton={(selectedItem, isOpened) => {
                        return (
                          <TouchableOpacity style={styles.dropdownTypeValue}>
                            <Text style={styles.textInputDropDown}>
                              {(selectedItem && selectedItem.title) ||
                                "Tipo de valor"}
                            </Text>
                            <AntDesign name="down" size={24} color="black" />
                          </TouchableOpacity>
                        );
                      }}
                      renderItem={(item, index, isSelected) => {
                        return (
                          <View
                            style={{
                              ...styles.dropdownItemStyle,
                              ...(isSelected && { backgroundColor: "#2563eb" }),
                            }}
                          >
                            <Text style={styles.dropdownItemTxtStyle}>
                              {item.title}
                            </Text>
                          </View>
                        );
                      }}
                      showsVerticalScrollIndicator={false}
                      dropdownStyle={styles.dropdownStyle}
                    />
                  </View>
                </View>

                <View style={styles.containerSelectTypeValuePressaoTrabalho}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.inputWithDropdown}
                      placeholder="Pressão de Teste Hidrostático de Fabricação"
                      value={formData.pressaoTeste}
                      onChangeText={(text) =>
                        handleInputChange("pressaoTeste", text)
                      }
                      keyboardType="numeric"
                    />
                    <SelectDropdown
                      data={pressaoDeTrabalho}
                      onSelect={(selectedUnit) => {
                        handleInputChange(
                          "unidadePressaoMaxima",
                          selectedUnit.title
                        );
                      }}
                      renderButton={(selectedItem, isOpened) => {
                        return (
                          <TouchableOpacity style={styles.dropdownTypeValue}>
                            <Text style={styles.textInputDropDown}>
                              {(selectedItem && selectedItem.title) ||
                                "kgf/cm²"}
                            </Text>
                            <AntDesign name="down" size={24} color="black" />
                          </TouchableOpacity>
                        );
                      }}
                      renderItem={(item, index, isSelected) => {
                        return (
                          <View
                            style={{
                              ...styles.dropdownItemStyle,
                              ...(isSelected && { backgroundColor: "#2563eb" }),
                            }}
                          >
                            <Text style={styles.dropdownItemTxtStyle}>
                              {item.title}
                            </Text>
                          </View>
                        );
                      }}
                      showsVerticalScrollIndicator={false}
                      dropdownStyle={styles.dropdownStyle}
                    />
                  </View>
                </View>

                <TextInput
                  style={styles.textInput}
                  placeholder="Código do projeto"
                  value={formData.codProjeto}
                  onChangeText={(text) => handleInputChange("codProjeto", text)}
                />

                <TextInput
                  style={styles.textInput}
                  placeholder="Ano de Edição"
                  value={formData.anoEdicao}
                  onChangeText={(text) => handleInputChange("anoEdicao", text)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.containerCategorizacao}>
                <View>
                  <Text style={styles.title}>Categorização</Text>

                  <TextInput
                    style={styles.textInput}
                    placeholder="Fluídos de serviço"
                    value={formData.fluidosServico}
                    onChangeText={(text) =>
                      handleInputChange("fluidosServico", text)
                    }
                  />

                  <View style={styles.inputContainerWhithInfoInFinal}>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.inputWithDropdown}
                        placeholder="Temperatura do projeto"
                        value={formData.temperaturaProjeto}
                        onChangeText={(text) =>
                          handleInputChange("temperaturaProjeto", text)
                        }
                        keyboardType="numeric"
                      />
                      <Text style={styles.unitLabel}>°C</Text>
                    </View>
                  </View>

                  <View style={styles.inputContainerWhithInfoInFinal}>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.inputWithDropdown}
                        placeholder="Temperatura de trabalho"
                        value={formData.temperaturaTrabalho}
                        onChangeText={(text) =>
                          handleInputChange("temperaturaTrabalho", text)
                        }
                        keyboardType="numeric"
                      />
                      <Text style={styles.unitLabel}>°C</Text>
                    </View>
                  </View>

                  <View style={styles.containerSelectTypeValuePressaoTrabalho}>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.inputWithDropdown}
                        placeholder="Volume"
                        value={formData.volume}
                        onChangeText={(text) =>
                          handleInputChange("volume", text)
                        }
                        keyboardType="numeric"
                      />
                      <SelectDropdown
                        data={volumes}
                        onSelect={(selectedUnit) => {
                          handleInputChange("tipoVolume", selectedUnit.title);
                        }}
                        renderButton={(selectedItem, isOpened) => {
                          return (
                            <TouchableOpacity style={styles.dropdownTypeValue}>
                              <Text style={styles.textInputDropDown}>
                                {(selectedItem && selectedItem.title) ||
                                  "Tipo de Valor"}
                              </Text>
                              <AntDesign name="down" size={24} color="black" />
                            </TouchableOpacity>
                          );
                        }}
                        renderItem={(item, index, isSelected) => {
                          return (
                            <View
                              style={{
                                ...styles.dropdownItemStyle,
                                ...(isSelected && {
                                  backgroundColor: "#2563eb",
                                }),
                              }}
                            >
                              <Text style={styles.dropdownItemTxtStyle}>
                                {item.title}
                              </Text>
                            </View>
                          );
                        }}
                        showsVerticalScrollIndicator={false}
                        dropdownStyle={styles.dropdownStyle}
                      />
                    </View>
                  </View>

                  <Pressable
                    style={{
                      justifyContent: "space-between",
                      flexDirection: "row",
                      marginHorizontal: 10,
                    }}
                    onPress={handleOpenModalFluidClass}
                  >
                    <View>
                      <Text style={{ fontWeight: "bold" }}>
                        {"Classe de fluído: " + selectedFluidClass ||
                          "Classe de fluído:"}
                      </Text>
                      <Text style={{ width: "80%", marginBottom: 15 }}>
                        {selectedFluidClass ? (
                          <View style={styles.listContainer}>
                            {fluidDescriptions[selectedFluidClass].map(
                              (desc, index) => (
                                <Text key={index} style={styles.listItem}>
                                  • {desc}
                                </Text>
                              )
                            )}
                          </View>
                        ) : (
                          <Text>Classe do fluído: </Text>
                        )}
                      </Text>
                    </View>
                    <View>
                      <Entypo name="select-arrows" size={24} color="black" />
                    </View>
                  </Pressable>

                  <FluidClassModal
                    visible={isModalFluidClass}
                    onClose={handleCloseModalFluidClass}
                    onSelect={handleSelectFluidClass}
                  />

                  <View style={{ marginHorizontal: 10, marginBottom: 15 }}>
                    <Text>Grupo de risco: {grupoRisco}</Text>
                  </View>

                  <View style={{ marginHorizontal: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>Categoria: {categoria}</Text>
                    <Text style={styles.listItem}>Classe de fluido {classeFluido} | Grupo de risco: {grupoRisco}</Text>
                  </View>
                </View>
              </View>
            </View>
            <Pressable onPress={isEditMode ? handleUpdateData : handleSaveData}>
              <View style={styles.buttonFunctionsInModal}>
                <AntDesign name="save" size={24} color="white" />
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {isEditMode ? "Atualizar equipamento" : "Salvar Equipamento"}
                </Text>
                <AntDesign name="plus" size={24} color="white" />
              </View>
            </Pressable>
          </ScrollView>
        );
      case "Tubulação":
        return (
          <ScrollView style={styles.infosEquipments}>
            <View>
              <TextInput
                style={styles.textInput}
                placeholder="Nome do Equipamento"
                value={formData.nomeEquipamento}
                onChangeText={(text) =>
                  handleInputChange("nomeEquipamento", text)
                }
              />

              <TextInput
                style={styles.textInput}
                placeholder="Número de Patrimônio"
                keyboardType="numeric"
                value={formData.numeroPatrimonio}
                onChangeText={(text) =>
                  handleInputChange("numeroPatrimonio", text)
                }
              />

              <TextInput
                style={styles.textInput}
                placeholder="Local de instalação"
                value={formData.localInstalacao}
                onChangeText={(text) =>
                  handleInputChange("localInstalacao", text)
                }
              />

              <TextInput
                style={styles.textInput}
                placeholder="Serviço do equipamento"
                value={formData.servicoEquipamento}
                onChangeText={(text) =>
                  handleInputChange("servicoEquipamento", text)
                }
              />

              <View style={styles.containerPlacaIdentificacao}>
                <Text style={styles.title}>Dados gerais</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Fabricante"
                  value={formData.fabricante}
                  onChangeText={(text) => handleInputChange("fabricante", text)}
                />

                <TextInput
                  style={styles.textInput}
                  placeholder="Número de Série"
                  keyboardType="numeric"
                  value={formData.numeroSerie}
                  onChangeText={(text) =>
                    handleInputChange("numeroSerie", text)
                  }
                />

                <TextInput
                  style={styles.textInput}
                  placeholder="Ano de Fabricação"
                  keyboardType="numeric"
                  value={formData.anoFabricacao}
                  onChangeText={(text) =>
                    handleInputChange("anoFabricacao", text)
                  }
                />

                <View style={styles.containerSelectTypeValuePressaoTrabalho}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.inputWithDropdown}
                      placeholder="Pressão Máxima de Trabalho Admissível"
                      value={formData.pressaoMaximaTrabalhoAdmissivel}
                      onChangeText={(text) =>
                        handleInputChange("pressaoMaxima", text)
                      }
                      keyboardType="numeric"
                    />
                    <SelectDropdown
                      data={pressaoDeTrabalho}
                      onSelect={(selectedUnit) => {
                        handleInputChange(
                          "unidadePressaoMaxima",
                          selectedUnit.title
                        );
                      }}
                      renderButton={(selectedItem, isOpened) => {
                        return (
                          <TouchableOpacity style={styles.dropdownTypeValue}>
                            <Text style={styles.textInputDropDown}>
                              {(selectedItem && selectedItem.title) ||
                                "Tipo de valor"}
                            </Text>
                            <AntDesign name="down" size={24} color="black" />
                          </TouchableOpacity>
                        );
                      }}
                      renderItem={(item, index, isSelected) => {
                        return (
                          <View
                            style={{
                              ...styles.dropdownItemStyle,
                              ...(isSelected && { backgroundColor: "#2563eb" }),
                            }}
                          >
                            <Text style={styles.dropdownItemTxtStyle}>
                              {item.title}
                            </Text>
                          </View>
                        );
                      }}
                      showsVerticalScrollIndicator={false}
                      dropdownStyle={styles.dropdownStyle}
                    />
                  </View>
                </View>

                <View style={styles.containerSelectTypeValuePressaoTrabalho}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.inputWithDropdown}
                      placeholder="Pressão de Teste Hidrostático de Fabricação"
                      value={formData.prssaoTesteHidrostaticoFabricacao}
                      onChangeText={(text) =>
                        handleInputChange("pressaoTeste", text)
                      }
                      keyboardType="numeric"
                    />
                    <SelectDropdown
                      data={pressaoDeTrabalho}
                      onSelect={(selectedUnit) => {
                        handleInputChange(
                          "unidadePressaoMaxima",
                          selectedUnit.title
                        );
                      }}
                      renderButton={(selectedItem, isOpened) => {
                        return (
                          <TouchableOpacity style={styles.dropdownTypeValue}>
                            <Text style={styles.textInputDropDown}>
                              {(selectedItem && selectedItem.title) ||
                                "kgf/cm²"}
                            </Text>
                            <AntDesign name="down" size={24} color="black" />
                          </TouchableOpacity>
                        );
                      }}
                      renderItem={(item, index, isSelected) => {
                        return (
                          <View
                            style={{
                              ...styles.dropdownItemStyle,
                              ...(isSelected && { backgroundColor: "#2563eb" }),
                            }}
                          >
                            <Text style={styles.dropdownItemTxtStyle}>
                              {item.title}
                            </Text>
                          </View>
                        );
                      }}
                      showsVerticalScrollIndicator={false}
                      dropdownStyle={styles.dropdownStyle}
                    />
                  </View>
                </View>

                <TextInput
                  style={styles.textInput}
                  placeholder="Código do projeto"
                  value={formData.codProjeto}
                  onChangeText={(text) => handleInputChange("codProjeto", text)}
                />

                <TextInput
                  style={styles.textInput}
                  placeholder="Ano de Edição"
                  value={formData.anoEdicao}
                  onChangeText={(text) => handleInputChange("anoEdicao", text)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.containerCategorizacao}>
                <View>
                  <Text style={styles.title}>Dados dos fluídos</Text>

                  <TextInput
                    style={styles.textInput}
                    placeholder="Fluídos de serviço"
                    value={formData.fluidosServico}
                    onChangeText={(text) =>
                      handleInputChange("fluidosServico", text)
                    }
                  />

                  <View style={styles.inputContainerWhithInfoInFinal}>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.inputWithDropdown}
                        placeholder="Temperatura do projeto"
                        value={formData.temperaturaProjeto}
                        onChangeText={(text) =>
                          handleInputChange("temperaturaProjeto", text)
                        }
                        keyboardType="numeric"
                      />
                      <Text style={styles.unitLabel}>°C</Text>
                    </View>
                  </View>

                  <View style={styles.inputContainerWhithInfoInFinal}>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.inputWithDropdown}
                        placeholder="Temperatura de trabalho"
                        value={formData.temperaturaTrabalho}
                        onChangeText={(text) =>
                          handleInputChange("temperaturaTrabalho", text)
                        }
                        keyboardType="numeric"
                      />
                      <Text style={styles.unitLabel}>°C</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <Pressable onPress={isEditMode ? handleUpdateData : handleSaveData}>
              <View style={styles.buttonFunctionsInModal}>
                <AntDesign name="save" size={24} color="white" />
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {isEditMode ? "Atualizar equipamento" : "Salvar Equipamento"}
                </Text>
                <AntDesign name="plus" size={24} color="white" />
              </View>
            </Pressable>
          </ScrollView>
        );
      case "Tanque Metálico":
        return (
          <ScrollView style={styles.infosEquipments}>
            <View>
              <TextInput
                style={styles.textInput}
                placeholder="Nome do Equipamento"
                value={formData.nomeEquipamento}
                onChangeText={(text) =>
                  handleInputChange("nomeEquipamento", text)
                }
              />

              <TextInput
                style={styles.textInput}
                placeholder="Número de Patrimônio"
                keyboardType="numeric"
                value={formData.numeroPatrimonio}
                onChangeText={(text) =>
                  handleInputChange("numeroPatrimonio", text)
                }
              />

              <TextInput
                style={styles.textInput}
                placeholder="Local de instalação"
                value={formData.localInstalacao}
                onChangeText={(text) =>
                  handleInputChange("localInstalacao", text)
                }
              />

              <TextInput
                style={styles.textInput}
                placeholder="Serviço do equipamento"
                value={formData.servicoEquipamento}
                onChangeText={(text) =>
                  handleInputChange("servicoEquipamento", text)
                }
              />

              <View style={styles.containerPlacaIdentificacao}>
                <Text style={styles.title}>Dados gerais</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Fabricante"
                  value={formData.fabricante}
                  onChangeText={(text) => handleInputChange("fabricante", text)}
                />

                <TextInput
                  style={styles.textInput}
                  placeholder="Número de Série"
                  keyboardType="numeric"
                  value={formData.numeroSerie}
                  onChangeText={(text) =>
                    handleInputChange("numeroSerie", text)
                  }
                />

                <TextInput
                  style={styles.textInput}
                  placeholder="Ano de Fabricação"
                  keyboardType="numeric"
                  value={formData.anoFabricacao}
                  onChangeText={(text) =>
                    handleInputChange("anoFabricacao", text)
                  }
                />

                <View style={styles.containerSelectTypeValuePressaoTrabalho}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.inputWithDropdown}
                      placeholder="Pressão Máxima de Trabalho Admissível"
                      value={formData.pressaoMaximaTrabalhoAdmissivel}
                      onChangeText={(text) =>
                        handleInputChange("pressaoMaxima", text)
                      }
                      keyboardType="numeric"
                    />
                    <SelectDropdown
                      data={pressaoDeTrabalho}
                      onSelect={(selectedUnit) => {
                        handleInputChange(
                          "unidadePressaoMaxima",
                          selectedUnit.title
                        );
                      }}
                      renderButton={(selectedItem, isOpened) => {
                        return (
                          <TouchableOpacity style={styles.dropdownTypeValue}>
                            <Text style={styles.textInputDropDown}>
                              {(selectedItem && selectedItem.title) ||
                                "Tipo de valor"}
                            </Text>
                            <AntDesign name="down" size={24} color="black" />
                          </TouchableOpacity>
                        );
                      }}
                      renderItem={(item, index, isSelected) => {
                        return (
                          <View
                            style={{
                              ...styles.dropdownItemStyle,
                              ...(isSelected && { backgroundColor: "#2563eb" }),
                            }}
                          >
                            <Text style={styles.dropdownItemTxtStyle}>
                              {item.title}
                            </Text>
                          </View>
                        );
                      }}
                      showsVerticalScrollIndicator={false}
                      dropdownStyle={styles.dropdownStyle}
                    />
                  </View>
                </View>

                <View style={styles.containerSelectTypeValuePressaoTrabalho}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.inputWithDropdown}
                      placeholder="Pressão de Teste Hidrostático de Fabricação"
                      value={formData.pressaoMaximaTrabalhoAdmissivel}
                      onChangeText={(text) =>
                        handleInputChange("pressaoTeste", text)
                      }
                      keyboardType="numeric"
                    />
                    <SelectDropdown
                      data={pressaoDeTrabalho}
                      onSelect={(selectedUnit) => {
                        handleInputChange(
                          "unidadePressaoMaxima",
                          selectedUnit.title
                        );
                      }}
                      renderButton={(selectedItem, isOpened) => {
                        return (
                          <TouchableOpacity style={styles.dropdownTypeValue}>
                            <Text style={styles.textInputDropDown}>
                              {(selectedItem && selectedItem.title) ||
                                "kgf/cm²"}
                            </Text>
                            <AntDesign name="down" size={24} color="black" />
                          </TouchableOpacity>
                        );
                      }}
                      renderItem={(item, index, isSelected) => {
                        return (
                          <View
                            style={{
                              ...styles.dropdownItemStyle,
                              ...(isSelected && { backgroundColor: "#2563eb" }),
                            }}
                          >
                            <Text style={styles.dropdownItemTxtStyle}>
                              {item.title}
                            </Text>
                          </View>
                        );
                      }}
                      showsVerticalScrollIndicator={false}
                      dropdownStyle={styles.dropdownStyle}
                    />
                  </View>
                </View>

                <View style={styles.containerSelectTypeValuePressaoTrabalho}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.inputWithDropdown}
                      placeholder="Capacidade"
                      value={formData.volume}
                      onChangeText={(text) => handleInputChange("volume", text)}
                      keyboardType="numeric"
                    />
                    <SelectDropdown
                      data={volumes}
                      onSelect={(selectedUnit) => {
                        handleInputChange("tipoVolume", selectedUnit.title);
                      }}
                      renderButton={(selectedItem, isOpened) => {
                        return (
                          <TouchableOpacity style={styles.dropdownTypeValue}>
                            <Text style={styles.textInputDropDown}>
                              {(selectedItem && selectedItem.title) ||
                                "Tipo de Valor"}
                            </Text>
                            <AntDesign name="down" size={24} color="black" />
                          </TouchableOpacity>
                        );
                      }}
                      renderItem={(item, index, isSelected) => {
                        return (
                          <View
                            style={{
                              ...styles.dropdownItemStyle,
                              ...(isSelected && {
                                backgroundColor: "#2563eb",
                              }),
                            }}
                          >
                            <Text style={styles.dropdownItemTxtStyle}>
                              {item.title}
                            </Text>
                          </View>
                        );
                      }}
                      showsVerticalScrollIndicator={false}
                      dropdownStyle={styles.dropdownStyle}
                    />
                  </View>
                </View>

                <TextInput
                  style={styles.textInput}
                  placeholder="Código do projeto"
                  value={formData.codProjeto}
                  onChangeText={(text) => handleInputChange("codProjeto", text)}
                />

                <TextInput
                  style={styles.textInput}
                  placeholder="Ano de Edição"
                  value={formData.anoEdicao}
                  onChangeText={(text) => handleInputChange("anoEdicao", text)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.containerCategorizacao}>
                <View>
                  <Text style={styles.title}>Dados dos fluídos</Text>

                  <TextInput
                    style={styles.textInput}
                    placeholder="Fluídos de serviço"
                    value={formData.fluidosServico}
                    onChangeText={(text) =>
                      handleInputChange("fluidosServico", text)
                    }
                  />

                  <View style={styles.inputContainerWhithInfoInFinal}>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.inputWithDropdown}
                        placeholder="Temperatura do projeto"
                        value={formData.temperaturaProjeto}
                        onChangeText={(text) =>
                          handleInputChange("temperaturaProjeto", text)
                        }
                        keyboardType="numeric"
                      />
                      <Text style={styles.unitLabel}>°C</Text>
                    </View>
                  </View>

                  <View style={styles.inputContainerWhithInfoInFinal}>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.inputWithDropdown}
                        placeholder="Temperatura de trabalho"
                        value={formData.temperaturaTrabalho}
                        onChangeText={(text) =>
                          handleInputChange("temperaturaTrabalho", text)
                        }
                        keyboardType="numeric"
                      />
                      <Text style={styles.unitLabel}>°C</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <Pressable onPress={isEditMode ? handleUpdateData : handleSaveData}>
              <View style={styles.buttonFunctionsInModal}>
                <AntDesign name="save" size={24} color="white" />
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {isEditMode ? "Atualizar equipamento" : "Salvar Equipamento"}
                </Text>
                <AntDesign name="plus" size={24} color="white" />
              </View>
            </Pressable>
          </ScrollView>
        );
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <AddImageInProjectModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onImagePicked={openImagePickerAsync}
          onCameraOpen={openCameraAsync}
        />

        <View style={{ height: 120 }}>
          <ScrollView horizontal={true} style={styles.imageRow}>
            {images.map((image, index) => (
              <Pressable
                key={index}
                onPress={() => handleImagePress(index)}
                style={styles.imageBox}
              >
                <Text style={styles.imageLabel}>{imageLabels[index]}</Text>
                {image === "loading" ? (
                  <View style={styles.loadingContainer}>
                    <Text>Carregando...</Text>
                  </View>
                ) : image ? (
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: image }} style={styles.image} />
                  </View>
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Feather name="camera" size={24} color="gray" />
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <SelectDropdown
          data={typeEquipmentsInNr13}
          onSelect={(selectedTypeEquipment, index) => {
            handleInputChange("tipoEquipamento", selectedTypeEquipment.title);
          }}
          renderButton={(selectedItem, isOpened) => {
            return (
              <View
                style={[
                  styles.dropdownButtonStyle,
                  Platform.OS === "web" && styles.webDropdownButtonStyle,
                ]}
              >
                <Text
                  style={[
                    styles.textInputDropDown,
                    Platform.OS === "web" && styles.webTextInputDropDown,
                  ]}
                >
                  {(selectedItem && selectedItem.title) || "Tipo de equipamento"}
                </Text>
                <AntDesign name="down" size={20} color="#333" />
              </View>
            );
          }}
          renderItem={(item, index, isSelected) => {
            return (
              <View
                style={[
                  styles.dropdownItemStyle,
                  Platform.OS === "web" && styles.webDropdownItemStyle,
                  isSelected && { backgroundColor: "#2563eb" },
                ]}
              >
                <Text
                  style={[
                    styles.dropdownItemTxtStyle,
                    Platform.OS === "web" && styles.webDropdownItemTxtStyle,
                  ]}
                >
                  {item.title}
                </Text>
              </View>
            );
          }}
          showsVerticalScrollIndicator={false}
        />

        {renderFields()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scrollView: {
    flex: 1,
    maxHeight: "100vh",
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  modalContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  overlay: {
    flex: 1,
  },
  button: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "80%",
  },
  buttonText: {
    fontSize: 16,
  },
  imageRow: {
    flexDirection: "row",
    height: 120,
  },
  imageBox: {
    width: 100,
    height: 120,
    marginRight: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    borderRadius: 8,
    overflow: "hidden",
  },
  imageLabel: {
    fontSize: 12,
    fontWeight: "bold",
    padding: 4,
    backgroundColor: "rgba(112, 71, 71, 0)",
    width: "100%",
    textAlign: "center",
    zIndex: 1,
  },
  imageContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    width: "100%",
  },
  infosEquipments: {
    flex: 1,
    marginTop: 20,
  },
  textInput: {
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  dropdownItemStyle: {
    backgroundColor: "#e5e5e5",
    padding: 20,
    margin: 5,
    borderRadius: 5,
  },
  dropdownButtonStyle: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    borderColor: "gray",
    borderWidth: 1,
    width: "100%",
    height: Platform.OS === "web" ? 40 : "auto",
  },

  webDropdownButtonStyle: {
    maxHeight: 50,
    margin: "0 auto", // Centraliza na tela
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)", // Adiciona sombra
    cursor: "pointer", // Cursor do mouse
  },
  webTextInputDropDown: {
    fontSize: 18,
    fontWeight: "500",
  },
  webDropdownItemStyle: {
    paddingVertical: 12,
    borderRadius: 6,
    marginVertical: 4,
  },
  webDropdownItemTxtStyle: {
    fontSize: 16,
    color: "#444",
  },
  containerPlacaIdentificacao: {
    backgroundColor: "#fef9c3",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginVertical: 10,
  },
  containerCategorizacao: {
    backgroundColor: "#bae6fd",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginVertical: 10,
  },
  containerDadosOperacionais: {
    backgroundColor: "#fef9c3",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginVertical: 10,
  },
  title: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  containerSelectTypeValuePressaoTrabalho: {
    width: Platform.OS === "web" ? "100%" : "auto",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    width: Platform.OS === "web" ? "100%" : "auto",
    flexDirection: "row",
    borderColor: "#ccc",
    borderRadius: 5,
  },
  buttonFunctionsInModal: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    backgroundColor: "#1d4ed8",
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 10,
    marginBottom: Platform.OS === "web" ? 120 : 0,
  },
  dropdownTypeValue: {
    minWidth: Platform === "web" ? 300 : "auto",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    padding: 10,
    marginBottom: 10,
    borderBottomStartRadius: 0,
    borderTopLeftRadius: 0,
    borderRadius: 5,
    borderColor: "gray",
    borderWidth: 1,
    borderLeftWidth: 0,
  },
  inputWithDropdown: {
    borderColor: "gray",
    paddingLeft: 15,
    width: Platform.OS === "web" ? "100%" : "72%",
    borderWidth: 1,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 10,
    borderRadius: 5,
  },
  inputContainerWhithInfoInFinal: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  unitLabel: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    padding: 12,
    marginBottom: 10,
    borderBottomLeftRadius: 0,
    borderTopLeftRadius: 0,
    borderRadius: 5,
    borderColor: "gray",
    borderWidth: 1,
    borderLeftWidth: 0, // Espaçamento entre o input e a unidade
  },
  listContainer: {
    marginTop: 5,
    paddingLeft: 10,
    width: "100%",
  },
  listItem: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
    lineHeight: 20,
    flexWrap: "wrap",
  },
});

export default Equipment;
