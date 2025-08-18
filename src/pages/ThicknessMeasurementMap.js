import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  Alert,
  Platform,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Feather from "@expo/vector-icons/Feather";
import ThicknessRegistered from "../components/thicknessRegistered";
import AddImageInProjectModal from "../components/modal/AddImageInProjectModal";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../database/firebaseConfig";
import * as FileSystem from "expo-file-system";
import NetInfo from "@react-native-community/netinfo";

const ThicknessMeasurementMap = ({ navigation, route }) => {
  const { projectName, updateDataMedition, Idproject, typeEquipment
  } = route.params || {};
  const [isConnected, setIsConnected] = useState(false);


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
  console.log("Dados do tipo de inspeção: ", typeEquipment);
  console.log("Dados de Inspeção: ", updateDataMedition);

  const [isEdit, setIsEdit] = useState(false);
  const [imageBalaoSuperior, setImageBalaoSuperior] = useState(null);
  const [imageBalaoInferior, setImageBalaoInferior] = useState(null);
  const [imageFornalha, setImageFornalha] = useState(null);
  const [imageEconomizador, setImageEconomizador] = useState(null);
  const [imageDesaerador, setImageDesaerador] = useState(null);
  const [imageEspelhos, setImageEspelhos] = useState(null);
  const [imageTubulao, setImageTubulao] = useState(null);
  const [imageVaso, setImageVaso] = useState(null);

  const [modalTypeUploadPicture, setModalTypeUploadPicture] = useState(false);

  {
    /* Variaveis locais de medidas */
  }
  const [balaoSuperiorTampoEsquerdo, setBalaoSuperiorTampoEsquerdo] = useState(
    []
  );
  const [balaoSuperiorCostado, setBalaoSuperiorCostado] = useState([]);
  const [balaoSuperiorTampoDireito, setBalaoSuperiorTampoDireito] = useState(
    []
  );
  const [balaoInferiorTampoEsquerdo, setBalaoInferiorTampoEsquerdo] = useState(
    []
  );
  const [balaoInferiorCostado, setBalaoInferiorCostado] = useState([]);
  const [balaoInferiorTampoDireito, setBalaoInferiorTampoDireito] = useState(
    []
  );
  const [fornalhaFrontal, setFornalhaFrontal] = useState([]);
  const [fornalhaLadoEsquerdo, setFornalhaLadoEsquerdo] = useState([]);
  const [fornalhaLadoDireito, setFornalhaLadoDireito] = useState([]);
  const [fornalhaTraseira, setFornalhaTraseira] = useState([]);
  const [economizadorTubo, setEconomizadorTubo] = useState([]);
  const [desaeradorTampoEsquerdo, setDesaeradorTampoEsquerdo] = useState([]);
  const [desaeradorCostado, setDesaeradorCostado] = useState([]);
  const [desaeradorTampoDireito, setDesaeradorTampoDireito] = useState([]);
  const [espelhosEspelhoFrontal, setEspelhosEspelhoFrontal] = useState([]);
  const [espelhosEspelhoTraseiro, setEspelhosEspelhoTraseiro] = useState([]);
  const [tubulaoParede, setTubulaoParede] = useState([]);
  const [tubulaoRegiaoSolda, setTubulaoRegiaoSolda] = useState([]);
  const [tubulaoExtremidades, setTubulaoExtremidades] = useState([]);

  const [vasoTampoEsquerdo, setVasoTampoEsquerdo] = useState([]);
  const [vasoCostado, setVasoCostado] = useState([]);
  const [vasoTampoDireito, setVasoTampoDireito] = useState([]);

  {
    /* Variaveis observações */
  }

  const [observationBalaoSuperior, setObservationBalaoSuperior] = useState('');
  const [observationBalaoInferior, setObservationBalaoInferior] = useState('');
  const [observationFornalha, setObservationFornalha] = useState('');
  const [observationEconomizador, setObservationEconomizador] = useState('');
  const [observationDesaerador, setObservationDesaerador] = useState('');
  const [observationEspelhos, setObservationEspelhos] = useState('');
  const [observationTubulao, setObservationTubulao] = useState('');
  const [observationVaso, setObservationVaso] = useState('');

  const imageRef = useRef();
  const [status, requestPermission] = MediaLibrary.usePermissions();

  // Log do estado
  console.log(`Está no modo: ${isConnected ? "ON" : "OFF"}`);

  useEffect(() => {
    if (updateDataMedition !== undefined) {
      setImageBalaoSuperior(updateDataMedition.balaoSuperior?.imageBalaoSuperior || '')
      setBalaoSuperiorTampoEsquerdo(updateDataMedition.balaoSuperior?.balaoSuperiorTampoEsquerdo || []);
      setBalaoSuperiorTampoDireito(updateDataMedition.balaoSuperior?.balaoSuperiorTampoDireito || []);
      setBalaoSuperiorTampoEsquerdo(updateDataMedition.balaoSuperior?.balaoSuperiorTampoEsquerdo || []);
      setObservationBalaoSuperior(updateDataMedition.balaoSuperior?.observationBalaoSuperior || '');

      //Balão Inferior
      setImageBalaoInferior(updateDataMedition.balaoInferior?.imageBalaoInferior || null)
      setBalaoInferiorCostado(updateDataMedition.balaoInferior?.balaoInferiorCostado || []);
      setBalaoInferiorTampoDireito(updateDataMedition.balaoInferior?.balaoInferiorTampoDireito || []);
      setBalaoInferiorTampoEsquerdo(updateDataMedition.balaoInferior?.balaoInferiorTampoEsquerdo || []);

      //Fornalha
      setImageFornalha(updateDataMedition.fornalha?.imageFornalha || null)
      setFornalhaFrontal(updateDataMedition.fornalha?.fornalhaFrontal || []);
      setFornalhaLadoDireito(updateDataMedition.fornalha?.fornalhaLadoDireito || []);
      setFornalhaLadoEsquerdo(updateDataMedition.fornalha?.fornalhaLadoEsquerdo || []);
      setFornalhaTraseira(updateDataMedition.fornalha?.fornalhaTraseira || []);

      //Economizador
      setImageEconomizador(updateDataMedition.economizador?.imageEconomizador || null);
      setEconomizadorTubo(updateDataMedition.economizador?.economizadorTubo || []);

      //Desaerador
      setImageDesaerador(updateDataMedition.desaerador?.imageDesaerador || null);
      setDesaeradorCostado(updateDataMedition.desaerador?.desaeradorCostado || []);
      setDesaeradorTampoDireito(data.inspection.mapOfMedition?.desaeradorTampoDireito || []);
      setDesaeradorTampoEsquerdo(data.inspection.mapOfMedition?.desaeradorTampoEsquerdo || []);

      //Espelhos
      setImageEspelhos(updateDataMedition.espelhos?.imageEspelhos || null);
      setEspelhosEspelhoFrontal(updateDataMedition.espelhos?.espelhosEspelhoFrontal || []);
      setEspelhosEspelhoTraseiro(updateDataMedition.espelhos?.espelhosEspelhoTraseiro || []);

      //Tubulão
      setImageTubulao(updateDataMedition.tubulao?.imageTubulao || null);
      setTubulaoExtremidades(updateDataMedition.tubulao?.tubulaoExtremidades || []);
      setTubulaoParede(updateDataMedition.tubulao?.tubulaoParede || []);
      setTubulaoRegiaoSolda(updateDataMedition.tubulao?.tubulaoRegiaoSolda || []);

      //Vaso reservatório
      setImageVaso(updateDataMedition.vaso?.imageVaso || null);
      setVasoTampoEsquerdo(updateDataMedition.vaso?.vasoTampoEsquerdo || []);
      setVasoCostado(updateDataMedition.vaso?.vasoCostado || []);
      setVasoTampoDireito(updateDataMedition.vaso?.vasoTampoDireito || []);
    }
  }, [updateDataMedition])

  useEffect(() => {
    if (Idproject) {
      setIsEdit(true);

      const loadThicknessData = async () => {
        try {
          const inspectionRef = doc(db, "inspections", Idproject);
          const docSnapshot = await getDoc(inspectionRef);

          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            console.log(data.inspection.mapOfMedition.tubulao?.tubulaoExtremidades)

            //Balão Superior
            setImageBalaoSuperior(data.inspection.mapOfMedition.balaoSuperior?.imageBalaoSuperior || '')
            setBalaoSuperiorCostado(data.inspection.mapOfMedition.balaoSuperior?.balaoSuperiorCostado || []);
            setBalaoSuperiorTampoDireito(data.inspection.mapOfMedition.balaoSuperior?.balaoSuperiorTampoDireito || []);
            setBalaoSuperiorTampoEsquerdo(data.inspection.mapOfMedition.balaoSuperior?.balaoSuperiorTampoEsquerdo || []);
            setObservationBalaoSuperior(data.inspection.mapOfMedition.balaoSuperior?.observationBalaoSuperior || '');

            //Balão Inferior
            setImageBalaoInferior(data.inspection.mapOfMedition.balaoInferior?.imageBalaoInferior || null)
            setBalaoInferiorCostado(data.inspection.mapOfMedition.balaoInferior?.balaoInferiorCostado || []);
            setBalaoInferiorTampoDireito(data.inspection.mapOfMedition.balaoInferior?.balaoInferiorTampoDireito || []);
            setBalaoInferiorTampoEsquerdo(data.inspection.mapOfMedition.balaoInferior?.balaoInferiorTampoEsquerdo || []);
            setObservationBalaoInferior(data.inspection.mapOfMedition.balaoInferior?.observationBalaoInferior || '');

            //Fornalha
            setImageFornalha(data.inspection.mapOfMedition.fornalha?.imageFornalha || null)
            setFornalhaFrontal(data.inspection.mapOfMedition.fornalha?.fornalhaFrontal || []);
            setFornalhaLadoDireito(data.inspection.mapOfMedition.fornalha?.fornalhaLadoDireito || []);
            setFornalhaLadoEsquerdo(data.inspection.mapOfMedition.fornalha?.fornalhaLadoEsquerdo || []);
            setFornalhaTraseira(data.inspection.mapOfMedition.fornalha?.fornalhaTraseira || []);
            setObservationFornalha(data.inspection.mapOfMedition.fornalha?.observationFornalha || '');

            //Economizador
            setImageEconomizador(data.inspection.mapOfMedition.economizador?.imageEconomizador || null);
            setEconomizadorTubo(data.inspection.mapOfMedition.economizador?.economizadorTubo || []);
            setObservationEconomizador(data.inspection.mapOfMedition.economizador?.observationEconomizador || '');

            //Desaerador
            setImageDesaerador(data.inspection.mapOfMedition.desaerador?.imageDesaerador || null);
            setDesaeradorCostado(data.inspection.mapOfMedition.desaerador?.desaeradorCostado || []);
            setDesaeradorTampoDireito(data.inspection.mapOfMedition.desaerador?.desaeradorTampoDireito || []);
            setDesaeradorTampoEsquerdo(data.inspection.mapOfMedition.desaerador?.desaeradorTampoEsquerdo || []);
            setObservationDesaerador(data.inspection.mapOfMedition.desaerador?.observationDesaerador || '');

            //Espelhos
            setImageEspelhos(data.inspection.mapOfMedition.espelhos?.imageEspelhos || null);
            setEspelhosEspelhoFrontal(data.inspection.mapOfMedition.espelhos?.espelhosEspelhoFrontal || []);
            setEspelhosEspelhoTraseiro(data.inspection.mapOfMedition.espelhos?.espelhosEspelhoTraseiro || []);
            setObservationEspelhos(data.inspection.mapOfMedition.espelhos?.observationEspelhos || '');

            //Tubulão
            setImageTubulao(data.inspection.mapOfMedition.tubulao?.imageTubulao || null);
            setTubulaoExtremidades(data.inspection.mapOfMedition.tubulao?.tubulaoExtremidades || []);
            setTubulaoParede(data.inspection.mapOfMedition.tubulao?.tubulaoParede || []);
            setTubulaoRegiaoSolda(data.inspection.mapOfMedition.tubulao?.tubulaoRegiaoSolda || []);
            setObservationTubulao(data.inspection.mapOfMedition.tubulao?.observationTubulao || '');

            //Vaso
            setImageVaso(data.inspection.mapOfMedition.vaso?.imageVaso || null);
            setVasoTampoEsquerdo(data.inspection.mapOfMedition.vaso?.vasoTampoEsquerdo || []);
            setVasoCostado(data.inspection.mapOfMedition.vaso?.vasoCostado || []);
            setVasoTampoDireito(data.inspection.mapOfMedition.vaso?.vasoTampoDireito || []);
            setObservationVaso(data.inspection.mapOfMedition.vaso?.observationVaso || '')
          }
        } catch (error) {
          console.log("O erro foi: ", error)
        }
      }
      loadThicknessData();
    }
  }, [Idproject]);

  const updateMapOfMeditionData = async () => {
    if (!Idproject) {
      Alert.alert("Erro", "Não foi possíivel atualizar dados do mapa de medição, tente novamente.");
      return;
    }
    const updateData = {
      balaoSuperior: {
        imageBalaoSuperior: imageBalaoSuperior || "",
        balaoSuperiorCostado,
        balaoSuperiorTampoDireito,
        balaoSuperiorTampoEsquerdo,
        observationBalaoSuperior,
      },
      balaoInferior: {
        imageBalaoInferior: imageBalaoInferior || "",
        balaoInferiorCostado,
        balaoInferiorTampoDireito,
        balaoInferiorTampoEsquerdo,
        observationBalaoInferior,
      },
      fornalha: {
        imageFornalha: imageFornalha || "",
        fornalhaFrontal,
        fornalhaLadoDireito,
        fornalhaLadoEsquerdo,
        fornalhaTraseira,
        observationFornalha,
      },
      economizador: {
        imageEconomizador: imageEconomizador || "",
        economizadorTubo,
        observationEconomizador,
      },
      desaerador: {
        imageDesaerador: imageDesaerador || "",
        desaeradorCostado,
        desaeradorTampoDireito,
        desaeradorTampoEsquerdo,
        observationDesaerador,
      },
      espelhos: {
        imageEspelhos: imageEspelhos || "",
        espelhosEspelhoFrontal,
        espelhosEspelhoTraseiro,
        observationEspelhos,
      },
      tubulao: {
        imageTubulao: imageTubulao || "",
        tubulaoParede,
        tubulaoExtremidades,
        tubulaoRegiaoSolda,
        observationTubulao,
      },
      vaso: {
        imageVaso: imageVaso || "",
        vasoTampoEsquerdo,
        vasoCostado,
        vasoTampoDireito,
        observationVaso,
      }
    }
    navigation.navigate('Inspeção', { Idproject, updateDataMedition: updateData })
    console.log("Dados atualizados: ", updateData)
    return updateData;
  }

  if (status === null) {
    requestPermission();
  }

  const collectData = () => {
    const dataForSave = {
      balaoSuperior: {
        imageBalaoSuperior: imageBalaoSuperior || "",
        balaoSuperiorCostado,
        balaoSuperiorTampoDireito,
        balaoSuperiorTampoEsquerdo,
        observationBalaoSuperior,
      },
      balaoInferior: {
        imageBalaoInferior: imageBalaoInferior || "",
        balaoInferiorCostado,
        balaoInferiorTampoDireito,
        balaoInferiorTampoEsquerdo,
        observationBalaoInferior,
      },
      fornalha: {
        imageFornalha: imageFornalha || "",
        fornalhaFrontal,
        fornalhaLadoDireito,
        fornalhaLadoEsquerdo,
        fornalhaTraseira,
        observationFornalha,
      },
      economizador: {
        imageEconomizador: imageEconomizador || "",
        economizadorTubo,
        observationEconomizador,
      },
      desaerador: {
        imageDesaerador: imageDesaerador || "",
        desaeradorCostado,
        desaeradorTampoDireito,
        desaeradorTampoEsquerdo,
        observationDesaerador,
      },
      espelhos: {
        imageEspelhos: imageEconomizador || "",
        espelhosEspelhoFrontal,
        espelhosEspelhoTraseiro,
        observationEspelhos,
      },
      tubulao: {
        imageTubulao: imageTubulao || "",
        tubulaoParede,
        tubulaoExtremidades,
        tubulaoRegiaoSolda,
        observationTubulao,
      },
      vaso: {
        imageVaso: imageVaso || "",
        vasoTampoEsquerdo,
        vasoCostado,
        vasoTampoDireito,
        observationVaso,
      }
    };
    navigation.navigate('Inspeção', { projectName, updateDataMedition: dataForSave })
    console.log("Dados coletados e enviados: ", dataForSave)
    return dataForSave;
  };

  const uploadImageToFirebase = async (imageUri) => {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const storage = getStorage();
    const storageRef = ref(storage, `clients/${Date.now()}.jpg`);

    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  };

  const handleImagePicked = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      console.log("Imagem selecionada:", imageUri);

      if (!isConnected) {
        console.log("Iniciando função de salvar imagem offline");
        try {
          // Criar um nome de arquivo único para a imagem offline
          const localUri = `${FileSystem.documentDirectory}offline-image-${Date.now()}.jpg`;

          // Copiar a imagem para o diretório local
          await FileSystem.copyAsync({ from: imageUri, to: localUri });

          console.log("Imagem salva localmente:", localUri);
          setImages([localUri]);
        } catch (error) {
          console.error("Erro ao salvar imagem localmente:", error);
          alert("Erro ao salvar a imagem localmente. Tente novamente.");
        }
      } else {
        try {
          // Se estiver online, fazer upload para o Firebase
          const uploadedImageUrl = await uploadImageToFirebase(imageUri);
          console.log("Imagem enviada para o Firebase:", uploadedImageUrl);
          setImages([uploadedImageUrl]);
        } catch (error) {
          console.error("Erro ao fazer upload da imagem:", error);
          alert("Erro ao enviar a imagem. Tente novamente.");
        }
      }

      setModalTypeUploadPicture(false);
    }
  };

  const handleCameraOpen = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
    setModalTypeUploadPicture(false);
  };

  const uploadImagesToStorage = async (imageUris) => {
    console.log("🚀 Iniciando upload de imagens...");

    const imageUrls = await Promise.all(
      imageUris.map(async (uri, index) => {
        console.log(`📸 Processando imagem ${index}:`, uri);

        try {
          const imageRef = ref(storage, `inspections/image_${Date.now()}_${index}.jpg`);
          console.log(`📌 Criada referência no Firebase Storage: ${imageRef.fullPath}`);

          // Buscar o arquivo como blob
          const response = await fetch(uri);
          console.log(`📥 Resposta do fetch para ${index}:`, response);

          if (!response.ok) {
            throw new Error(`❌ Erro ao buscar a imagem ${index}: Status ${response.status}`);
          }

          const blob = await response.blob();
          console.log(`📦 Blob criado para ${index}:`, blob);

          // Determinar o tipo MIME
          const contentType = blob.type || "image/jpeg";
          console.log(`📋 Tipo MIME para ${index}:`, contentType);

          // Upload com metadata
          const metadata = { contentType };
          await uploadBytes(imageRef, blob, metadata);
          console.log(`✅ Upload finalizado para ${index}!`);

          // Obter a URL de download
          const downloadURL = await getDownloadURL(imageRef);
          console.log(`🌐 URL da imagem ${index}:`, downloadURL);

          return downloadURL;
        } catch (error) {
          console.error(`❌ Erro no upload da imagem ${index}:`, error);
          throw error;
        }
      })
    );

    return imageUrls;
  };

  const handleImagePress = async (section) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Acesse as configurações para permitir o uso da galeria.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      let imageUri = result.assets[0].uri;
      console.log("Imagem selecionada:", imageUri);

      if(Platform.OS === "web"){
        uploadImagesToStorage(result)
      } else{
        
      }
      try {
        if (!isConnected) {
          console.log("Salvando imagem offline...");

          // Garante que a URI começa com "file://"
          if (!imageUri.startsWith("file://")) {
            imageUri = `file://${imageUri}`;
          }

          // Verifica se o arquivo realmente existe antes de copiar
          const fileInfo = await FileSystem.getInfoAsync(imageUri);
          if (!fileInfo.exists) {
            throw new Error("Arquivo de imagem não encontrado!");
          }

          const localUri = `${FileSystem.documentDirectory}offline-image-${Date.now()}.jpg`;

          // Usa moveAsync para evitar problemas de acesso
          await FileSystem.moveAsync({ from: imageUri, to: localUri });

          console.log("Imagem salva localmente:", localUri);
          updateImageState(section, localUri);
        } else {
          console.log("Enviando imagem para o Firebase...");
          const uploadedImageUrl = await uploadImageToFirebase(imageUri);
          console.log("Imagem enviada para o Firebase:", uploadedImageUrl);
          updateImageState(section, uploadedImageUrl);
        }
      } catch (error) {
        console.error("Erro ao processar imagem:", error);
        Alert.alert("Erro", "Não foi possível processar a imagem. Tente novamente.");
      }
    }

    setModalTypeUploadPicture(false);
  };


  // Função para atualizar o estado correto com a imagem selecionada
  const updateImageState = (section, imageUrl) => {
    switch (section) {
      case "balaoSuperior":
        setImageBalaoSuperior(imageUrl);
        break;
      case "balaoInferior":
        setImageBalaoInferior(imageUrl);
        break;
      case "fornalha":
        setImageFornalha(imageUrl);
        break;
      case "economizador":
        setImageEconomizador(imageUrl);
        break;
      case "desaerador":
        setImageDesaerador(imageUrl);
        break;
      case "espelhos":
        setImageEspelhos(imageUrl);
        break;
      case "tubulao":
        setImageTubulao(imageUrl);
        break;
      case "vaso":
        setImageVaso(imageUrl);
        break;
    }
  };

  const adicionarMedida = (lado) => {
    const mapeamento = {
      "Tampo Esquerdo Balão Superior": [
        balaoSuperiorTampoEsquerdo,
        setBalaoSuperiorTampoEsquerdo,
      ],
      "Tampo Direito Balão Superior": [
        balaoSuperiorTampoDireito,
        setBalaoSuperiorTampoDireito,
      ],
      "Costado Balão Superior": [balaoSuperiorCostado, setBalaoSuperiorCostado],
      "Tampo Esquerdo Balão Inferior": [
        balaoInferiorTampoEsquerdo,
        setBalaoInferiorTampoEsquerdo,
      ],
      "Costado Balão Inferior": [balaoInferiorCostado, setBalaoInferiorCostado],
      "Tampo Direito Balão Inferior": [
        balaoInferiorTampoDireito,
        setBalaoInferiorTampoDireito,
      ],
      "Frontal Fornalha": [fornalhaFrontal, setFornalhaFrontal],
      "Lado esquerdo Fornalha": [fornalhaLadoEsquerdo, setFornalhaLadoEsquerdo],
      "Lado Direito Fornalha": [fornalhaLadoDireito, setFornalhaLadoDireito],
      "Traseira Fornalha": [fornalhaTraseira, setFornalhaTraseira],
      "Tubo Economizador": [economizadorTubo, setEconomizadorTubo],
      "Tampo Esquerdo Desaerador": [
        desaeradorTampoEsquerdo,
        setDesaeradorTampoEsquerdo,
      ],
      "Costado Desaerador": [desaeradorCostado, setDesaeradorCostado],
      "Tampo Direito Desaerador": [
        desaeradorTampoDireito,
        setDesaeradorTampoDireito,
      ],
      "Espelho frontal Espelho": [
        espelhosEspelhoFrontal,
        setEspelhosEspelhoFrontal,
      ],
      "Espelho traseiro Espelho": [
        espelhosEspelhoTraseiro,
        setEspelhosEspelhoTraseiro,
      ],
      "Parede Tubulão": [tubulaoParede, setTubulaoParede],
      "Região de solda Tubulão": [tubulaoRegiaoSolda, setTubulaoRegiaoSolda],
      "Extremidades Tubulão": [tubulaoExtremidades, setTubulaoExtremidades],
      "Tampo Esquerdo Vaso reservatório": [
        vasoTampoEsquerdo,
        setVasoTampoEsquerdo,
      ],
      "Costado Vaso reservatório": [
        vasoCostado,
        setVasoCostado,
      ],
      "Tampo Direito Vaso reservatório": [
        vasoTampoDireito,
        setVasoTampoDireito,
      ],
    };

    const [medidas, setMedidas] = mapeamento[lado] || [[], () => { }];
    if (Array.isArray(medidas) && setMedidas) {
      const novaMedida = { id: medidas.length + 1, valor: "" };
      setMedidas([...medidas, novaMedida]);
    } else {
      console.error(`Medidas para o lado '${lado}' não estão definidas corretamente.`);
    }
  };

  const atualizarValorMedida = (lado, id, valor) => {
    const mapeamento = {
      "Tampo Esquerdo Balão Superior": [balaoSuperiorTampoEsquerdo, setBalaoSuperiorTampoEsquerdo],
      "Tampo Direito Balão Superior": [balaoSuperiorTampoDireito, setBalaoSuperiorTampoDireito],
      "Costado Balão Superior": [balaoSuperiorCostado, setBalaoSuperiorCostado],
      "Tampo Esquerdo Balão Inferior": [balaoInferiorTampoEsquerdo, setBalaoInferiorTampoEsquerdo],
      "Costado Balão Inferior": [balaoInferiorCostado, setBalaoInferiorCostado],
      "Tampo Direito Balão Inferior": [balaoInferiorTampoDireito, setBalaoInferiorTampoDireito],
      "Frontal Fornalha": [fornalhaFrontal, setFornalhaFrontal],
      "Lado esquerdo Fornalha": [fornalhaLadoEsquerdo, setFornalhaLadoEsquerdo],
      "Lado Direito Fornalha": [fornalhaLadoDireito, setFornalhaLadoDireito],
      "Traseira Fornalha": [fornalhaTraseira, setFornalhaTraseira],
      "Tubo Economizador": [economizadorTubo, setEconomizadorTubo],
      "Tampo Esquerdo Desaerador": [
        desaeradorTampoEsquerdo,
        setDesaeradorTampoEsquerdo,
      ],
      "Costado Desaerador": [desaeradorCostado, setDesaeradorCostado],
      "Tampo Direito Desaerador": [
        desaeradorTampoDireito,
        setDesaeradorTampoDireito,
      ],
      "Espelho frontal Espelho": [
        espelhosEspelhoFrontal,
        setEspelhosEspelhoFrontal,
      ],
      "Espelho traseiro Espelho": [
        espelhosEspelhoTraseiro,
        setEspelhosEspelhoTraseiro,
      ],
      "Parede Tubulão": [tubulaoParede, setTubulaoParede],
      "Região de solda Tubulão": [tubulaoRegiaoSolda, setTubulaoRegiaoSolda],
      "Extremidades Tubulão": [tubulaoExtremidades, setTubulaoExtremidades],
      "Vaso reservatório": [vasoTampoEsquerdo, setVasoTampoEsquerdo],
      "Tampo Esquerdo Vaso reservatório": [
        vasoTampoEsquerdo,
        setVasoTampoEsquerdo,
      ],
      "Costado Vaso reservatório": [
        vasoCostado,
        setVasoCostado,
      ],
      "Tampo Direito Vaso reservatório": [
        vasoTampoDireito,
        setVasoTampoDireito,
      ],
    };

    const [medidas, setMedidas] = mapeamento[lado] || [];

    const novasMedidas = medidas.map((medida) =>
      medida.id === id ? { ...medida, valor } : medida
    );

    console.log(`Novas medidas para ${lado}:`, novasMedidas);

    setMedidas(novasMedidas);
  };


  const renderFields = () => {
    switch (typeEquipment) {
      case "Caldeira":
        return (
          <View style={styles.container}>
            <View>
              <ScrollView
                style={
                  Platform.OS === "web"
                    ? {
                      flex: 1,
                      width: "100%",
                      overflow: "auto",
                      maxHeight: "90vh",
                    }
                    : {

                    }
                }
                showsVerticalScrollIndicator={Platform.OS === "web"}
              >

                <AddImageInProjectModal
                  visible={modalTypeUploadPicture}
                  onClose={() => setModalTypeUploadPicture(false)}
                  onImagePicked={handleImagePicked}
                  onCameraOpen={handleCameraOpen}
                />
                <View style={styles.imageMap}>
                  {imageBalaoSuperior ? (
                    <Pressable
                      onPress={() => handleImagePress("balaoSuperior")}
                      style={styles.imageBox}
                    >
                      <Image
                        source={{ uri: imageBalaoSuperior }}
                        alt="imagem balao superior"
                        style={[styles.image, { width: 300, height: 200 }]}
                        resizeMode="cover"
                      />
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => handleImagePress("balaoSuperior")}
                      style={styles.addImageBox}
                    >
                      <Feather name="plus-circle" size={24} color="gray" />
                      <Text style={styles.imageText}>Adicionar Imagem</Text>
                    </Pressable>
                  )}
                </View>

                <View style={{ marginBottom: 20 }}>
                  <View style={{ backgroundColor: "#bae6fd" }}>
                    <View
                      style={styles.headerSection}
                    >
                      <Text>Balão Superior</Text>
                    </View>

                    <View style={{ backgroundColor: "#bae6fd" }}>
                      <View style={styles.containerRegisterMedidas}>
                        <View style={styles.containerlineInformationMedidas}>
                          <Text style={styles.lineInfosMedidas}>Tampo Esquerdo</Text>
                          <View style={{ width: 230 }}>
                            <ThicknessRegistered
                              medidas={balaoSuperiorTampoEsquerdo}
                              atualizarValorMedida={atualizarValorMedida}
                              lado="Tampo Esquerdo Balão Superior"
                            />
                          </View>
                          <Pressable
                            onPress={() =>
                              adicionarMedida("Tampo Esquerdo Balão Superior")
                            }
                          >
                            <AntDesign name="plus" size={24} color="black" />
                          </Pressable>
                        </View>
                      </View>

                      <View style={styles.containerRegisterMedidas}>
                        <View style={styles.containerlineInformationMedidas}>
                          <Text style={styles.lineInfosMedidas}>Costado</Text>
                          <View style={{ width: 230 }}>
                            <ThicknessRegistered
                              medidas={balaoSuperiorCostado}
                              atualizarValorMedida={atualizarValorMedida}
                              lado="Costado Balão Superior"
                            />
                          </View>
                          <Pressable
                            onPress={() => adicionarMedida("Costado Balão Superior")}
                          >
                            <AntDesign name="plus" size={24} color="black" />
                          </Pressable>
                        </View>
                      </View>

                      <View style={styles.containerRegisterMedidas}>
                        <View style={styles.containerlineInformationMedidas}>
                          <Text style={styles.lineInfosMedidas}>Tampo Direito</Text>
                          <View style={{ width: 230 }}>
                            <ThicknessRegistered
                              medidas={balaoSuperiorTampoDireito}
                              atualizarValorMedida={atualizarValorMedida}
                              lado="Tampo Direito Balão Superior"
                            />
                          </View>
                          <Pressable
                            onPress={() =>
                              adicionarMedida("Tampo Direito Balão Superior")
                            }
                          >
                            <AntDesign name="plus" size={24} color="black" />
                          </Pressable>
                        </View>
                      </View>
                    </View>

                    <View style={styles.contentBottomContainerPart}></View>
                  </View>
                  <TextInput onChangeText={setObservationBalaoSuperior} value={observationBalaoSuperior} style={styles.textAreas} placeholder="Observações" />
                </View>

                {/* Balão Inferior */}
                <View style={styles.imageMap}>
                  {imageBalaoInferior ? (
                    <Pressable
                      onPress={() => handleImagePress("balaoInferior")}
                      style={styles.imageBox}
                    >
                      <Image
                        source={{ uri: imageBalaoInferior }}
                        style={[styles.image, { width: 300, height: 200 }]}
                        resizeMode="cover"
                      />
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => handleImagePress("balaoInferior")}
                      style={styles.addImageBox}
                    >
                      <Feather name="plus-circle" size={24} color="gray" />
                      <Text style={styles.imageText}>Adicionar Imagem</Text>
                    </Pressable>
                  )}
                </View>

                <View style={{ marginBottom: 20 }}>
                  <View style={{ backgroundColor: "#bae6fd" }}>
                    <View
                      style={styles.headerSection}
                    >
                      <Text>Balão Inferior</Text>
                    </View>

                    <View style={{ backgroundColor: "#bae6fd" }}>
                      <View style={styles.containerRegisterMedidas}>
                        <View style={styles.containerlineInformationMedidas}>
                          <Text style={styles.lineInfosMedidas}>Tampo Esquerdo</Text>
                          <View style={{ width: 230 }}>
                            <ThicknessRegistered
                              medidas={balaoInferiorTampoEsquerdo}
                              atualizarValorMedida={atualizarValorMedida}
                              lado="Tampo Esquerdo Balão Inferior"
                            />
                          </View>
                          <Pressable
                            onPress={() =>
                              adicionarMedida("Tampo Esquerdo Balão Inferior")
                            }
                          >
                            <AntDesign name="plus" size={24} color="black" />
                          </Pressable>
                        </View>
                      </View>

                      <View style={styles.containerRegisterMedidas}>
                        <View style={styles.containerlineInformationMedidas}>
                          <Text style={styles.lineInfosMedidas}>Costado</Text>
                          <View style={{ width: 230 }}>
                            <ThicknessRegistered
                              medidas={balaoInferiorCostado}
                              atualizarValorMedida={atualizarValorMedida}
                              lado="Costado Balão Inferior"
                            />
                          </View>
                          <Pressable
                            onPress={() => adicionarMedida("Costado Balão Inferior")}
                          >
                            <AntDesign name="plus" size={24} color="black" />
                          </Pressable>
                        </View>
                      </View>

                      <View style={styles.containerRegisterMedidas}>
                        <View style={styles.containerlineInformationMedidas}>
                          <Text style={styles.lineInfosMedidas}>Tampo Direito</Text>
                          <View style={{ width: 230 }}>
                            <ThicknessRegistered
                              medidas={balaoInferiorTampoDireito}
                              atualizarValorMedida={atualizarValorMedida}
                              lado="Tampo Direito Balão Inferior"
                            />
                          </View>
                          <Pressable
                            onPress={() =>
                              adicionarMedida("Tampo Direito Balão Inferior")
                            }
                          >
                            <AntDesign name="plus" size={24} color="black" />
                          </Pressable>
                        </View>
                      </View>
                    </View>

                    <View style={styles.contentBottomContainerPart}></View>
                  </View>
                  <TextInput onChangeText={setObservationBalaoInferior} value={observationBalaoInferior} style={styles.textAreas} placeholder="Observações" />
                </View>

                {/* Fornalha */}
                <View style={styles.imageMap}>
                  {imageFornalha ? (
                    <Pressable
                      onPress={() => handleImagePress("fornalha")}
                      style={styles.imageBox}
                    >
                      <Image
                        source={{ uri: imageFornalha }}
                        style={[styles.image, { width: 300, height: 200 }]}
                        resizeMode="cover"
                      />
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => handleImagePress("fornalha")}
                      style={styles.addImageBox}
                    >
                      <Feather name="plus-circle" size={24} color="gray" />
                      <Text style={styles.imageText}>Adicionar Imagem</Text>
                    </Pressable>
                  )}
                </View>

                <View style={{ marginBottom: 20 }}>
                  <View style={{ backgroundColor: "#bae6fd" }}>
                    <View
                      style={styles.headerSection}
                    >
                      <Text>Fornalha</Text>
                    </View>

                    <View style={{ backgroundColor: "#bae6fd" }}>
                      <View style={styles.containerRegisterMedidas}>
                        <View style={styles.containerlineInformationMedidas}>
                          <Text style={styles.lineInfosMedidas}>Frontal</Text>
                          <View style={{ width: 230 }}>
                            <ThicknessRegistered
                              medidas={fornalhaFrontal}
                              atualizarValorMedida={atualizarValorMedida}
                              lado="Frontal Fornalha"
                            />
                          </View>
                          <Pressable
                            onPress={() => adicionarMedida("Frontal Fornalha")}
                          >
                            <AntDesign name="plus" size={24} color="black" />
                          </Pressable>
                        </View>
                      </View>

                      <View style={styles.containerRegisterMedidas}>
                        <View style={styles.containerlineInformationMedidas}>
                          <Text style={styles.lineInfosMedidas}>Lado Esquerdo</Text>
                          <View style={{ width: 230 }}>
                            <ThicknessRegistered
                              medidas={fornalhaLadoEsquerdo}
                              atualizarValorMedida={atualizarValorMedida}
                              lado="Lado esquerdo Fornalha"
                            />
                          </View>
                          <Pressable
                            onPress={() => adicionarMedida("Lado esquerdo Fornalha")}
                          >
                            <AntDesign name="plus" size={24} color="black" />
                          </Pressable>
                        </View>
                      </View>

                      <View style={styles.containerRegisterMedidas}>
                        <View style={styles.containerlineInformationMedidas}>
                          <Text style={styles.lineInfosMedidas}>Lado Direito</Text>
                          <View style={{ width: 230 }}>
                            <ThicknessRegistered
                              medidas={fornalhaLadoDireito}
                              atualizarValorMedida={atualizarValorMedida}
                              lado="Lado Direito Fornalha"
                            />
                          </View>
                          <Pressable
                            onPress={() => adicionarMedida("Lado Direito Fornalha")}
                          >
                            <AntDesign name="plus" size={24} color="black" />
                          </Pressable>
                        </View>
                      </View>
                      <View style={styles.containerRegisterMedidas}>
                        <View style={styles.containerlineInformationMedidas}>
                          <Text style={styles.lineInfosMedidas}>Traseira</Text>
                          <View style={{ width: 230 }}>
                            <ThicknessRegistered
                              medidas={fornalhaTraseira}
                              atualizarValorMedida={atualizarValorMedida}
                              lado="Traseira Fornalha"
                            />
                          </View>
                          <Pressable
                            onPress={() => adicionarMedida("Traseira Fornalha")}
                          >
                            <AntDesign name="plus" size={24} color="black" />
                          </Pressable>
                        </View>
                      </View>
                    </View>

                    <View style={styles.contentBottomContainerPart}></View>
                  </View>
                  <TextInput onChangeText={setObservationFornalha} value={observationFornalha} style={styles.textAreas} placeholder="Observações" />
                </View>

                {/* Economizador */}
                <View style={styles.imageMap}>
                  {imageEconomizador ? (
                    <Pressable
                      onPress={() => handleImagePress("economizador")}
                      style={styles.imageBox}
                    >
                      <Image
                        source={{ uri: imageEconomizador }}
                        style={[styles.image, { width: 300, height: 200 }]}
                        resizeMode="cover"
                      />
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => handleImagePress("economizador")}
                      style={styles.addImageBox}
                    >
                      <Feather name="plus-circle" size={24} color="gray" />
                      <Text style={styles.imageText}>Adicionar Imagem</Text>
                    </Pressable>
                  )}
                </View>

                <View style={{ marginBottom: 20 }}>
                  <View style={{ backgroundColor: "#bae6fd" }}>
                    <View
                      style={styles.headerSection}
                    >
                      <Text>Economizador</Text>
                    </View>

                    <View style={{ backgroundColor: "#bae6fd" }}>
                      <View style={styles.containerRegisterMedidas}>
                        <View style={styles.containerlineInformationMedidas}>
                          <Text style={styles.lineInfosMedidas}>Tubo</Text>
                          <View style={{ width: 230 }}>
                            <ThicknessRegistered
                              medidas={economizadorTubo}
                              atualizarValorMedida={atualizarValorMedida}
                              lado="Tubo Economizador"
                            />
                          </View>
                          <Pressable
                            onPress={() => adicionarMedida("Tubo Economizador")}
                          >
                            <AntDesign name="plus" size={24} color="black" />
                          </Pressable>
                        </View>
                      </View>
                    </View>

                    <View style={styles.contentBottomContainerPart}></View>
                  </View>
                  <TextInput onChangeText={setObservationEconomizador} value={observationEconomizador} style={styles.textAreas} placeholder="Observações" />
                </View>

                {/* Desaerador */}
                <View style={styles.imageMap}>
                  {imageDesaerador ? (
                    <Pressable
                      onPress={() => handleImagePress("desaerador")}
                      style={styles.imageBox}
                    >
                      <Image
                        source={{ uri: imageDesaerador }}
                        style={[styles.image, { width: 300, height: 200 }]}
                        resizeMode="cover"
                      />
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => handleImagePress("desaerador")}
                      style={styles.addImageBox}
                    >
                      <Feather name="plus-circle" size={24} color="gray" />
                      <Text style={styles.imageText}>Adicionar Imagem</Text>
                    </Pressable>
                  )}
                </View>

                <View style={{ marginBottom: 20 }}>
                  <View style={{ backgroundColor: "#bae6fd" }}>
                    <View
                      style={styles.headerSection}
                    >
                      <Text>Desaerador</Text>
                    </View>

                    <View style={{ backgroundColor: "#bae6fd" }}>
                      <View style={styles.containerRegisterMedidas}>
                        <View style={styles.containerlineInformationMedidas}>
                          <Text style={styles.lineInfosMedidas}>Tampo Esquerdo</Text>
                          <View style={{ width: 230 }}>
                            <ThicknessRegistered
                              medidas={desaeradorTampoEsquerdo}
                              atualizarValorMedida={atualizarValorMedida}
                              lado="Tampo Esquerdo Desaerador"
                            />
                          </View>
                          <Pressable
                            onPress={() => adicionarMedida("Tampo Esquerdo Desaerador")}
                          >
                            <AntDesign name="plus" size={24} color="black" />
                          </Pressable>
                        </View>
                      </View>

                      <View style={styles.containerRegisterMedidas}>
                        <View style={styles.containerlineInformationMedidas}>
                          <Text style={styles.lineInfosMedidas}>Costado</Text>
                          <View style={{ width: 230 }}>
                            <ThicknessRegistered
                              medidas={desaeradorCostado}
                              atualizarValorMedida={atualizarValorMedida}
                              lado="Costado Desaerador"
                            />
                          </View>
                          <Pressable
                            onPress={() => adicionarMedida("Costado Desaerador")}
                          >
                            <AntDesign name="plus" size={24} color="black" />
                          </Pressable>
                        </View>
                      </View>

                      <View style={styles.containerRegisterMedidas}>
                        <View style={styles.containerlineInformationMedidas}>
                          <Text style={styles.lineInfosMedidas}>Tampo Direito</Text>
                          <View style={{ width: 230 }}>
                            <ThicknessRegistered
                              medidas={desaeradorTampoDireito}
                              atualizarValorMedida={atualizarValorMedida}
                              lado="Tampo Direito Desaerador"
                            />
                          </View>
                          <Pressable
                            onPress={() => adicionarMedida("Tampo Direito Desaerador")}
                          >
                            <AntDesign name="plus" size={24} color="black" />
                          </Pressable>
                        </View>
                      </View>
                    </View>

                    <View style={styles.contentBottomContainerPart}></View>
                  </View>
                  <TextInput onChangeText={setObservationDesaerador} value={observationDesaerador} style={styles.textAreas} placeholder="Observações" />
                </View>

                {/* Espelhos */}
                <View style={styles.imageMap}>
                  {imageEspelhos ? (
                    <Pressable
                      onPress={() => handleImagePress("espelhos")}
                      style={styles.imageBox}
                    >
                      <Image
                        source={{ uri: imageEspelhos }}
                        style={[styles.image, { width: 300, height: 200 }]}
                        resizeMode="cover"
                      />
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => handleImagePress("espelhos")}
                      style={styles.addImageBox}
                    >
                      <Feather name="plus-circle" size={24} color="gray" />
                      <Text style={styles.imageText}>Adicionar Imagem</Text>
                    </Pressable>
                  )}
                </View>

                <View style={{ marginBottom: 20 }}>
                  <View style={{ backgroundColor: "#bae6fd" }}>
                    <View
                      style={styles.headerSection}
                    >
                      <Text>Espelhos</Text>
                    </View>

                    <View style={{ backgroundColor: "#bae6fd" }}>
                      <View style={styles.containerRegisterMedidas}>
                        <View style={styles.containerlineInformationMedidas}>
                          <Text style={styles.lineInfosMedidas}>Espelho frontal</Text>
                          <View style={{ width: 230 }}>
                            <ThicknessRegistered
                              medidas={espelhosEspelhoFrontal}
                              atualizarValorMedida={atualizarValorMedida}
                              lado="Espelho frontal Espelho"
                            />
                          </View>
                          <Pressable
                            onPress={() => adicionarMedida("Espelho frontal Espelho")}
                          >
                            <AntDesign name="plus" size={24} color="black" />
                          </Pressable>
                        </View>
                      </View>

                      <View style={styles.containerRegisterMedidas}>
                        <View style={styles.containerlineInformationMedidas}>
                          <Text style={styles.lineInfosMedidas}>Espelho traseiro</Text>
                          <View style={{ width: 230 }}>
                            <ThicknessRegistered
                              medidas={espelhosEspelhoTraseiro}
                              atualizarValorMedida={atualizarValorMedida}
                              lado="Espelho traseiro Espelho"
                            />
                          </View>
                          <Pressable
                            onPress={() => adicionarMedida("Espelho traseiro Espelho")}
                          >
                            <AntDesign name="plus" size={24} color="black" />
                          </Pressable>
                        </View>
                      </View>
                    </View>

                    <View style={styles.contentBottomContainerPart}></View>
                  </View>
                  <TextInput onChangeText={setObservationEspelhos} value={observationEspelhos} style={styles.textAreas} placeholder="Observações" />
                </View>

                {/* Tubulão */}
                <View style={styles.imageMap}>
                  {imageTubulao ? (
                    <Pressable
                      onPress={() => handleImagePress("tubulao")}
                      style={styles.imageBox}
                    >
                      <Image
                        source={{ uri: imageTubulao }}
                        style={[styles.image, { width: 300, height: 200 }]}
                        resizeMode="cover"
                      />
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => handleImagePress("tubulao")}
                      style={styles.addImageBox}
                    >
                      <Feather name="plus-circle" size={24} color="gray" />
                      <Text style={styles.imageText}>Adicionar Imagem</Text>
                    </Pressable>
                  )}
                </View>

                <View style={{ marginBottom: 20 }}>
                  <View style={{ backgroundColor: "#bae6fd" }}>
                    <View
                      style={styles.headerSection}
                    >
                      <Text>Tubulão</Text>
                    </View>

                    <View style={{ backgroundColor: "#bae6fd" }}>
                      <View style={styles.containerRegisterMedidas}>
                        <View style={styles.containerlineInformationMedidas}>
                          <Text style={styles.lineInfosMedidas}>Parede</Text>
                          <View style={{ width: 230 }}>
                            <ThicknessRegistered
                              medidas={tubulaoParede}
                              atualizarValorMedida={atualizarValorMedida}
                              lado="Parede Tubulão"
                            />
                          </View>
                          <Pressable onPress={() => adicionarMedida("Parede Tubulão")}>
                            <AntDesign name="plus" size={24} color="black" />
                          </Pressable>
                        </View>
                      </View>

                      <View style={styles.containerRegisterMedidas}>
                        <View style={styles.containerlineInformationMedidas}>
                          <Text style={styles.lineInfosMedidas}>Região de solda</Text>
                          <View style={{ width: 230 }}>
                            <ThicknessRegistered
                              medidas={tubulaoRegiaoSolda}
                              atualizarValorMedida={atualizarValorMedida}
                              lado="Região de solda Tubulão"
                            />
                          </View>
                          <Pressable
                            onPress={() => adicionarMedida("Região de solda Tubulão")}
                          >
                            <AntDesign name="plus" size={24} color="black" />
                          </Pressable>
                        </View>
                      </View>

                      <View style={styles.containerRegisterMedidas}>
                        <View style={styles.containerlineInformationMedidas}>
                          <Text style={styles.lineInfosMedidas}>Extremidades</Text>
                          <View style={{ width: 230 }}>
                            <ThicknessRegistered
                              medidas={tubulaoExtremidades}
                              atualizarValorMedida={atualizarValorMedida}
                              lado="Extremidades Tubulão"
                            />
                          </View>
                          <Pressable
                            onPress={() => adicionarMedida("Extremidades Tubulão")}
                          >
                            <AntDesign name="plus" size={24} color="black" />
                          </Pressable>
                        </View>
                      </View>
                    </View>

                    <View style={styles.contentBottomContainerPart}></View>
                  </View>
                  <TextInput onChangeText={setObservationTubulao} value={observationTubulao} style={styles.textAreas} placeholder="Observações" />
                </View>

                <Pressable style={styles.registerMeasurementMap} onPress={isEdit ? () => updateMapOfMeditionData() : () => collectData()}>
                  <Text style={styles.registerMeasurementMapText}>
                    {isEdit ? "Atualizar dados" : "Registrar Medição de espessura"}
                  </Text>
                  <AntDesign name="plus" size={24} color="white" />
                </Pressable>
              </ScrollView>
            </View>
          </View>
        )
      case "Vaso de Pressão":
        return (
          <View style={styles.container}>
            <ScrollView
              style={
                Platform.OS === "web"
                  ? {
                    flex: 1,
                    width: "100%",
                    overflow: "auto",
                    maxHeight: "90vh",
                  }
                  : {

                  }
              }
              showsVerticalScrollIndicator={Platform.OS === "web"}
            >
              <AddImageInProjectModal
                visible={modalTypeUploadPicture}
                onClose={() => setModalTypeUploadPicture(false)}
                onImagePicked={handleImagePicked}
                onCameraOpen={handleCameraOpen}
              />
              <View style={styles.imageMap}>
                {imageVaso ? (
                  <Pressable
                    onPress={() => handleImagePress("vaso")}
                    style={styles.imageBox}
                  >
                    <Image
                      source={{ uri: imageVaso }}
                      alt="imagem vaso reservatório"
                      style={[styles.image, { width: 300, height: 200 }]}
                      resizeMode="cover"
                    />
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => handleImagePress("vaso")}
                    style={styles.addImageBox}
                  >
                    <Feather name="plus-circle" size={24} color="gray" />
                    <Text style={styles.imageText}>Adicionar Imagem</Text>
                  </Pressable>
                )}
              </View>
              <View style={{ backgroundColor: "#bae6fd" }}>
                <View
                  style={styles.headerSection}
                >
                  <Text>Vaso reservatório</Text>
                </View>

                <View style={{ backgroundColor: "#bae6fd" }}>
                  <View style={styles.containerRegisterMedidas}>
                    <View style={styles.containerlineInformationMedidas}>
                      <Text style={styles.lineInfosMedidas}>Tampo Esquerdo</Text>
                      <View style={{ width: 230 }}>
                        <ThicknessRegistered
                          medidas={vasoTampoEsquerdo}
                          atualizarValorMedida={atualizarValorMedida}
                          lado="Tampo Esquerdo Vaso reservatório"
                        />
                      </View>
                      <Pressable
                        onPress={() =>
                          adicionarMedida("Tampo Esquerdo Vaso reservatório")
                        }
                      >
                        <AntDesign name="plus" size={24} color="black" />
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.containerRegisterMedidas}>
                    <View style={styles.containerlineInformationMedidas}>
                      <Text style={styles.lineInfosMedidas}>Costado</Text>
                      <View style={{ width: 230 }}>
                        <ThicknessRegistered
                          medidas={vasoCostado}
                          atualizarValorMedida={atualizarValorMedida}
                          lado="Costado Vaso reservatório"
                        />
                      </View>
                      <Pressable
                        onPress={() => adicionarMedida("Costado Vaso reservatório")}
                      >
                        <AntDesign name="plus" size={24} color="black" />
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.containerRegisterMedidas}>
                    <View style={styles.containerlineInformationMedidas}>
                      <Text style={styles.lineInfosMedidas}>Tampo Direito</Text>
                      <View style={{ width: 230 }}>
                        <ThicknessRegistered
                          medidas={vasoTampoDireito}
                          atualizarValorMedida={atualizarValorMedida}
                          lado="Tampo Direito Vaso reservatório"
                        />
                      </View>
                      <Pressable
                        onPress={() =>
                          adicionarMedida("Tampo Direito Vaso reservatório")
                        }
                      >
                        <AntDesign name="plus" size={24} color="black" />
                      </Pressable>
                    </View>
                  </View>
                </View>

                <View style={styles.contentBottomContainerPart}></View>
              </View>
              <TextInput onChangeText={setObservationVaso} value={observationVaso} style={styles.textAreas} placeholder="Observações" />

              <Pressable style={styles.registerMeasurementMap} onPress={isEdit ? () => updateMapOfMeditionData() : () => collectData()}>
                <Text style={styles.registerMeasurementMapText}>
                  {isEdit ? "Atualizar dados" : "Registrar Medição de espessura"}
                </Text>
                <AntDesign name="plus" size={24} color="white" />
              </Pressable>
            </ScrollView>
          </View>
        )
    }
  }


  return (
    <View style={{ }}>
      {renderFields()}
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,

  },
  textAreas: {
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 5,
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  containerRegisterMedidas: {
    borderBottomColor: "#71717a",
    borderBottomWidth: 2,
    paddingVertical: 5,
  },
  containerlineInformationMedidas: {
    padding: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lineInfosMedidas: {
    width: 95,
    textAlign: "center",
  },
  registerMeasurementMap: {
    backgroundColor: "#1d4ed8",
    width: "100%",
    marginVertical: 20,
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  registerMeasurementMapText: {
    color: "#fff",
  },
  contentBottomContainerPart: {
    textAlign: "center",
    backgroundColor: "#38bdf8",
    padding: 10,
    alignItems: "center",
    borderBottomEndRadius: 5,
    borderBottomStartRadius: 5,
  },
  imageMap: {
    alignItems: "center",
    height: 200,
    width: "auto",
    backgroundColor: "#e5e5e5",
    borderRadius: 5,
    marginVertical: 15,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#38bdf8",
    padding: 10,
    alignItems: "center",
    borderTopEndRadius: 5,
    borderTopStartRadius: 5,
  }
});

export default ThicknessMeasurementMap;
