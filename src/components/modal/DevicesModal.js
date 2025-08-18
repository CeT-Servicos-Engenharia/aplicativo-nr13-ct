import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Image, FlatList } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import AddImageInProjectModal from './AddImageInProjectModal';
import SelectDropdown from 'react-native-select-dropdown'
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import NetInfo from "@react-native-community/netinfo";
import * as FileSystem from "expo-file-system";

const DevicesModal = ({ visible, onClose, content, onSave, editData, isConnected }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [images, setImages] = useState([null]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [deviceData, setDeviceData] = useState(content || {});
  const typeDeviceOptions = [
    { title: 'Termômetro' },
    { title: 'Manômetro' },
    { title: 'Válvula de segurança' },
    { title: 'Válvula de alívio' },
    { title: 'Disco de ruptura' },
    { title: 'Pressostato' },
    { title: 'Injetor' },
  ];

  console.log(`Está no modo: ${isConnected ? "ON" : "OFF"}`);

  console.log("Dados recebidos no modal: ", editData);

  useEffect(() => {
    if (content) {
      setDeviceData(content);
    } else {
      setDeviceData({

      });
    }
  }, [content]);

  const uploadImageToFirebase = async (imageUri) => {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const storage = getStorage();
    const storageRef = ref(storage, `inspections/devices/${Date.now()}.jpg`);

    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  };

  const openImagePickerAsync = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permissão para acessar a galeria é necessária!");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!pickerResult.canceled && selectedIndex !== null) {
      const imageUri = pickerResult.assets[0].uri;

      if (isConnected === false) {
        console.log("Iniciando função de enviar imagem no off")
        const localUri = `${FileSystem.documentDirectory}offline-image-${Date.now()}.jpg`;
        await FileSystem.copyAsync({ from: imageUri, to: localUri });
        console.log("Iniciando função de enviar imagem no off")
        try {

          await FileSystem.copyAsync({ from: imageUri, to: localUri });

          const newImages = [...images];
          newImages[selectedIndex] = localUri; // Garante que a imagem seja acessível
          console.log("Imagem recebida: ", newImages);
          setImages(newImages);

          // Atualiza o estado do deviceData para exibir a imagem corretamente
          setDeviceData(prevData => ({
            ...prevData,
            images: newImages
          }));

          console.log("Imagem salva localmente:", localUri);
        } catch (error) {
          console.error("Erro ao salvar imagem localmente:", error);
        }

      } else {
        try {
          const uploadedImageUrl = await uploadImageToFirebase(imageUri);
          const newImages = [...(deviceData.images || [])];
          newImages[selectedIndex] = uploadedImageUrl;
          setDeviceData({ ...deviceData, images: newImages });
        } catch (error) {
          console.error("Erro ao fazer upload da imagem:", error);
          alert("Erro ao enviar a imagem. Tente novamente.");
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
    let cameraResult = await ImagePicker.launchCameraAsync();
    if (!cameraResult.canceled && selectedIndex !== null) {
      setImages([cameraResult.assets[0].uri]);
      setDeviceData((prevData) => ({
        ...prevData,
        images: [cameraResult.assets[0].uri] // Salva a imagem diretamente no `deviceData`
      }));
      setModalVisible(false);
    }
  };

  const handleImagePress = (index) => {
    setSelectedIndex(index);
    setModalVisible(true);
  };

  const handleFieldChange = (field, value) => {
    setDeviceData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
    console.log(`Campo atualizado - ${field}:`, value);
  };

  const handleSave = () => {
    console.log("Dados do dispositivo antes de salvar:", deviceData);

    if (!deviceData.typeDevice) {
      alert('Selecione o tipo de dispositivo');
      return;
    }

    const deviceFieldsMap = {
      Termômetro: {
        "Tipo de dispositivo": deviceData.typeDevice || "",
        Descrição: deviceData.descrption || "",
        Identificação: deviceData.identify || "",
        Fabricante: deviceData.producer || "",
        "Faixa de temperatura": deviceData.temperatureRange || "",
        Precisão: deviceData.precision || "",
        "Número do certificado": deviceData.numberOfCertificate || "",
        "Data de calibração": deviceData.dateCalibration || "",
        "Validade da calibração": deviceData.validityCalibration || "",
        Imagens: deviceData.images || [],
      },
      Manômetro: {
        "Tipo de dispositivo": deviceData.typeDevice || "",
        Descrição: deviceData.descrption || "",
        Identificação: deviceData.identify || "",
        Fabricante: deviceData.producer || "",
        Diâmetro: deviceData.diameter || "",
        Escala: deviceData.scale || "",
        Precisão: deviceData.precision || "",
        "Número do certificado": deviceData.numberOfCertificate || "",
        "Data de calibração": deviceData.dateCalibration || "",
        "Validade da calibração": deviceData.validityCalibration || "",
        Imagens: deviceData.images || [],
      },
      "Válvula de segurança": {
        "Tipo de dispositivo": deviceData.typeDevice || "",
        Identificação: deviceData.identify || "",
        Fabricante: deviceData.producer || "",
        Local: deviceData.location || "",
        "Tamanho/bitola": deviceData.size || "",
        "Tipo de válvula": deviceData.valveType || "",
        Capacidade: deviceData.capacity || "",
        "Pressão de abertura": deviceData.openingPressure || "",
        "Pressão de fechamento": deviceData.closingPressure || "",
        "Número do certificado": deviceData.numberOfCertificate || "",
        "Data de calibração": deviceData.dateCalibration || "",
        "Validade da calibração": deviceData.validityCalibration || "",
        Imagens: deviceData.images || [],
      },
      "Válvula de alívio": {
        "Tipo de dispositivo": deviceData.typeDevice || "",
        Identificação: deviceData.identify || "",
        Fabricante: deviceData.producer || "",
        "Local de instalação": deviceData.location || "",
        "Tipo de válvula": deviceData.valveType || "",
        Capacidade: deviceData.capacity || "",
        "Pressão de abertura": deviceData.openingPressure || "",
        "Pressão de fechamento": deviceData.closingPressure || "",
        "Número do certificado": deviceData.numberOfCertificate || "",
        "Data de calibração": deviceData.dateCalibration || "",
        "Validade da calibração": deviceData.validityCalibration || "",
        Imagens: deviceData.images || [],
      },
      "Disco de ruptura": {
        "Tipo de dispositivo": deviceData.typeDevice || "",
        Identificação: deviceData.identify || "",
        Fabricante: deviceData.producer || "",
        "Local de instalação": deviceData.locationOfInstall || "",
        Diâmetro: deviceData.diameter || "",
        "Pressão de ruptura": deviceData.burstingPressure || "",
        Material: deviceData.material || "",
        "Temperatura máxima de operação": deviceData.maximumTemperature || "",
        "Número do certificado": deviceData.numberOfCertificate || "",
        "Data da calibração": deviceData.dateCalibration || "",
        "Validade do disco": deviceData.validityDisk || "",
        Imagens: deviceData.images || [],
      },
      "Pressostato": {
        "Tipo de dispositivo": deviceData.typeDevice || "",
        Descrição: deviceData.descrption || "",
        Identificação: deviceData.identify || "",
        Fabricante: deviceData.producer || "",
        "Faixa de pressão": deviceData.pressureRange || "",
        "Precisão": deviceData.precision || "",
        "Tipo de pressostato": deviceData.typePressostato || "",
        "Ponto de acionamento": deviceData.triggerPoint || "",
        "Local de instalação": deviceData.locationOfInstall || "",
        "Número do certificado": deviceData.numberOfCertificate || "",
        "Data da calibração": deviceData.dateCalibration || "",
        "Validade da calibração": deviceData.validityCalibration || "",
        Imagens: deviceData.images || [],
      },
      "Injetor": {
        "Tipo de dispositivo": deviceData.typeDevice || "",
        Descrição: deviceData.descrption || "",
        Identificação: deviceData.identify || "",
        Fabricante: deviceData.producer || "",
        "Local de instalação": deviceData.locationOfInstall || "",
        "Tamanho": deviceData.size || "",
        "Tipo de injetor": deviceData.typeInjector || "",
        "Pressão de trabalho": deviceData.workingPressure || "",
        "Vazão": deviceData.flowRate || "",
        Material: deviceData.material || "",
        "Número do certificado": deviceData.numberOfCertificate || "",
        "Data da calibração": deviceData.dateCalibration || "",
        "Validade da calibração": deviceData.validityCalibration || "",
        Imagens: deviceData.images || [],
      },
    };

    // Selecionar apenas os campos correspondentes ao tipo de dispositivo
    const fullDeviceData = deviceFieldsMap[deviceData.typeDevice] || {};

    console.log("Dados completos do dispositivo para salvar:", fullDeviceData);

    // Salvar no banco de dados
    onSave(fullDeviceData);

    // Resetar o estado do modal
    setDeviceData({
      typeDevice: "",
      descrption: "",
      identify: "",
      producer: "",
      diameter: "",
      scale: "",
      precision: "",
      numberOfCertificate: "",
      dateCalibration: "",
      validityCalibration: "",
      images: [],
    });

    onClose();
  };

  useEffect(() => {
    if (editData !== undefined) {
      console.log(editData?.["Tipo de dispositivo"]);
      setDeviceData((prevData) => ({
        ...prevData,
        typeDevice: editData?.["Tipo de dispositivo"] || "",
        descrption: editData?.Descrição || "",
        identify: editData?.Identificação || "",
        producer: editData?.Fabricante || "",
        temperatureRange: editData?.["Faixa de temperatura"] || "",
        precision: editData?.Precisão || "",
        numberOfCertificate: editData?.["Número do certificado"] || "",
        dateCalibration: editData?.["Data de calibração"] || "",
        validityCalibration: editData?.["Validade da calibração"] || "",
        images: editData?.Imagens || [],
      }))
    }
  }, [editData])


  const renderFields = () => {
    switch (deviceData.typeDevice) {
      case 'Termômetro':
        return (
          <ScrollView style={{ width: '100%', }}>
            <Pressable onPress={() => handleImagePress(0)} style={styles.imageBox}>
              <Feather name="camera" size={24} color="gray" />
              <Text style={styles.imageText}>Termômetro</Text>
              {deviceData.images && deviceData.images[0] && (
                <Image source={{ uri: deviceData.images[0].startsWith('file://') ? deviceData.images[0] : `file://${deviceData.images[0]}` }} style={styles.image} />
              )}
            </Pressable>

            <AddImageInProjectModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              onImagePicked={openImagePickerAsync}
              onCameraOpen={openCameraAsync}
            />
            <TextInput style={styles.textAreas} placeholder="Descrição" value={deviceData.descrption} onChangeText={(value) => handleFieldChange('descrption', value)} />
            <TextInput style={styles.textAreas} placeholder="Identificação" value={deviceData.identify} onChangeText={(value) => handleFieldChange('identify', value)} />
            <TextInput style={styles.textAreas} placeholder="Fabricante" value={deviceData.producer} onChangeText={(value) => handleFieldChange('producer', value)} />
            <TextInput style={styles.textAreas} placeholder="Faixa de Temperatura" value={deviceData.temperatureRange} onChangeText={(value) => handleFieldChange('temperatureRange', value)} />
            <TextInput style={styles.textAreas} placeholder="Precisão" value={deviceData.precision} onChangeText={(value) => handleFieldChange('precision', value)} />
            <TextInput style={styles.textAreas} placeholder="Número de certificado" value={deviceData.numberOfCertificate} onChangeText={(value) => handleFieldChange('numberOfCertificate', value)} />
            <TextInput style={styles.textAreas} placeholder="Data de calibração" value={deviceData.dateCalibration} onChangeText={(value) => handleFieldChange('dateCalibration', value)} />
            <TextInput style={styles.textAreas} placeholder="Validade da calibração" value={deviceData.validityCalibration} onChangeText={(value) => handleFieldChange('validityCalibration', value)} />
          </ScrollView>
        );

      case 'Manômetro':
        return (
          <ScrollView style={{ width: '100%', }}>
            <Pressable onPress={() => handleImagePress(0)} style={styles.imageBox}>
              {deviceData.images && deviceData.images[0] ? (
                <Image
                  source={{ uri: deviceData.images[0] }}
                  style={styles.image}
                  resizeMode="cover" // Faz a imagem cobrir todo o espaço
                />
              ) : (
                <>
                  <Feather name="camera" size={24} color="gray" />
                  <Text style={styles.imageText}>Manômetro</Text>
                </>
              )}
            </Pressable>


            <AddImageInProjectModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              onImagePicked={openImagePickerAsync}
              onCameraOpen={openCameraAsync}
            />
            <TextInput style={styles.textAreas} placeholder="Descrição" value={deviceData.descrption} onChangeText={(value) => handleFieldChange('descrption', value)} />
            <TextInput style={styles.textAreas} placeholder="Identificação" value={deviceData.identify} onChangeText={(value) => handleFieldChange('identify', value)} />
            <TextInput style={styles.textAreas} placeholder="Fabricante" value={deviceData.producer} onChangeText={(value) => handleFieldChange('producer', value)} />
            <TextInput style={styles.textAreas} placeholder="Diâmetro" value={deviceData.diameter} onChangeText={(value) => handleFieldChange('diameter', value)} />
            <TextInput style={styles.textAreas} placeholder="Escala" value={deviceData.scale} onChangeText={(value) => handleFieldChange('scale', value)} />
            <TextInput style={styles.textAreas} placeholder="Precisão" value={deviceData.precision} onChangeText={(value) => handleFieldChange('precision', value)} />
            <TextInput style={styles.textAreas} placeholder="Número de certificado" value={deviceData.numberOfCertificate} onChangeText={(value) => handleFieldChange('numberOfCertificate', value)} />
            <TextInput style={styles.textAreas} placeholder="Data de calibração" value={deviceData.dateCalibration} onChangeText={(value) => handleFieldChange('dateCalibration', value)} />
            <TextInput style={styles.textAreas} placeholder="Validade da calibração" value={deviceData.validityCalibration} onChangeText={(value) => handleFieldChange('validityCalibration', value)} />
          </ScrollView>
        );

      case 'Válvula de segurança':
        return (
          <ScrollView style={{ width: '100%', }}>
            <Pressable onPress={() => handleImagePress(0)} style={styles.imageBox}>
              <Feather name="camera" size={24} color="gray" />
              <Text style={styles.imageText}>Válvula de Segurança</Text>
              {deviceData.images && deviceData.images[0] && (
                <Image source={{ uri: deviceData.images[0].startsWith('file://') ? deviceData.images[0] : `file://${deviceData.images[0]}` }} style={styles.image} />
              )}
            </Pressable>

            <AddImageInProjectModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              onImagePicked={openImagePickerAsync}
              onCameraOpen={openCameraAsync}
            />
            <TextInput style={styles.textAreas} placeholder="Identificação" value={deviceData.identify} onChangeText={(value) => handleFieldChange('identify', value)} />
            <TextInput style={styles.textAreas} placeholder="Fabricante" value={deviceData.producer} onChangeText={(value) => handleFieldChange('producer', value)} />
            <TextInput style={styles.textAreas} placeholder="Local" value={deviceData.location} onChangeText={(value) => handleFieldChange('location', value)} />
            <TextInput style={styles.textAreas} placeholder="Tamanho/Bitola" value={deviceData.size} onChangeText={(value) => handleFieldChange('size', value)} />
            <TextInput style={styles.textAreas} placeholder="Tipo de Válvula" value={deviceData.valveType} onChangeText={(value) => handleFieldChange('valveType', value)} />
            <TextInput style={styles.textAreas} placeholder="Capacidade" value={deviceData.capacity} onChangeText={(value) => handleFieldChange('capacity', value)} />
            <TextInput style={styles.textAreas} placeholder="Pressão de abertura" value={deviceData.openingPressure} onChangeText={(value) => handleFieldChange('openingPressure', value)} />
            <TextInput style={styles.textAreas} placeholder="Pressão de fechamento" value={deviceData.closingPressure} onChangeText={(value) => handleFieldChange('closingPressure', value)} />
            <TextInput style={styles.textAreas} placeholder="Número do certificado" value={deviceData.numberOfCertificate} onChangeText={(value) => handleFieldChange('numberOfCertificate', value)} />
            <TextInput style={styles.textAreas} placeholder="Data da calibração" value={deviceData.dateCalibration} onChangeText={(value) => handleFieldChange('dateCalibration', value)} />
            <TextInput style={styles.textAreas} placeholder="Validade da calibração" value={deviceData.validityCalibration} onChangeText={(value) => handleFieldChange('validityCalibration', value)} />
          </ScrollView>
        );

      case 'Válvula de alívio':
        return (
          <ScrollView style={{ width: '100%', }}>
            <Pressable onPress={() => handleImagePress(0)} style={styles.imageBox}>
              <Feather name="camera" size={24} color="gray" />
              <Text style={styles.imageText}>Válvula de Alívio</Text>
              {deviceData.images && deviceData.images[0] && (
                <Image source={{ uri: deviceData.images[0].startsWith('file://') ? deviceData.images[0] : `file://${deviceData.images[0]}` }} style={styles.image} />
              )}
            </Pressable>

            <AddImageInProjectModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              onImagePicked={openImagePickerAsync}
              onCameraOpen={openCameraAsync}
            />
            <TextInput style={styles.textAreas} placeholder="Identificação" value={deviceData.identify} onChangeText={(value) => handleFieldChange('identify', value)} />
            <TextInput style={styles.textAreas} placeholder="Fabricante" value={deviceData.producer} onChangeText={(value) => handleFieldChange('producer', value)} />
            <TextInput style={styles.textAreas} placeholder="Local de Instalação" value={deviceData.location} onChangeText={(value) => handleFieldChange('locationOfInstall', value)} />
            <TextInput style={styles.textAreas} placeholder="Tipo de Válvula" value={deviceData.valveType} onChangeText={(value) => handleFieldChange('valveType', value)} />
            <TextInput style={styles.textAreas} placeholder="Capacidade" value={deviceData.capacity} onChangeText={(value) => handleFieldChange('capacity', value)} />
            <TextInput style={styles.textAreas} placeholder="Pressão de abertura" value={deviceData.openingPressure} onChangeText={(value) => handleFieldChange('openingPressure', value)} />
            <TextInput style={styles.textAreas} placeholder="Pressão de fechamento" value={deviceData.closingPressure} onChangeText={(value) => handleFieldChange('closingPressure', value)} />
            <TextInput style={styles.textAreas} placeholder="Número do certificado" value={deviceData.numberOfCertificate} onChangeText={(value) => handleFieldChange('numberOfCertificate', value)} />
            <TextInput style={styles.textAreas} placeholder="Data da calibração" value={deviceData.dateCalibration} onChangeText={(value) => handleFieldChange('dateCalibration', value)} />
            <TextInput style={styles.textAreas} placeholder="Validade da calibração" value={deviceData.validityCalibration} onChangeText={(value) => handleFieldChange('validityCalibration', value)} />
          </ScrollView>
        );

      case 'Disco de ruptura':
        return (
          <ScrollView style={{ width: '100%', }}>
            <Pressable onPress={() => handleImagePress(0)} style={styles.imageBox}>
              <Feather name="camera" size={24} color="gray" />
              <Text style={styles.imageText}>Disco de Ruptura</Text>
              {deviceData.images && deviceData.images[0] && (
                <Image source={{ uri: deviceData.images[0].startsWith('file://') ? deviceData.images[0] : `file://${deviceData.images[0]}` }} style={styles.image} />
              )}
            </Pressable>

            <AddImageInProjectModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              onImagePicked={openImagePickerAsync}
              onCameraOpen={openCameraAsync}
            />
            <TextInput style={styles.textAreas} placeholder="Identificação" value={deviceData.identify} onChangeText={(value) => handleFieldChange('identify', value)} />
            <TextInput style={styles.textAreas} placeholder="Fabricante" value={deviceData.producer} onChangeText={(value) => handleFieldChange('producer', value)} />
            <TextInput style={styles.textAreas} placeholder="Local de Instalação" value={deviceData.locationOfInstall} onChangeText={(value) => handleFieldChange('locationOfInstall', value)} />
            <TextInput style={styles.textAreas} placeholder="Diâmetro" value={deviceData.diameter} onChangeText={(value) => handleFieldChange('diameter', value)} />
            <TextInput style={styles.textAreas} placeholder="Pressão de Ruptura" value={deviceData.burstingPressure} onChangeText={(value) => handleFieldChange('burstingPressure', value)} />
            <TextInput style={styles.textAreas} placeholder="Material" value={deviceData.material} onChangeText={(value) => handleFieldChange('material', value)} />
            <TextInput style={styles.textAreas} placeholder="Temperatura Máxima de Operação" value={deviceData.maximumTemperature} onChangeText={(value) => handleFieldChange('maximumTemperature', value)} />
            <TextInput style={styles.textAreas} placeholder="Número do certificado" value={deviceData.numberOfCertificate} onChangeText={(value) => handleFieldChange('numberOfCertificate', value)} />
            <TextInput style={styles.textAreas} placeholder="Data da calibração" value={deviceData.dateCalibration} onChangeText={(value) => handleFieldChange('dateCalibration', value)} />
            <TextInput style={styles.textAreas} placeholder="Validade do Disco" value={deviceData.validityDisk} onChangeText={(value) => handleFieldChange('validityDisk', value)} />
          </ScrollView>
        );

      case 'Pressostato':
        return (
          <ScrollView style={{ width: '100%', }}>
            <Pressable onPress={() => handleImagePress(0)} style={styles.imageBox}>
              <Feather name="camera" size={24} color="gray" />
              <Text style={styles.imageText}>Pressostato</Text>
              {deviceData.images && deviceData.images[0] && (
                <Image source={{ uri: deviceData.images[0].startsWith('file://') ? deviceData.images[0] : `file://${deviceData.images[0]}` }} style={styles.image} />
              )}
            </Pressable>

            <AddImageInProjectModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              onImagePicked={openImagePickerAsync}
              onCameraOpen={openCameraAsync}
            />
            <TextInput style={styles.textAreas} placeholder="Descrição" value={deviceData.descrption} onChangeText={(value) => handleFieldChange('descrption', value)} />
            <TextInput style={styles.textAreas} placeholder="Identificação" value={deviceData.identify} onChangeText={(value) => handleFieldChange('identify', value)} />
            <TextInput style={styles.textAreas} placeholder="Fabricante" value={deviceData.producer} onChangeText={(value) => handleFieldChange('producer', value)} />
            <TextInput style={styles.textAreas} placeholder="Faixa de Pressão" value={deviceData.pressureRange} onChangeText={(value) => handleFieldChange('pressureRange', value)} />
            <TextInput style={styles.textAreas} placeholder="Precisão" value={deviceData.precision} onChangeText={(value) => handleFieldChange('precision', value)} />
            <TextInput style={styles.textAreas} placeholder="Tipo de Pressostato" value={deviceData.typePressureSwitch} onChangeText={(value) => handleFieldChange('typePressureSwitch', value)} />
            <TextInput style={styles.textAreas} placeholder="Ponto de Acionamento" value={deviceData.pointActivate} onChangeText={(value) => handleFieldChange('pointActivate', value)} />
            <TextInput style={styles.textAreas} placeholder="Número do certificado" value={deviceData.numberOfCertificate} onChangeText={(value) => handleFieldChange('numberOfCertificate', value)} />
            <TextInput style={styles.textAreas} placeholder="Data da calibração" value={deviceData.dateCalibration} onChangeText={(value) => handleFieldChange('dateCalibration', value)} />
            <TextInput style={styles.textAreas} placeholder="Validade da calibração" value={deviceData.validityCalibration} onChangeText={(value) => handleFieldChange('validityCalibration', value)} />
          </ScrollView>
        );

      case 'Injetor':
        return (
          <ScrollView style={{ width: '100%', }}>
            <Pressable onPress={() => handleImagePress(0)} style={styles.imageBox}>
              <Feather name="camera" size={24} color="gray" />
              <Text style={styles.imageText}>Injetor</Text>
              {deviceData.images && deviceData.images[0] && (
                <Image source={{ uri: deviceData.images[0].startsWith('file://') ? deviceData.images[0] : `file://${deviceData.images[0]}` }} style={styles.image} />
              )}
            </Pressable>

            <AddImageInProjectModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              onImagePicked={openImagePickerAsync}
              onCameraOpen={openCameraAsync}
            />
            <TextInput style={styles.textAreas} placeholder="Descrição" value={deviceData.descrption} onChangeText={(value) => handleFieldChange('descrption', value)} />
            <TextInput style={styles.textAreas} placeholder="Identificação" value={deviceData.identify} onChangeText={(value) => handleFieldChange('identify', value)} />
            <TextInput style={styles.textAreas} placeholder="Fabricante" value={deviceData.producer} onChangeText={(value) => handleFieldChange('producer', value)} />
            <TextInput style={styles.textAreas} placeholder="Local de Instalação" value={deviceData.locationOfInstall} onChangeText={(value) => handleFieldChange('locationOfInstall', value)} />
            <TextInput style={styles.textAreas} placeholder="Tamanho" value={deviceData.size} onChangeText={(value) => handleFieldChange('size', value)} />
            <TextInput style={styles.textAreas} placeholder="Tipo de Injetor" value={deviceData.typeInjector} onChangeText={(value) => handleFieldChange('typeInjector', value)} />
            <TextInput style={styles.textAreas} placeholder="Pressão de Trabalho" value={deviceData.pressureOfWork} onChangeText={(value) => handleFieldChange('pressureOfWork', value)} />
            <TextInput style={styles.textAreas} placeholder="Vazão" value={deviceData.flow} onChangeText={(value) => handleFieldChange('flow', value)} />
            <TextInput style={styles.textAreas} placeholder="Material" value={deviceData.material} onChangeText={(value) => handleFieldChange('material', value)} />
            <TextInput style={styles.textAreas} placeholder="Número do certificado" value={deviceData.numberOfCertificate} onChangeText={(value) => handleFieldChange('numberOfCertificate', value)} />
            <TextInput style={styles.textAreas} placeholder="Data da calibração" value={deviceData.dateCalibration} onChangeText={(value) => handleFieldChange('dateCalibration', value)} />
            <TextInput style={styles.textAreas} placeholder="Validade da calibração" value={deviceData.validityCalibration} onChangeText={(value) => handleFieldChange('validityCalibration', value)} />
          </ScrollView>
        );

      default:
        return <Text>Selecione um tipo de dispositivo para ver os campos.</Text>;
    }
  };

  return (
    <Modal visible={visible} onRequestClose={onClose} transparent animationType="slide">
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <AntDesign name="closecircle" size={28} color="red" />
          </Pressable>
          <Text style={styles.title}>Dispositivos</Text>

          <SelectDropdown
            data={typeDeviceOptions}
            onSelect={(selectedItem, index) => {
              handleFieldChange('typeDevice', selectedItem.title);
            }}
            renderButtonText={(selectedItem) => {
              return selectedItem.title;
            }}
            renderButton={(selectedItem, isOpened) => {
              return (
                <View style={styles.dropdownButtonStyle}>
                  <Text style={styles.textInputDropDown}>
                    {(selectedItem && selectedItem.title) || 'Tipo de dispositivo'}
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
                    ...(isSelected && { backgroundColor: '#2563eb' }),
                  }}
                >
                  <Text style={styles.dropdownItemTxtStyle}>{item.title}</Text>
                </View>
              );
            }}
            showsVerticalScrollIndicator={false}
          />

          {renderFields()}

          <Pressable style={styles.registerButton} onPress={handleSave}>
            <Text style={styles.registerButtonText}>{editData !== undefined ? "Atualizar dispositivo" : "Registrar Dispositivo"}</Text>
            <AntDesign name="plus" size={24} color="white" />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    height: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  textAreas: {
    width: '100%',
    borderColor: 'gray',
    borderBottomWidth: 1,
    marginBottom: 5,
    paddingVertical: 10,
    borderRadius: 5,
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold'
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
    resizeMode: 'cover'
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
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  dropdownItemStyle: {
    backgroundColor: '#e5e5e5',
    padding: 20,
    margin: 5,
    borderRadius: 5,
  },
  dropdownButtonStyle: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    borderColor: 'gray',
    borderBottomWidth: 1,
  },
  dropdownTypeValue: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: 10,
    marginBottom: 10,
    borderBottomStartRadius: 0,
    borderTopLeftRadius: 0,
    borderRadius: 5,
    borderColor: 'gray',
    borderWidth: 1,
    borderLeftWidth: 0
  },
  inputWithDropdown: {
    borderColor: 'gray',
    width: '100%',
    borderBWidth: 1,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 10,
    borderRadius: 5,
  },
  registerButton: {
    backgroundColor: '#1d4ed8',
    width: '100%',
    margin: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  registerButtonText: {
    color: '#fff'
  },
});

export default DevicesModal;