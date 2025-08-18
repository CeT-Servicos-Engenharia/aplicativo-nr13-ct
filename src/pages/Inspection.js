import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  Image,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  FlatList,
  LogBox,
  Platform,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import checklistItemsInspection from "../components/checklistItemsInspection";
import CommentModal from "../components/modal/CommentModal";
import ChecklistDocumentationModal from "../components/modal/ChecklistDocumentationModal";
import ExtraordinaryInspectionModal from "../components/modal/ExtraordinaryInspectionModal";
import TampoInferiorModal from "../components/modal/TampoInferiorModal";
import CostadoModal from "../components/modal/CostadoModal";
import TampoSuperiorModal from "../components/modal/TampoSuperiorModal";
import BocalModal from "../components/modal/BocalModal";
import styles from "../components/Stylespages/StyleInspection";
import AddImageInProjectModal from "../components/modal/AddImageInProjectModal";
import DevicesModal from "../components/modal/DevicesModal";
import ChecklistItensNR13 from "../components/modal/ChecklistItensNR13";
import RecommendationsPLHModal from "../components/modal/RecommendationPLHModal";
import * as FileSystem from "expo-file-system";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
  uploadBytes,
} from "firebase/storage";
import { db, storage } from "../../database/firebaseConfig";
import DefineNameImage from "../components/modal/DefineNameImage";
import UpdateImageInProjectModal from "../components/modal/UpdateImageInProjectModal";
import NetInfo from "@react-native-community/netinfo";

const Inspection = ({ route, navigation }) => {
  LogBox.ignoreLogs([
    "VirtualizedLists should never be nested inside plain ScrollViews", // Ignora o aviso específico
  ]);

  const formatDate = (dateString) => {
    if (!dateString) return "";

    // Se a data vier no formato YYYY-MM-DD (formato do input date)
    if (dateString.includes('-')) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }

    // Se a data vier em outro formato, tenta converter
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return dateString;
    }
  };

  const { projectName, updateDataMedition, Idproject, tipoEquipamento, categoriaVasoPressao, updateMedicalRecordData } = route.params || {
    projectName: "projeto desconhecido",
  };

  const [isEditMode, setIsEditMode] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [typeEquipment, setTypeEquipment] = useState('');
  const [categoryPressureVessel, setCategoryPressureVessel] = useState('');
  const [images, setImages] = useState([]);
  const [captioins, setCaptions] = useState([]);
  const [modalTypeUploadPicture, setModalTypeUploadPicture] = useState(false);
  const [modalUpdateImage, setModalUpdateImage] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isDateNextInspectionPLHInternalVisible, setDateNextInspectionPLHInternalVisible] =
    useState(false);
  const [isDateNextInspectionPLHExternalVisible, setDateNextInspectionPLHExternalVisible] =
    useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedTypesInspection, setSelectedTypesInspection] = useState({
    inicial: false,
    periodica: false,
    extraordinaria: false,
  });
  const [selectedPeriodicInspection, setSelectedPeriodicInspection] = useState({
    interna: false,
    externa: false,
    hidrostatico: false,
  });
  const [selectedResultInspection, setSelectedResultInspection] = useState({
    approved: false,
    failed: false,
  });
  const [calculatedEndDates, setCalculatedEndDates] = useState(null);
  const [calculatedEndDatesInternal, setCalculatedEndDatesInternal] = useState(null);
  const [calculatedEndDatesExternal, setCalculatedEndDatesExternal] = useState("");
  const [dateNextInspectionPLH, setDateNextInspectionPLH] = useState(null);
  const [dateNextInspectionPLHExternal, setDateNextInspectionPLHExternal] = useState(null);
  const [dateNextInspectionPLHInternal, setDateNextInspectionPLHInternal] = useState(null);
  const [modalExtraordinary, setModalExtraordinary] = useState(false);
  const [checklistSelections, setChecklistSelections] = useState({});
  const [modalComment, setModalComment] = useState(false);
  const [selectedCommentItem, setSelectedCommentItem] = useState(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState({});
  const [selectedExtraordinaryCases, setSelectedExtraordinaryCases] = useState(
    []
  );
  const [selectedNrDocumentationCases, setSelectedNrDocumentationCases] =
    useState([]);
  const [selectedRecommendationPLHCases, setSelectedRecommendationPLHCases] =
    useState([]);
  const [isChecklistNormNR13ModalVisible, setIsChecklistNormNR13ModalVisible] =
    useState(false);
  const [equipmentBodies, setEquipmentBodies] = useState([
    {
      id: 1,
      title: "",
    },
  ]);
  const [inspectionData, setInspectionData] = useState({});
  const [mapOfMeditionData, setMapOfMeditionData] = useState({});
  const [medicalRecordData, setMedicalRecordData] = useState({});
  const [tampoInferiorData, setTampoInferiorData] = useState([]);
  const [tampoInferiorList, setTampoInferiorList] = useState([]);
  const [costadoData, setCostadoData] = useState([]);
  const [costadoList, setCostadoList] = useState([]);
  const [tampoSuperiorData, setTampoSuperiorData] = useState([]);
  const [tampoSuperiorList, setTampoSuperiorList] = useState([]);
  const [bocalList, setBocalList] = useState([]);
  const [bocalData, setBocalData] = useState([]);
  const [deviceList, setDeviceList] = useState([]);
  const [devicesData, setDevicesData] = useState([]);
  const [peopleWhoAccompanied, setPeopleWhoAccompanied] = useState("");
  const [previousData, setPreviousData] = useState({});
  const [attachment, setAttachment] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [conclusion, setConclusion] = useState("");

  const [isConnected, setIsConnected] = useState(false); // Inicialmente indefinido
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);


  // Log do estado
  console.log(`Está no modo: ${isConnected ? "ON" : "OFF"}`);

  useEffect(() => {
    // Inscreve-se para ouvir as mudanças na conexão
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    // Cleanup: remove o listener ao desmontar o componente
    return () => unsubscribe();
  }, []);

  const deleteBocal = (index) => {
    const newListBocals = bocalList.filter((_, i) => i != index);
    setBocalList(newListBocals);
  }

  const editBocal = (index) => {
    const selectedBocal = JSON.parse(JSON.stringify(bocalList[index]));
    setBocalData(selectedBocal);
    setSelectedIndex(index);
    toogleModal("BocalModal");
  }

  const editDevice = (index) => {
    const selectDevcie = JSON.parse(JSON.stringify(deviceList[index]));
    console.log(selectDevcie)
    setDevicesData(selectDevcie);
    setSelectedIndex(index);
    toogleModal("DevicesModal");
  };

  const excluirDispositivo = (index) => {
    const novaLista = deviceList.filter((_, i) => i !== index);
    setDeviceList(novaLista);
  };

  const addBottomTop = (newBottomTop) => {
    console.log("Novo Tampo inferior recebido para salvar:", newBottomTop);
    setTampoInferiorList((prevList = []) => {
      const updatedListBottomTop = [...prevList, newBottomTop];
      return updatedListBottomTop;
    });
    setTampoInferiorData(newBottomTop);
    console.log("Tampo inferior atuais em tampoInferior:", newBottomTop);
    console.log("tampoInferiorList:", tampoInferiorList);
    console.log("tampoInferiorData:", tampoInferiorData);
  };

  const addCostado = (newCostado) => {
    console.log("Novo Costado recebido para salvar:", newCostado);
    setCostadoList((prevList = []) => {
      const updatedListCostado = [...prevList, newCostado];
      return updatedListCostado;
    });
    setCostadoData(newCostado);
    console.log("Tampo inferior atuais em tampoInferior:", newCostado);
    console.log("CostadoListList:", costadoList);
    console.log("CostadoData:", costadoData);
  };

  const addTampoSuperior = (newTampoSuperior) => {
    console.log("Novo Tampo Superior recebido para salvar:", newTampoSuperior);
    setTampoSuperiorList((prevList = []) => {
      const updatedListTampoSuperior = [...prevList, newTampoSuperior];
      return updatedListTampoSuperior;
    });
    setTampoSuperiorData(newTampoSuperior);
    console.log("Tampo superior atuais em tampoSuperior:", newTampoSuperior);
    console.log("tampoSuperiorList:", tampoSuperiorList);
    console.log("tampoSuperiorData:", tampoSuperiorData);
  };

  const addBocal = (newBocal) => {
    console.log("Novo bocal recebido para salvar:", newBocal);
    setBocalList((prevList) => {
      const updatedListBocal = [...prevList, newBocal];
      console.log("Lista de bocais atualizada:", updatedListBocal);
      return updatedListBocal;
    });
    setBocalData(newBocal);
    console.log("Bocais atuais em bocalData:", newBocal);
  };

  useEffect(() => {
    if (Idproject) {
      setIsEditMode(true);
      const loadInspectionData = async () => {
        try {
          const inspectionRef = doc(db, "inspections", Idproject);
          const docSnapshot = await getDoc(inspectionRef);

          if (docSnapshot.exists()) {
            const data = docSnapshot.data();

            const nrDocumentationCases = data.inspection
              .selectedNrDocumentationCases
              ? JSON.parse(data.inspection.selectedNrDocumentationCases)
              : [];

            const plhCases = data.inspection.selectedRecommendationPLHCases
              ? JSON.parse(data.inspection.selectedRecommendationPLHCases)
              : [];

            setInspectionData(data);
            setTypeEquipment(data.tipoEquipamento);
            setCategoryPressureVessel(data.categoriaVasoPressao || "");
            const imagesFromFirebase = data.inspection.images || [];
            console.log("Imagens recebidas:", imagesFromFirebase);
            setImages(imagesFromFirebase);
            console.log("Imagens no estado:", images);
            setSelectedTypesInspection(
              data.inspection.selectedTypesInspection || [false, false, false]
            );
            setSelectedPeriodicInspection(
              data.inspection.selectedPeriodicInspection || [
                false,
                false,
                false,
              ]
            );
            setImageCaptions(data.inspection.imagesWithCaptions.map(img => img.caption) || []);

            console.log("Log dos captions encontrados: ", data.inspection.imagesWithCaptions)
            setStartDate(data.inspection.startDate || null);
            setEndDate(data.inspection.endDate || null);
            setChecklistSelections(data.inspection?.checklistSelections || {});
            setTampoInferiorData(data.inspection?.tampoInferiorData || {});
            setTampoSuperiorData(data.inspection?.tampoSuperiorData || {});
            setCostadoData(data.inspection?.costadoData || {});
            setBocalList(data.inspection.bocalData || []);
            setDeviceList(data.inspection.devicesData || []);
            setSelectedNrDocumentationCases(nrDocumentationCases);
            setSelectedRecommendationPLHCases(plhCases);
            setCalculatedEndDates(
              data.inspection.DateNextInspectionDocummentation || null
            );
            setDateNextInspectionPLH(
              data.inspection.DateNextIsnpectionPLH || null
            );
            setDateNextInspectionPLHExternal(data.inspection.DateNextInspectionPLHExternal || null);
            setDateNextInspectionPLHInternal(data.inspection.DateNextIsnpectionPLHInternal || null);
            setPeopleWhoAccompanied(data.inspection.peopleWhoAccompanied || "");
            setConclusion(data.inspection.conclusion || "");
            setSelectedResultInspection(
              data.inspection.selectedResultInspection || null
            );
            setCalculatedEndDatesExternal(data.inspection.DateNextInspectionDocummentationExternal || "");
            setCalculatedEndDatesInternal(data.inspection.DateNextInspectionDocummentationInternal || "");
            setMedicalRecordData(data.inspection.medicalRecord || {});
          } else {
            Alert.alert("Erro", "Dados do projeto não encontrados.");
          }
        } catch (error) {
          console.error("Erro ao carregar os dados:", error);
          Alert.alert(
            "Erro",
            "Não foi possível carregar os dados da inspeção."
          );
        }
      };
      loadInspectionData();
    }
  }, [Idproject]);

  const [inspectionDataJSON, setInspectionDataJSON] = useState([]);

  useEffect(() => {
    console.log("Project name changed:", projectName);
    const loadInspectionData = async () => {
      const filePath = `${FileSystem.documentDirectory}projects/${projectName}.json`;
      try {
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (!fileInfo.exists) {
          Alert.alert("Erro", "O arquivo de dados não foi encontrado.");
          return;
        }

        const fileContents = await FileSystem.readAsStringAsync(filePath);
        const data = JSON.parse(fileContents);

        if (typeof data === "object" && data !== null) {
          setInspectionDataJSON(data);
          console.log("Dados carregados:", data)
        } else {
          Alert.alert("Erro", "Os dados carregados não são um array.");
        }
        setTypeEquipment(data.tipoEquipamento);
        console.log("Tipo de equipamento:", typeEquipment);
        setCategoryPressureVessel(data.categoriaVasoPressao || "");

        setPreviousData(data);
      } catch (error) {
        Alert.alert("Erro", "Não foi possível carregar os dados do projeto.");
        console.error(error);
      }
    };

    if (projectName) {
      loadInspectionData();
    }
  }, [projectName]);

  const saveInspectionOffline = async () => {
    try {
      // 🔹 Caminho do arquivo JSON
      const dirPath = `${FileSystem.documentDirectory}projects/`;
      const filePath = `${dirPath}${projectName}.json`;

      // 🔹 Verifica se o arquivo existe
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      let existingData = {};

      if (fileInfo.exists) {
        // 🔹 Lê o conteúdo do arquivo JSON
        const fileContents = await FileSystem.readAsStringAsync(filePath);
        existingData = JSON.parse(fileContents);
      }

      // 🔹 Garante que `existingData` seja um objeto válido
      if (typeof existingData !== "object" || existingData === null) {
        existingData = {};
      }

      // 🔹 Atualiza os dados com a nova inspeção sem perder os antigos
      const newInspectionData = {
        ...existingData,
        inspection: {
          startDate: startDate || "",
          endDate: endDate || "",
          DateNextInspectionDocummentation: calculatedEndDates || "",
          DateNextInspectionDocummentationInternal: calculatedEndDatesInternal || "",
          DateNextInspectionDocummentationExternal: calculatedEndDatesExternal || "",
          DateNextInspectionPLHExternal: dateNextInspectionPLHExternal || "",
          DateNextIsnpectionPLHInternal: dateNextInspectionPLHInternal || "",
          DateNextIsnpectionPLH: dateNextInspectionPLH || "",
          selectedTypesInspection: selectedTypesInspection || [],
          selectedPeriodicInspection: selectedPeriodicInspection || [],
          selectedResultInspection: selectedResultInspection || "",
          checklistSelections: checklistSelections || {},
          comments: comments || "",
          tampoInferiorData: tampoInferiorData || {},
          tampoSuperiorData: tampoSuperiorData || {},
          costadoData: costadoData || {},
          bocalData: bocalList || [],
          selectedExtraordinaryCases: selectedExtraordinaryCases || [],
          selectedNrDocumentationCases: JSON.stringify(
            selectedNrDocumentationCases || []
          ),
          selectedRecommendationPLHCases: JSON.stringify(
            selectedRecommendationPLHCases || []
          ),
          devicesData: deviceList || [],
          mapOfMedition: updateDataMedition || mapOfMeditionData || {},
          medicalRecord: medicalRecordData || {},
          peopleWhoAccompanied: peopleWhoAccompanied || "",
          attachments: attachments || "",
          conclusion: conclusion || "",
          images: images || [],
          imageCaptions: captions || [],
          createdAt: new Date(),
        },
      };

      // 🔹 Converte para JSON e salva no arquivo
      const jsonData = JSON.stringify(newInspectionData);
      await FileSystem.writeAsStringAsync(filePath, jsonData);
      console.log("DADOS SALVOS NO JSON: ", jsonData)
      console.log("📁 Inspeção salva no JSON offline:", filePath);

      Alert.alert("Sucesso", "Inspeção salva no modo offline!");
      navigation.navigate("Home");
    } catch (error) {
      console.error("❌ Erro ao salvar inspeção offline:", error);
      Alert.alert("Erro", "Não foi possível salvar os dados offline.");
    }
  };

  useEffect(() => {
    if (updateDataMedition) {
      console.log("Dados de medição recebidos:", updateDataMedition);
      setMapOfMeditionData(updateDataMedition);
    } else {
      console.log("Ainda não foram recebidos dados de medição.");
    }
  }, [updateDataMedition]);

  useEffect(() => {
    if (updateMedicalRecordData) {
      console.log("Dados do prontuário médico recebidos:", updateMedicalRecordData);
      setMedicalRecordData(updateMedicalRecordData);
    } else {
      console.log("Ainda não foram recebidos dados do prontuário médico.");
    }
  }, [updateMedicalRecordData]);

  const uploadImagesToStorage = async (imageUris) => {
    console.log("🚀 Iniciando upload de imagens...");
    const totalImages = imageUris.length;
    let completedUploads = 0;

    const imageUrls = await Promise.all(
      imageUris.map(async (uri, index) => {
        try {
          const imageRef = ref(storage, `inspections/image_${Date.now()}_${index}.jpg`);
          const response = await fetch(uri);
          if (!response.ok) {
            throw new Error(`Erro ao buscar a imagem ${index}: Status ${response.status}`);
          }
          const blob = await response.blob();
          const contentType = blob.type || "image/jpeg";
          const metadata = { contentType };
          await uploadBytes(imageRef, blob, metadata);

          completedUploads++;
          setUploadProgress(Math.round((completedUploads / totalImages) * 100));

          const downloadURL = await getDownloadURL(imageRef);
          return downloadURL;
        } catch (error) {
          console.error(`Erro no upload da imagem ${index}:`, error);
          throw error;
        }
      })
    );
    return imageUrls;
  };

  const saveInspection = async () => {
    try {
      setLoading(true);
      setUploadProgress(0);
      let newInspectionData = {};

      // Upload de imagens com progresso
      const imageUrls = images.length > 0 ? await uploadImagesToStorage(images) : [];
      const imagesWithCaptions = imageUrls.map((url, index) => ({
        index,
        caption: imageCaptions[index] || "",
      }));

      // Preparar dados para salvar
      newInspectionData = {
        ...previousData,
        inspection: {
          startDate: startDate || "",
          endDate: endDate || "",
          DateNextInspectionDocummentation: calculatedEndDates || "",
          DateNextInspectionDocummentationInternal: calculatedEndDatesInternal || "",
          DateNextInspectionDocummentationExternal: calculatedEndDatesExternal || "",
          DateNextInspectionPLHExternal: dateNextInspectionPLHExternal || "",
          DateNextIsnpectionPLHInternal: dateNextInspectionPLHInternal || "",
          DateNextIsnpectionPLH: dateNextInspectionPLH || "",
          selectedTypesInspection: selectedTypesInspection || [],
          selectedPeriodicInspection: selectedPeriodicInspection || [],
          selectedResultInspection: selectedResultInspection || "",
          checklistSelections: Object.keys(checklistSelections).reduce(
            (acc, key) => {
              if (checklistSelections[key] !== "N/A") {
                const itemLabel = checklistItemsInspection.find(
                  (item) => item.id === parseInt(key)
                )?.label;
                if (itemLabel) {
                  acc[itemLabel] = checklistSelections[key];
                }
              }
              return acc;
            },
            {}
          ),
          comments: comments || "",
          tampoInferiorData: tampoInferiorData || {},
          tampoSuperiorData: tampoSuperiorData || {},
          costadoData: costadoData || {},
          bocalData: bocalList || [],
          selectedExtraordinaryCases: selectedExtraordinaryCases || [],
          selectedNrDocumentationCases: JSON.stringify(
            selectedNrDocumentationCases || []
          ),
          selectedRecommendationPLHCases: JSON.stringify(
            selectedRecommendationPLHCases || []
          ),
          devicesData: deviceList || {},
          mapOfMedition: updateDataMedition || mapOfMeditionData || {},
          medicalRecord: medicalRecordData || {},
          peopleWhoAccompanied: peopleWhoAccompanied || "",
          attachments: attachments || "",
          conclusion: conclusion || "",
          images: imageUrls || [],
          imagesWithCaptions: imagesWithCaptions || [],
          createdAt: new Date(),
        },
      };

      // Salvar no Firebase
      await addDoc(collection(db, "inspections"), newInspectionData);

      // Salvar localmente se necessário
      if (Platform.OS !== "web") {
        const dirPath = `${FileSystem.documentDirectory}inspections/`;
        const filePath = `${dirPath}${projectName}.json`;

        const dirInfo = await FileSystem.getInfoAsync(dirPath);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
        }

        await FileSystem.writeAsStringAsync(filePath, JSON.stringify(newInspectionData));
      }

      setLoading(false);
      setUploadProgress(0);
      Alert.alert("Sucesso", "Inspeção salva com sucesso!");
      navigation.navigate('Home');
    } catch (error) {
      console.error("Erro ao salvar inspeção: ", error);
      Alert.alert("Erro", "Não foi possível salvar a inspeção.");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const updateInspectionData = async () => {
    if (!Idproject) {
      Alert.alert("Erro", "ID do projeto não fornecido.");
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(0);

      // Upload de imagens com progresso
      const imageUrls = images.length > 0 ? await uploadImagesToStorage(images) : [];
      const imagesWithCaptions = imageUrls.map((url, index) => ({
        index,
        caption: imageCaptions[index] || "",
      }));

      const updatedData = {
        inspection: {
          selectedNrDocumentationCases: JSON.stringify(
            selectedNrDocumentationCases
          ),
          selectedRecommendationPLHCases: JSON.stringify(
            selectedRecommendationPLHCases
          ),
          images: imageUrls || [],
          selectedTypesInspection: selectedTypesInspection || [
            false,
            false,
            false,
          ],
          selectedPeriodicInspection: selectedPeriodicInspection || [
            false,
            false,
            false,
          ],
          startDate: startDate || null,
          endDate: endDate || null,
          checklistSelections: checklistSelections || {},
          tampoInferiorData: tampoInferiorData || {},
          tampoSuperiorData: tampoSuperiorData || {},
          costadoData: costadoData || {},
          bocalData: bocalList || [],
          devicesData: deviceList || [],
          mapOfMedition: updateDataMedition || mapOfMeditionData || [],
          medicalRecord: medicalRecordData || {},
          DateNextInspectionDocummentation: calculatedEndDates || "",
          DateNextInspectionDocummentationInternal: calculatedEndDatesInternal || "",
          DateNextInspectionDocummentationExternal: calculatedEndDatesExternal || "",
          DateNextIsnpectionPLH: dateNextInspectionPLH || null,
          DateNextInspectionPLHExternal: dateNextInspectionPLHExternal || "",
          DateNextIsnpectionPLHInternal: dateNextInspectionPLHInternal || "",
          peopleWhoAccompanied: peopleWhoAccompanied || "",
          conclusion: conclusion || "",
          selectedResultInspection: selectedResultInspection || null,
          imagesWithCaptions: imagesWithCaptions || [],
          createdAt: new Date(),
        },
      };

      const inspectionRef = doc(db, "inspections", Idproject);
      await updateDoc(inspectionRef, updatedData);

      setLoading(false);
      setUploadProgress(0);
      Alert.alert("Sucesso", "Dados atualizados com sucesso!");
      navigation.navigate('Home');
    } catch (error) {
      setLoading(false);
      setUploadProgress(0);
      console.error("Erro ao atualizar os dados:", error);
      Alert.alert("Erro", "Não foi possível atualizar os dados da inspeção.");
    }
  };

  const addEquipmentBody = () => {
    const newId = equipmentBodies.length + 1;
    setEquipmentBodies([...equipmentBodies, { id: newId, title: "" }]);
  };

  const handleTitleChange = (text, index) => {
    const updatedBodies = [...equipmentBodies];
    updatedBodies[index].title = text;
    setEquipmentBodies(updatedBodies);
  };

  const [modals, setModals] = useState({
    RecommendationsPLHModal: false,
    modalChecklitDocumentation: false,
    BocalModal: false,
    DevicesModal: false,
    DefineNameImage: {
      visible: false,
      index: null, // Índice da imagem a ser editada
      title: "", // Título temporário da imagem
    },
    TampoInferiorModal: false,
    CostadoModal: false,
    TampoSuperiorModal: false,
  });

  const toogleModal = (modalName, options = {}) => {
    setModals((prevModals) => ({
      ...prevModals,
      [modalName]:
        typeof prevModals[modalName] === "object"
          ? { ...prevModals[modalName], ...options }
          : !prevModals[modalName],
    }));
  };

  const openChecklistNormNR13Modal = () =>
    setIsChecklistNormNR13ModalVisible(true);
  const closeChecklistNormNR13Modal = () =>
    setIsChecklistNormNR13ModalVisible(false);

  const handleToggleExtraordinaryModal = () => {
    setModalExtraordinary(!modalExtraordinary);
  };

  const handleSelectExtraordinaryCases = (item) => {
    setSelectedExtraordinaryCases((prevSelected) => {
      const isSelected = prevSelected.some(
        (selectedItem) => selectedItem.id === item.id
      );

      if (isSelected) {
        return prevSelected.filter(
          (selectedItem) => selectedItem.id !== item.id
        );
      } else {
        return [...prevSelected, item];
      }
    });
  };

  const handleSelectNRDocumentationCases = (item) => {
    setSelectedNrDocumentationCases((prevItems) => {
      const isSelected = prevItems.some(
        (selectedItem) => selectedItem.id === item.id
      );
      if (isSelected) {
        return prevItems.filter((selectedItem) => selectedItem.id !== item.id);
      } else {
        return [...prevItems, item];
      }
    });
  };

  const handleSelectRecommendationsPLHCases = (item) => {
    setSelectedRecommendationPLHCases((prevItems) => {
      const isSelected = prevItems.some(
        (selectedItem) => selectedItem.id === item.id
      );
      if (isSelected) {
        return prevItems.filter((selectedItem) => selectedItem.id !== item.id);
      } else {
        return [...prevItems, item];
      }
    });
  };

  const openModalComment = (itemId) => {
    setSelectedCommentItem(itemId);
    setComment(comments[itemId] || "");
    setModalComment(true);
  };

  const saveComment = () => {
    setComments((prevComments) => ({
      ...prevComments,
      [selectedCommentItem]: comment,
    }));
    setModalComment(false);
  };

  const toggleSelection = (type) => {
    setSelectedTypesInspection((prevState) => ({
      ...prevState,
      [type]: !prevState[type],
    }));
  };

  const toggleSelectionPeriodicType = (type) => {
    setSelectedPeriodicInspection((prevState) => ({
      ...prevState,
      [type]: !prevState[type],
    }));
  };

  const toggleSelectionResultInspection = (type) => {
    setSelectedResultInspection((prevState) => ({
      approved: type === "approved",
      failed: type === "failed",
    }));
  };

  const toggleChecklistSelection = (id, option) => {
    setChecklistSelections((prevState) => ({
      ...prevState,
      [id]: option,
    }));
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    setStartDate(date.toLocaleDateString());
    hideDatePicker();
  };

  const showDateNextInspectionPLHExternalPicker = () => {
    setDateNextInspectionPLHExternalVisible(true);
  };

  const showDateNextInspectionPLHInternalPicker = () => {
    setDateNextInspectionPLHInternalVisible(true);
  };

  const hideDateNextInspectionPLHExternalPicker = () => {
    setDateNextInspectionPLHVisible(false);
  };

  const handleDateNextInspectionPLHExternalConfirm = (date) => {
    setDateNextInspectionPLHExternal(date.toLocaleDateString());
    hideDateNextInspectionPLHExternalPicker();
  };

  const hideDateNextInspectionPLHInternalPicker = () => {
    setDateNextInspectionPLHVisible(false);
  };

  const handleDateNextInspectionPLHInternalConfirm = (date) => {
    setDateNextInspectionPLHInternal(date.toLocaleDateString());
    hideDateNextInspectionPLHInternalPicker();
  };

  const showEndDatePicker = () => {
    setEndDatePickerVisibility(true);
  };

  const hideEndDatePicker = () => {
    setEndDatePickerVisibility(false);
  };

  const handleEndChangeWeb = (e) => {
    const selectedDate = new Date(e.target.value + "T00:00:00");
    setEndDate(selectedDate.toLocaleDateString()); // Define a data inicial corretamente

    // Cópias para manipulação
    const newDate = new Date(selectedDate);
    const newDateInternal = new Date(selectedDate);

    console.log(typeEquipment)
    switch (typeEquipment) {
      case "Caldeira":
        newDate.setFullYear(newDate.getFullYear() + 1);
        newDateInternal.setFullYear(newDateInternal.getFullYear() + 1);
        break;
      case "Vaso de Pressão":
        console.log(categoryPressureVessel)
        switch (categoryPressureVessel) {
          case "I":
            newDate.setFullYear(newDate.getFullYear() + 1);
            setCalculatedEndDatesExternal(newDate.toLocaleDateString());
            newDateInternal.setFullYear(newDateInternal.getFullYear() + 3);
            setCalculatedEndDatesInternal(newDateInternal.toLocaleDateString());
            break;
          case "II":
            newDate.setFullYear(newDate.getFullYear() + 2);
            setCalculatedEndDatesExternal(newDate.toLocaleDateString());
            newDateInternal.setFullYear(newDateInternal.getFullYear() + 4);
            setCalculatedEndDatesInternal(newDateInternal.toLocaleDateString());
            break;
          case "III":
            newDate.setFullYear(newDate.getFullYear() + 3);
            setCalculatedEndDatesExternal(newDate.toLocaleDateString());
            newDateInternal.setFullYear(newDateInternal.getFullYear() + 6);
            setCalculatedEndDatesInternal(newDateInternal.toLocaleDateString());
            break;
          case "IV":
            newDate.setFullYear(newDate.getFullYear() + 4);
            setCalculatedEndDatesExternal(newDate.toLocaleDateString());
            newDateInternal.setFullYear(newDateInternal.getFullYear() + 8);
            setCalculatedEndDatesInternal(newDateInternal.toLocaleDateString());
            break;
          case "V":
            newDate.setFullYear(newDate.getFullYear() + 5);
            setCalculatedEndDatesExternal(newDate.toLocaleDateString());
            newDateInternal.setFullYear(newDateInternal.getFullYear() + 10);
            setCalculatedEndDatesInternal(newDateInternal.toLocaleDateString());
        }
        break;
      case "Tubulação":
        newDate.setFullYear(newDate.getFullYear() + 1);
        newDateInternal.setFullYear(newDateInternal.getFullYear() + 1);
        break;
    }

    setCalculatedEndDates(newDate.toLocaleDateString());
    setCalculatedEndDatesExternal(newDate.toLocaleDateString());
    setCalculatedEndDatesInternal(newDateInternal.toLocaleDateString());
  };

  const handleEndConfirm = (date) => {
    setEndDate(date.toLocaleDateString());
    handleEndChangeWeb({ target: { value: date.toISOString().split("T")[0] } });
    const newDate = new Date(date);
    const newDateInternal = new Date(date);

    console.log(typeEquipment)

    switch (typeEquipment) {
      case "Caldeira":
        newDate.setFullYear(newDate.getFullYear() + 1);
        newDateInternal.setFullYear(newDateInternal.getFullYear() + 1);
        setCalculatedEndDates(newDate.toLocaleDateString());
        setCalculatedEndDatesExternal(newDate.toLocaleDateString());
        setCalculatedEndDatesInternal(newDateInternal.toLocaleDateString());
        break;
      case "Vaso de Pressão":
        switch (categoryPressureVessel) {
          case "I":
            newDate.setFullYear(newDate.getFullYear() + 1);
            setCalculatedEndDatesExternal(newDate.toLocaleDateString());
            newDateInternal.setFullYear(newDateInternal.getFullYear() + 3);
            setCalculatedEndDatesInternal(newDateInternal.toLocaleDateString());
            break;
          case "II":
            newDate.setFullYear(newDate.getFullYear() + 2);
            setCalculatedEndDatesExternal(newDate.toLocaleDateString());
            newDateInternal.setFullYear(newDateInternal.getFullYear() + 4);
            setCalculatedEndDatesInternal(newDateInternal.toLocaleDateString());
            break;
          case "III":
            newDate.setFullYear(newDate.getFullYear() + 3);
            setCalculatedEndDatesExternal(newDate.toLocaleDateString());
            newDateInternal.setFullYear(newDateInternal.getFullYear() + 6);
            setCalculatedEndDatesInternal(newDateInternal.toLocaleDateString());
            break;
          case "IV":
            newDate.setFullYear(newDate.getFullYear() + 4);
            setCalculatedEndDatesExternal(newDate.toLocaleDateString());
            newDateInternal.setFullYear(newDateInternal.getFullYear() + 8);
            setCalculatedEndDatesInternal(newDateInternal.toLocaleDateString());
            break;
          case "V":
            newDate.setFullYear(newDate.getFullYear() + 5);
            setCalculatedEndDatesExternal(newDate.toLocaleDateString());
            newDateInternal.setFullYear(newDateInternal.getFullYear() + 10);
            setCalculatedEndDatesInternal(newDateInternal.toLocaleDateString());
        }
        break;

      case "Tubulação":
        newDate.setFullYear(newDate.getFullYear() + 1);
        setCalculatedEndDates(newDate.toLocaleDateString());
        setCalculatedEndDatesExternal(calculatedEndDates);
        setCalculatedEndDatesInternal(calculatedEndDates);
        break;
    }

    console.log("Data da proxima externa:", newDate.toLocaleDateString());
    console.log("Data da proxima interna: ", newDateInternal.toLocaleDateString())
    hideEndDatePicker();
  };

  useEffect(() => {
    console.log("Estado atualizado - Externa:", calculatedEndDatesExternal);
    console.log("Estado atualizado - Interna:", calculatedEndDatesInternal);
  }, [calculatedEndDatesExternal, calculatedEndDatesInternal]);

  const openImageNameModal = (index) => {
    const currentTitle = images[index]?.title || "";
    toogleModal("DefineNameImage", { visible: true, index, title: currentTitle });
  };

  const [imageCaptions, setImageCaptions] = useState([]); // Armazena as legendas das imagens
  const [modalCaptionVisible, setModalCaptionVisible] = useState(false); // Controla a exibição do modal
  const [captionTemp, setCaptionTemp] = useState(""); // Armazena temporariamente a legenda
  const [selectedImageTemp, setSelectedImageTemp] = useState(null); // Armazena a imagem temporariamente antes da legendaD

  const handleImagePicked = async () => {
    console.log("📸 Iniciando a seleção da imagem...");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled) {
      console.log("❌ Seleção de imagem cancelada!");
      setModalTypeUploadPicture(false);
      return;
    }

    const imageUri = result.assets[0].uri;
    console.log("📸 Imagem selecionada:", imageUri);

    console.log("🔹 selectedIndex no início:", selectedIndex);

    let newIndex = selectedIndex;
    if (selectedIndex !== null) {
      console.log(`🔹 Imagem já selecionada, índice: ${selectedIndex}`);
      if (!isConnected) {
        const localUri = `${FileSystem.documentDirectory}offline-image-${Date.now()}.jpg`;
        await FileSystem.copyAsync({ from: imageUri, to: localUri });
        setImages((prevImages) => {
          const updatedImages = [...prevImages];
          updatedImages[selectedIndex] = localUri;
          return updatedImages;
        });
        console.log("📸 Imagem salva localmente:", localUri);
      } else {
        const uploadedImageUrl = await uploadImagesToStorage(imageUri);
        setImages((prevImages) => {
          const updatedImages = [...prevImages];
          updatedImages[selectedIndex] = uploadedImageUrl;
          return updatedImages;
        });
        console.log("☁️ Imagem enviada para o Firebase:", uploadedImageUrl);
      }
    } else {
      console.log("🔹 Nenhuma imagem previamente selecionada.");

      newIndex = images.length;
      console.log("🔹 Novo índice da imagem:", newIndex);

      console.log("VALOR DO ISCONNECTED: ", isConnected)
      if (!isConnected) {
        const localUri = `${FileSystem.documentDirectory}offline-image-${Date.now()}.jpg`;
        await FileSystem.copyAsync({ from: imageUri, to: localUri });
        setImages((prevImages) => [...prevImages, localUri]);
        console.log("📸 Nova imagem salva localmente:", localUri);
      } else {
        console.log("🚀 Ignorando o upload e usando a imagem local.");

        setImages((prevImages) => [...prevImages, imageUri]); // Usa a URI da própria imagem capturada
        console.log("☁️ Imagem adicionada localmente:", imageUri);
      }
    }

    // Atribua o índice corretamente a selectedImageTemp
    setSelectedImageTemp(newIndex);
    console.log("📸 selectedImageTemp atualizado:", newIndex);

    // Adicione log para verificar o estado da legenda
    console.log("🔹 captionTemp antes de exibir o modal:", captionTemp);

    // Abrir o modal de legenda após salvar a imagem
    setModalCaptionVisible(true);

    // Fechar o modal de upload de imagem
    setModalTypeUploadPicture(false);
  };

  const handleSaveCaption = (caption) => {
    if (selectedImageTemp !== null) {
      setImageCaptions((prevCaptions) => {
        const updatedCaptions = [...prevCaptions];
        updatedCaptions[selectedImageTemp] = caption;
        return updatedCaptions;
      });
    }
    setModalCaptionVisible(false);
  };


  useEffect(() => {
    console.log("Imagens atualizadas:", images);
  }, [images]);

  const handleCameraOpen = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      console.log("📸 Foto tirada com sucesso!");
      const imageUri = result.assets[0].uri;

      let newIndex = selectedIndex;
      if (selectedIndex !== null) {
        console.log(`🔹 Substituindo imagem no índice: ${selectedIndex}`);
        if (!isConnected) {
          const localUri = `${FileSystem.documentDirectory}offline-image-${Date.now()}.jpg`;
          await FileSystem.copyAsync({ from: imageUri, to: localUri });
          setImages((prevImages) => {
            const updatedImages = [...prevImages];
            updatedImages[selectedIndex] = localUri;
            return updatedImages;
          });
          console.log("📸 Imagem salva localmente:", localUri);
        } else {
          setImages((prevImages) => {
            const updatedImages = [...prevImages];
            updatedImages[selectedIndex] = imageUri;
            return updatedImages;
          });
        }
      } else {
        newIndex = images.length;
        console.log("🔹 Adicionando nova imagem no índice:", newIndex);
        
        if (!isConnected) {
          const localUri = `${FileSystem.documentDirectory}offline-image-${Date.now()}.jpg`;
          await FileSystem.copyAsync({ from: imageUri, to: localUri });
          setImages((prevImages) => [...prevImages, localUri]);
          console.log("📸 Nova imagem salva localmente:", localUri);
        } else {
          setImages((prevImages) => [...prevImages, imageUri]);
          console.log("📸 Nova imagem adicionada:", imageUri);
        }
      }

      // Atribui o índice para a legenda
      setSelectedImageTemp(newIndex);
      console.log("📸 selectedImageTemp atualizado:", newIndex);

      // Abre o modal de legenda
      setModalCaptionVisible(true);
    }
    setModalTypeUploadPicture(false);
  };

  const handleAddImagePress = () => {
    setIsModalVisible(true);
  };

  const handleReplaceImage = (index, newUri) => {
    const updatedImages = [...images];
    updatedImages[index] = newUri;
    setImages(updatedImages); // Atualiza o estado do array de imagens
    setModalTypeUploadPicture(false); // Fecha o modal de seleção de imagem
  };


  const handleImagePress = (index) => {
    setSelectedIndex(index);
    if (index !== null) {
      setModalUpdateImage(true);
    } else {
      setModalTypeUploadPicture(true);
    }
  };

  const handleImageOptions = (index) => {
    setSelectedIndex(index);
    setModalTypeUploadPicture(true); // Mostra o modal de substituição
  };

  const handleDeleteImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleAddImage = () => {
    // Adiciona uma imagem com índice e título vazio
    setImages((prevImages) => [...prevImages, { uri: null, title: "" }]);

    // Define o índice da nova imagem e abre o modal para definir o título
    const newIndex = images.length; // Obtém o índice da nova imagem
    toogleModal("DefineNameImage", { visible: true, index: newIndex, title: "" });
  };

  const handleInsertAttachment = () => {
    if (attachment.trim() !== '') {
      setAttachments((prevAttachments) => [...prevAttachments, attachment]);
      setAttachment('')
    }
  }

  useEffect(() => {
    if (tipoEquipamento) {
      setTypeEquipment(tipoEquipamento);
    }
    if (categoriaVasoPressao) {
      setCategoryPressureVessel(categoriaVasoPressao);
    }
  }, [tipoEquipamento, categoriaVasoPressao]);

  return (
    <>
      {loading && (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <View style={styles.loadingAnimation}>
              <ActivityIndicator 
                size="large" 
                color="#1d4ed8" 
                style={styles.loadingIndicator}
              />
            </View>
            <Text style={styles.loadingText}>
              {uploadProgress > 0
                ? `Salvando inspeção... ${uploadProgress}%`
                : "Preparando dados..."}
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
            </View>
          </View>
        </View>
      )}

      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <AddImageInProjectModal
            visible={modalTypeUploadPicture}
            onClose={() => setModalTypeUploadPicture(false)}
            onImagePicked={handleImagePicked}
            onCameraOpen={handleCameraOpen}
          />

          <UpdateImageInProjectModal
            visible={modalUpdateImage}
            onClose={() => setModalUpdateImage(false)}
            onImagePicked={() => {
              setModalUpdateImage(false);
              setModalTypeUploadPicture(true);
            }}
            onDeleteImage={() => {
              handleDeleteImage(selectedIndex); // Exclui a imagem selecionada
              setModalUpdateImage(false); // Fecha o modal
            }}
          />
          <UpdateImageInProjectModal
            visible={modalUpdateImage}
            onClose={() => setModalUpdateImage(false)}
            onImagePicked={() => {
              setModalUpdateImage(false);
              setModalTypeUploadPicture(true);
            }}
            onDeleteImage={() => {
              handleDeleteImage(selectedIndex); // Exclui a imagem selecionada
              setModalUpdateImage(false); // Fecha o modal
            }}
          />

          <DefineNameImage
            visible={modalCaptionVisible}
            title={captionTemp}
            onSave={handleSaveCaption}
            onClose={() => setModalCaptionVisible(false)}
          />

          <ScrollView style={styles.infosEquipments}>
            <View style={{ height: 120 }}>
              <ScrollView horizontal={true} style={styles.imageRow}>
                {images.map((uri, index) => (
                  <Pressable
                    key={index}
                    onPress={() => {
                      setSelectedIndex(index);
                      setModalUpdateImage(true)
                    }}
                    style={styles.imageBox}
                  >
                    {uri && (
                      <>
                        <Pressable
                          key={index}
                          onPress={() => {
                            setSelectedIndex(index);
                            setModalUpdateImage(true);
                          }}
                          style={styles.imageBox}
                        >
                          <Image source={{ uri }} style={styles.image} />
                        </Pressable>
                        <Text>{imageCaptions[index] || "Imagem " + (index + 1)}</Text>
                      </>

                    )}
                  </Pressable>
                ))}

                <Pressable
                  onPress={() => handleImagePress(null)}
                  style={styles.addImageBox}
                >
                  <AntDesign name="pluscircleo" size={24} color="gray" />
                  <Text style={styles.imageText}>Adicionar Imagem</Text>
                </Pressable>
              </ScrollView>
            </View>

            <View style={styles.typeInspection}>
              <Text style={styles.title}>Tipo da inspeção</Text>
              <View style={styles.buttonContainer}>
                <Pressable
                  style={[
                    styles.button,
                    selectedTypesInspection.inicial && styles.selectedButton,
                  ]}
                  onPress={() => toggleSelection("inicial")}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      selectedTypesInspection.inicial &&
                      styles.selectedButtonText,
                    ]}
                  >
                    Inicial
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.button,
                    selectedTypesInspection.periodica && styles.selectedButton,
                  ]}
                  onPress={() => toggleSelection("periodica")}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      selectedTypesInspection.periodica &&
                      styles.selectedButtonText,
                    ]}
                  >
                    Periódica
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.button,
                    selectedTypesInspection.extraordinaria ||
                      selectedExtraordinaryCases.length > 0
                      ? styles.selectedButton
                      : {},
                  ]}
                  onPress={handleToggleExtraordinaryModal}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      selectedTypesInspection.extraordinaria ||
                        selectedExtraordinaryCases.length > 0
                        ? styles.selectedButtonText
                        : {},
                    ]}
                  >
                    Extraordinária
                  </Text>
                </Pressable>
              </View>

              <ExtraordinaryInspectionModal
                visible={modalExtraordinary}
                onClose={handleToggleExtraordinaryModal}
                selectedItems={selectedExtraordinaryCases}
                onSelectItem={handleSelectExtraordinaryCases}
              />
              {/* Menu adicional para a opção "Periódica" */}
              {selectedTypesInspection.periodica && (
                <View style={styles.buttonContainer}>
                  <Pressable
                    style={[
                      styles.button,
                      selectedPeriodicInspection.interna && styles.selectedButton,
                    ]}
                    onPress={() => toggleSelectionPeriodicType("interna")}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        selectedPeriodicInspection.interna &&
                        styles.selectedButtonText,
                      ]}
                    >
                      Interna
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.button,
                      selectedPeriodicInspection.externa && styles.selectedButton,
                    ]}
                    onPress={() => toggleSelectionPeriodicType("externa")}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        selectedPeriodicInspection.externa &&
                        styles.selectedButtonText,
                      ]}
                    >
                      Externa
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.button,
                      selectedPeriodicInspection.hidrostatico &&
                      styles.selectedButton,
                    ]}
                    onPress={() => toggleSelectionPeriodicType("hidrostatico")}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        selectedPeriodicInspection.hidrostatico &&
                        styles.selectedButtonText,
                      ]}
                    >
                      Hidrostático
                    </Text>
                  </Pressable>
                </View>
              )}

              {selectedExtraordinaryCases.length > 0 && (
                <View style={styles.extraordinaryItemsContainer}>
                  <Text style={styles.extraordinaryItemsTitle}>
                    Casos Extraordinários Selecionados
                  </Text>
                  {selectedExtraordinaryCases.map((item) => (
                    <View key={item.id} style={styles.extraordinaryItem}>
                      <Text style={{ fontSize: 15, fontWeight: "500" }}>
                        {item.title}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#737373" }}>
                        {item.description}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
            />

            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              {/* Data inicio */}
              <View>
                {Platform.OS === "web" ? (
                  <View style={{ width: "85%" }}>
                    <Text style={{ marginBottom: 5 }}>Data de início</Text>
                    <input
                      type="date"
                      onChange={(e) => setStartDate(e.target.value)}
                      style={{
                        padding: 10,
                        borderRadius: 5,
                        border: "1px solid #ccc",
                        width: "100%",
                      }}
                    />
                    <Text style={{ marginTop: 5 }}>
                      {startDate ? `Início: ${formatDate(startDate)}` : "Selecione a data de início"}
                    </Text>
                  </View>
                ) : (
                  <View>
                    <Pressable
                      onPress={showDatePicker}
                      style={styles.inputDatePicker}
                    >
                      <Text style={{ paddingHorizontal: 10, color: "white" }}>
                        Data de início
                      </Text>
                      <AntDesign name="calendar" size={24} color="white" />
                    </Pressable>
                    <Text>
                      {startDate
                        ? `Início: ${startDate}`
                        : "Selecione a data de início"}
                    </Text>
                  </View>
                )}

              </View>
              {/* Data fim */}
              {Platform.OS === "web" ? (
                <View style={{ paddingRight: 40, width: "55%" }}>
                  <Text style={{ marginBottom: 5 }}>Data de término</Text>
                  <input
                    type="date"
                    onChange={handleEndChangeWeb}
                    style={{
                      padding: 10,
                      borderRadius: 5,
                      border: "1px solid #ccc",
                      width: "100%",
                    }}
                  />
                  <Text style={{ marginTop: 5 }}>
                    {endDate ? `Término: ${endDate}` : "Selecione a data de término"}
                  </Text>
                </View>
              ) : (
                <View>
                  <Pressable
                    onPress={showEndDatePicker}
                    style={styles.inputDatePicker}
                  >
                    <Text style={{ paddingHorizontal: 10, color: "white" }}>
                      Data de término
                    </Text>
                    <AntDesign name="calendar" size={24} color="white" />
                  </Pressable>
                  <Text>
                    {endDate
                      ? `Término: ${endDate}`
                      : "Selecione a data de término"}
                  </Text>
                </View>)}

            </View>
            <DateTimePickerModal
              isVisible={isEndDatePickerVisible}
              mode="date"
              onConfirm={handleEndConfirm}
              onCancel={hideEndDatePicker}
            />

            <ChecklistDocumentationModal
              visible={modals.modalChecklitDocumentation}
              onClose={() => toogleModal("modalChecklitDocumentation")}
              checklistItemsInspection={checklistItemsInspection}
              checklistSelections={checklistSelections}
              toggleChecklistSelection={toggleChecklistSelection}
              openModalComment={openModalComment}
              comments={comments}
            />

            <CommentModal
              visble={modalComment}
              onClose={() => setModalComment(false)}
              comment={comment}
              setComment={setComment}
              saveComment={saveComment}
            />

            <Pressable onPress={() => toogleModal("modalChecklitDocumentation")}>
              <View style={styles.buttonFunctionsInModal}>
                <MaterialIcons name="checklist" size={24} color="white" />
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Checklist documentação existente
                </Text>
                <AntDesign name="plus" size={24} color="white" />
              </View>
            </Pressable>

            {typeEquipment == "Caldeira" || typeEquipment == "Vaso de Pressão" ?
              equipmentBodies.map((body, index) => (
                <View key={body.id} style={{ marginVertical: 20 }}>
                  <View style={styles.bodyOfEquipementTitleAddBody}>
                    <TextInput
                      style={styles.titleBodyOfEquipement}
                      placeholder="Nome do corpo do equipamento"
                      value={body.title}
                      onChangeText={(text) => handleTitleChange(text, index)}
                    />
                    {index === equipmentBodies.length - 1 && (
                      <Pressable onPress={addEquipmentBody}>
                        <AntDesign name="plus" size={24} color="white" style={{ marginTop: 12 }} />
                      </Pressable>
                    )}
                  </View>
                  <View style={styles.bodyOfEquipement}>
                    <Pressable
                      onPress={() => toogleModal("TampoInferiorModal")}
                      style={
                        Object.keys(tampoInferiorData).length === 0
                          ? styles.button
                          : styles.selectedButton
                      }
                    >
                      <Text
                        style={
                          Object.keys(tampoInferiorData).length === 0
                            ? styles.buttonText
                            : styles.selectedButtonText
                        }
                      >
                        Tampo Inferior
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => toogleModal("CostadoModal")}
                      style={
                        Object.keys(costadoData).length === 0
                          ? styles.button
                          : styles.selectedButton
                      }
                    >
                      <Text style={
                        Object.keys(costadoData).length === 0
                          ? styles.buttonText
                          : styles.selectedButtonText
                      }>
                        Costado
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => toogleModal("TampoSuperiorModal")}
                      style={
                        Object.keys(tampoSuperiorData).length === 0
                          ? styles.button
                          : styles.selectedButton
                      }
                    >
                      <Text style={
                        Object.keys(tampoSuperiorData).length === 0
                          ? styles.buttonText
                          : styles.selectedButtonText
                      }>
                        Tampo Superior
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))
              :
              <View>

              </View>
            }

            <TampoInferiorModal
              visible={modals.TampoInferiorModal}
              onClose={() => toogleModal("TampoInferiorModal")}
              onChange={(field, value) =>
                setTampoInferiorData({ ...tampoInferiorData, [field]: value })
              }
              content={tampoInferiorData}
              onSave={(newBottomTop) => {
                addBottomTop(newBottomTop);
              }}
              initialData={tampoInferiorData}
            />

            <CostadoModal
              visible={modals.CostadoModal}
              onClose={() => toogleModal("CostadoModal")}
              onChange={(field, value) =>
                setCostadoData({ ...costadoData, [field]: value })
              }
              content={costadoData}
              onSave={(newCostado) => {
                addCostado(newCostado);
              }}
              initialData={costadoData}
            />

            <TampoSuperiorModal
              visible={modals.TampoSuperiorModal}
              onClose={() => toogleModal("TampoSuperiorModal")}
              onChange={(field, value) =>
                setCostadoData({ ...tampoSuperiorData, [field]: value })
              }
              content={tampoSuperiorData}
              onSave={(newTampoSuperior) => {
                addTampoSuperior(newTampoSuperior);
              }}
              initialData={tampoSuperiorData}
            />

            {typeEquipment == "Caldeira" || typeEquipment == "Vaso de Pressão" ?
              <Pressable onPress={() => toogleModal("BocalModal")}>
                <View style={styles.buttonFunctionsInModal}>
                  <AntDesign name="dashboard" size={24} color="white" />
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>Bocais</Text>
                  <AntDesign name="plus" size={24} color="white" />
                </View>
              </Pressable>
              :
              <View>

              </View>
            }

            <BocalModal
              visible={modals.BocalModal}
              selectedIndex={selectedIndex} // Passa o índice para o modal
              onClose={() => {
                toogleModal("BocalModal");
                setBocalData({});
                setSelectedIndex(null); // Reseta para garantir que entrará no modo "adicionar"
              }}
              onChange={(field, value) =>
                setBocalData((prevData) => ({ ...prevData, [field]: value }))
              }
              content={selectedIndex !== null ? bocalData : {}} // Condicional para conteúdo
              onSave={(newBocal) => {
                if (selectedIndex !== null) {
                  // Atualiza o bocal existente
                  const updatedBocalList = [...bocalList];
                  updatedBocalList[selectedIndex] = newBocal;
                  setBocalList(updatedBocalList);
                } else {
                  // Adiciona um novo bocal
                  setBocalList((prevList) => [...prevList, newBocal]);
                }

                // Reseta estado e fecha modal
                setBocalData({});
                setSelectedIndex(null);
              }}
            />



            {bocalList.length > 0 && (
              <FlatList
                data={bocalList}
                keyExtractor={(item, index) => index.toString()}
                ListHeaderComponent={() => (
                  <View
                    style={{
                      padding: 10,
                      backgroundColor: "#1d4ed8",
                      borderRadius: 5,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 16,
                        color: "#fff",
                        textAlign: "center",
                      }}
                    >
                      Lista de Bocais
                    </Text>
                  </View>
                )}
                renderItem={({ item, index }) => (
                  <Pressable onPress={() => editBocal(index)}>
                    <View
                      style={{
                        padding: 10,
                        backgroundColor: "#f0f0f0",
                        marginVertical: 5,
                        flexDirection: "row",
                        alignItems: "center",
                        height: 100,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text>Bocal: {item.descrption}</Text>
                        <Text>Posição: {item.position}</Text>
                      </View>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Pressable
                          onPress={() => deleteBocal(index)}
                          style={{ marginLeft: 10 }}
                        >
                          <AntDesign name="delete" size={24} color="red" />
                        </Pressable>
                        <Pressable
                          onPress={() => editBocal(index)}
                          style={{ marginLeft: 10 }}
                        >
                          <AntDesign name="edit" size={24} color="black" />
                        </Pressable>
                      </View>
                    </View>
                  </Pressable>
                )}
              />
            )}

            <Pressable onPress={() => toogleModal("DevicesModal")}>
              <View style={styles.buttonFunctionsInModal}>
                <AntDesign name="clockcircleo" size={24} color="white" />
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Dispositivos
                </Text>
                <AntDesign name="plus" size={24} color="white" />
              </View>
            </Pressable>

            <DevicesModal
              visible={modals.DevicesModal}
              selectedIndex={selectedIndex}
              onClose={() => {
                toogleModal("DevicesModal");
                setDevicesData({});
                setSelectedIndex(null);
              }}
              onChange={(field, value) =>
                setDevicesData({ ...devicesData, [field]: value })
              }
              content={selectedIndex !== null ? devicesData : {}}
              onSave={(newDevice) => {
                if (selectedIndex !== null) {
                  const updateDeviceList = [...deviceList];
                  updateDeviceList[selectedIndex] = newDevice;
                  setDeviceList(updateDeviceList);
                } else {
                  setDeviceList((prevList) => [...prevList, newDevice]);
                }

                setDevicesData({});
                setSelectedIndex(null);
              }}
              editData={devicesData}
              isConnected={isConnected}
            />

            {deviceList.length > 0 && (
              <FlatList
                data={deviceList}
                keyExtractor={(item, index) => index.toString()}
                ListHeaderComponent={() => (
                  <View
                    style={{
                      padding: 10,
                      backgroundColor: "#1d4ed8",
                      borderRadius: 5,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 16,
                        color: "#fff",
                        textAlign: "center",
                      }}
                    >
                      Lista de Dispositivos
                    </Text>
                  </View>
                )}
                renderItem={({ item, index }) => (
                  <Pressable onPress={() => editDevice(index)}>
                    <View
                      style={{
                        padding: 10,
                        backgroundColor: "#f0f0f0",
                        marginVertical: 5,
                        flexDirection: "row",
                        alignItems: "center",
                        height: 100,
                      }}
                    >
                      <Image
                        source={{ uri: item["Imagens"]?.[0] }}
                        style={{ width: 50, height: 50, marginRight: 10 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text>Dispositivo: {item["Tipo de dispositivo"]}</Text>
                        <Text>Fabricante: {item["Fabricante"]}</Text>

                      </View>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Pressable
                          onPress={() => excluirDispositivo(index)}
                          style={{ marginLeft: 10 }}
                        >
                          <AntDesign name="delete" size={24} color="red" />
                        </Pressable>
                        <Pressable
                          onPress={() => editDevice(index)}
                          style={{ marginLeft: 10 }}
                        >
                          <AntDesign name="edit" size={24} color="black" />
                        </Pressable>
                      </View>
                    </View>
                  </Pressable>
                )}
              />
            )}

            {typeEquipment == "Caldeira" || typeEquipment == "Vaso de Pressão" ?
              <Pressable
                onPress={() => {
                  console.log("Navigating with:", { projectName, Idproject });
                  navigation.navigate("Teste Hidrostático", {
                    projectName,
                    Idproject
                  })
                }
                }
              >
                <View style={styles.buttonFunctionsInModal}>
                  <Ionicons name="speedometer" size={24} color="white" />
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    Teste Hidrostático
                  </Text>
                  <AntDesign name="plus" size={24} color="white" />
                </View>
              </Pressable>
              :
              <View>

              </View>
            }

            <Pressable
              onPress={() =>
                navigation.navigate("Mapa de medição de espessura", {
                  projectName,
                  Idproject,
                  updateDataMedition,
                  typeEquipment,
                  isConnected
                })
              }
            >
              <View style={styles.buttonFunctionsInModal}>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Mapa de medição de espessura
                </Text>
                <AntDesign name="plus" size={24} color="white" />
              </View>
            </Pressable>

            <Pressable onPress={() => navigation.navigate("Criar Prontuário", {
              projectName,
              Idproject,
              updateMedicalRecordData: medicalRecordData
            })}>
              <View style={styles.buttonFunctionsInModal}>
                <AntDesign name="profile" size={24} color="white" />
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {Object.keys(medicalRecordData).length > 0 ? "Editar Prontuário" : "Criar Prontuário"}
                </Text>
                <AntDesign name="plus" size={24} color="white" />
              </View>
            </Pressable>

            <Pressable onPress={openChecklistNormNR13Modal}>
              <View style={styles.buttonFunctionsInModal}>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {selectedNrDocumentationCases.length}
                </Text>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Recomendações da norma
                </Text>
                <AntDesign name="plus" size={24} color="white" />
              </View>
            </Pressable>

            <ChecklistItensNR13
              isOpen={isChecklistNormNR13ModalVisible}
              onClose={closeChecklistNormNR13Modal}
              selectedItems={selectedNrDocumentationCases}
              onSelectItem={handleSelectNRDocumentationCases}
            />

            <Pressable onPress={() => toogleModal("RecommendationsPLHModal")}>
              <View style={styles.buttonFunctionsInModal}>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {selectedRecommendationPLHCases.length}
                </Text>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Recomendações do PLH
                </Text>
                <AntDesign name="plus" size={24} color="white" />
              </View>
            </Pressable>

            <RecommendationsPLHModal
              isOpen={modals.RecommendationsPLHModal}
              onClose={() => toogleModal("RecommendationsPLHModal")}
              selectedItems={selectedRecommendationPLHCases}
              onSelectItem={handleSelectRecommendationsPLHCases}
            />

            <View>
              <Text style={styles.title}>Próximas inspeções periódicas</Text>

              <View
                style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}
              >
                {/* Date next inspection external from NR*/}
                <View>
                  <View>
                    <View style={styles.inputDatePicker}>
                      <Text style={{ paddingHorizontal: 10, color: "white" }}>
                        Externa NR
                      </Text>
                      <AntDesign name="calendar" size={24} color="white" />
                    </View>
                    <Text>{`Externa: ${calculatedEndDatesExternal}`}</Text>
                  </View>
                  {/* Date next inspection internal from NR*/}
                  <View>
                    <View style={styles.inputDatePicker}>
                      <Text style={{ paddingHorizontal: 10, color: "white" }}>
                        Interna NR
                      </Text>
                      <AntDesign name="calendar" size={24} color="white" />
                    </View>
                    <Text>{`Interna: ${formatDate(calculatedEndDatesInternal)}`}</Text>

                    {/* Date next inspection hidrostatic from NR*/}
                    <View style={styles.inputDatePicker}>
                      <Text style={{ paddingHorizontal: 10, color: "white" }}>
                        Hidrostático NR
                      </Text>
                      <AntDesign name="calendar" size={24} color="white" />
                    </View>
                    <Text>{endDate ? `Hidrostática: ${endDate}` : ""}</Text>
                  </View>
                </View>

                <View>
                  {Platform.OS === "web" ? (
                    <View style={{ width: "85%" }}>
                      <Text style={{ marginBottom: 5 }}>Externa PLH</Text>
                      <input
                        type="date"
                        onChange={(e) => setDateNextInspectionPLHExternal(e.target.value)}
                        style={{
                          padding: 10,
                          borderRadius: 5,
                          border: "1px solid #ccc",
                          width: "100%",
                        }}
                      />
                      <Text style={{ marginTop: 5 }}>
                        {dateNextInspectionPLHExternal ? `Externa PLH: ${dateNextInspectionPLHExternal}` : ""}
                      </Text>
                    </View>
                  ) : (
                    <View>
                      <Pressable
                        onPress={showDateNextInspectionPLHExternalPicker}
                        style={styles.inputDatePicker}
                      >
                        <Text style={{ paddingHorizontal: 10, color: "white" }}>
                          Externa PLH
                        </Text>
                        <AntDesign name="calendar" size={24} color="white" />
                      </Pressable>
                      <Text>
                        {dateNextInspectionPLHExternal || "Data da próxima inspeção"}
                      </Text>
                    </View>
                  )}

                  <DateTimePickerModal
                    isVisible={isDateNextInspectionPLHExternalVisible}
                    mode="date"
                    onConfirm={handleDateNextInspectionPLHExternalConfirm}
                    onCancel={hideDateNextInspectionPLHExternalPicker}
                  />


                  {/* Data fim */}
                  <View>
                    {Platform.OS === "web" ? (
                      <View style={{ width: "85%" }}>
                        <Text style={{ marginBottom: 5 }}>Interna PLH</Text>
                        <input
                          type="date"
                          onChange={(e) => setDateNextInspectionPLHInternal(e.target.value)}
                          style={{
                            padding: 10,
                            borderRadius: 5,
                            border: "1px solid #ccc",
                            width: "100%",
                          }}
                        />
                        <Text style={{ marginTop: 5 }}>
                          {dateNextInspectionPLHInternal ? `Interna PLH: ${formatDate(dateNextInspectionPLHInternal)}` : ""}
                        </Text>
                      </View>
                    ) : (
                      <View>
                        <Pressable
                          onPress={showDateNextInspectionPLHInternalPicker}
                          style={styles.inputDatePicker}
                        >
                          <Text style={{ paddingHorizontal: 10, color: "white" }}>
                            Interna PLH
                          </Text>
                          <AntDesign name="calendar" size={24} color="white" />
                        </Pressable>
                        <Text>
                          {dateNextInspectionPLHInternal || "Data da próxima inspeção"}
                        </Text>
                      </View>
                    )}

                    {/* <Pressable
                    onPress={showDateNextInspectionPLHInternalPicker}
                    style={styles.inputDatePicker}
                  >
                    <Text style={{ paddingHorizontal: 10, color: "white" }}>
                      Interna PLH
                    </Text>
                    <AntDesign name="calendar" size={24} color="white" />
                  </Pressable>
                  <Text>
                    {dateNextInspectionPLHInternal || "Data da próxima inspeção"}
                  </Text> */}

                    <DateTimePickerModal
                      isVisible={isDateNextInspectionPLHInternalVisible}
                      mode="date"
                      onConfirm={handleDateNextInspectionPLHInternalConfirm}
                      onCancel={hideDateNextInspectionPLHInternalPicker}
                    />

                    <Pressable
                      onPress={showDateNextInspectionPLHInternalPicker}
                      style={styles.inputDatePicker}
                    >
                      <Text style={{ paddingHorizontal: 10, color: "white" }}>
                        Hidrostático PLH
                      </Text>
                      <AntDesign name="calendar" size={24} color="white" />
                    </Pressable>
                    <Text>
                      {dateNextInspectionPLH || "Data da próxima inspeção"}
                    </Text>
                  </View>
                </View>
              </View>

              {typeEquipment == "Caldeira" ?
                <View>
                  <Button title="Aval. Integridade" onPress={showEndDatePicker} />
                  <DateTimePickerModal
                    isVisible={isEndDatePickerVisible}
                    mode="date"
                    onConfirm={handleEndConfirm}
                    onCancel={hideEndDatePicker}
                  />
                  <Text>
                    {endDate
                      ? `Data de término: ${endDate}`
                      : "Selecione uma data de término"}
                  </Text>
                </View>
                :
                <View></View>
              }
            </View>

            <View style={{
              flex: 1, flexDirection: "row", justifyContent: 'space-between', borderColor: 'gray',
              borderWidth: 1, borderRadius: 5, marginBottom: 10
            }}>
              <TextInput
                style={{
                  width: "85%",
                  padding: 10,
                }}
                value={attachment}
                onChangeText={(text) => setAttachment(text)}
                placeholder="Inserir Anexo"
              />
              <Pressable onPress={handleInsertAttachment}>
                <AntDesign name="plus" size={24} color="black" style={{ alignItems: 'center', margin: "auto", marginHorizontal: 8 }} />
              </Pressable>
            </View>

            <FlatList
              data={attachments}
              keyExtractor={(item, index) => index.toString()}
              ListHeaderComponent={(
                <View
                  style={{
                    padding: 10,
                    backgroundColor: "#1d4ed8",
                    borderRadius: 5,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 16,
                      color: "#fff",
                      textAlign: "center",
                    }}
                  >
                    Lista de Anexos
                  </Text>
                </View>
              )}
              renderItem={({ item }) => (
                <Text style={{
                  padding: 10,
                  backgroundColor: "#f0f0f0",
                  marginVertical: 5,
                  flexDirection: "row",
                  alignItems: "center",
                  borderBottomWidth: 1,
                  borderBottomColor: 'gray'
                }}>
                  {item}
                </Text>
              )}
            />


            <TextInput
              style={styles.textInput}
              placeholder="Pessoas que Acompanham (Nome, Setor e Cargo)"
              value={peopleWhoAccompanied}
              onChangeText={(text) => setPeopleWhoAccompanied(text)}
            />

            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={4}
              placeholder="Conclusão"
              value={conclusion}
              onChangeText={(text) => setConclusion(text)}
            />

            <View>
              <Text style={styles.title}>Situação para aprovação</Text>
              <View style={styles.buttonContainer}>
                <Pressable
                  style={[
                    styles.button,
                    selectedResultInspection.approved && styles.selectedButton,
                  ]}
                  onPress={() => toggleSelectionResultInspection("approved")}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      selectedResultInspection.approved &&
                      styles.selectedButtonText,
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
                  onPress={() => toggleSelectionResultInspection("failed")}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      selectedResultInspection.failed &&
                      styles.selectedButtonText,
                    ]}
                  >
                    Reprovado
                  </Text>
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={isEditMode ? updateInspectionData : (isConnected ? saveInspection : saveInspectionOffline)}
            >
              <View style={styles.buttonSaveInspection}>
                <AntDesign name="save" size={24} color="white" />
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {isEditMode ? "Atualizar Inspeção" : "Salvar Inspeção"}
                </Text>
                <AntDesign name="plus" size={24} color="white" />
              </View>
            </Pressable>


            <Modal
              animationType="fade"
              transparent={true}
              visible={showSuccessAlert}
              onRequestClose={() => {
                setShowSuccessAlert(false);
                navigation.navigate("Home");
              }}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: "#fff",
                    padding: 20,
                    borderRadius: 10,
                    alignItems: "center",
                    width: "80%",
                  }}
                >
                  <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
                    Sucesso
                  </Text>
                  <Text>Inspeção registrada com sucesso!</Text>
                  <Pressable
                    onPress={() => {
                      setShowSuccessAlert(false);
                      navigation.navigate("Home");
                    }}
                    style={{
                      marginTop: 15,
                      backgroundColor: "#1d4ed8",
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      borderRadius: 5,
                    }}
                  >
                    <Text style={{ color: "#fff" }}>OK</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>

            <Modal
              animationType="fade"
              transparent={true}
              visible={showErrorAlert}
              onRequestClose={() => {
                setShowErrorAlert(false);
              }}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: "#fff",
                    padding: 20,
                    borderRadius: 10,
                    alignItems: "center",
                    width: "80%",
                  }}
                >
                  <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
                    Erro
                  </Text>
                  <Text>Oocrreu algo de errado ao salvar a inspeção.</Text>
                  <Pressable
                    onPress={() => {
                      setShowErrorAlert(false);
                    }}
                    style={{
                      marginTop: 15,
                      backgroundColor: "#1d4ed8",
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      borderRadius: 5,
                    }}
                  >
                    <Text style={{ color: "#fff" }}>OK</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
          </ScrollView>
        </View>
      </ScrollView>
    </>
  );
};

export default Inspection;