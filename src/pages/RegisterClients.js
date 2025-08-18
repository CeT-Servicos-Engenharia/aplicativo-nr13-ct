import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  Platform,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as ImagePicker from "expo-image-picker";
import { db } from "../../database/firebaseConfig";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const RegisterClients = ({ route, navigation }) => {
  const [infoClients, setInfoClients] = useState({
    person: "",
    cep: "",
    address: "",
    number: "",
    neighborhood: "",
    complement: "",
    email: "",
    phone: "",
    cnpj: "",
    logo: null,
  });

  const client = route.params?.client || null;

  useEffect(() => {
    if (client) {
      setInfoClients(client);
    }
  }, [client]);  

  const handleInputChange = (field, value) => {
    setInfoClients((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const uploadImageToFirebase = async (imageUri) => {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const storage = getStorage();
    const storageRef = ref(storage, `clients/${Date.now()}.jpg`);

    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Erro", "É necessário permitir o acesso à galeria de imagens!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setInfoClients((prevState) => ({
        ...prevState,
        logo: result.assets[0].uri,
      }));
    }
  };

  const saveClient = async () => {
    const {
      person,
      cep,
      address,
      number,
      neighborhood,
      complement,
      email,
      phone,
      cnpj,
      logo,
    } = infoClients;

    if (!person || !cep || !address || !number || !neighborhood || !email || !phone || !cnpj) {
      Alert.alert("Erro", "Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      let logoUrl = infoClients.logo;
      
      // Se for uma nova imagem, fazer o upload
      if (infoClients.logo && !infoClients.logo.startsWith("http")) {
        logoUrl = await uploadImageToFirebase(infoClients.logo);
      }

      if (client) {
        // Atualizar cliente existente
        await updateDoc(doc(db, "clients", client.id), {
          person,
          cep,
          address,
          number,
          neighborhood,
          complement,
          email,
          phone,
          cnpj,
          logo: logoUrl,
        });

        Alert.alert("Sucesso", "Cliente atualizado com sucesso!");
      } else {
        // Criar novo cliente
        await addDoc(collection(db, "clients"), {
          person,
          cep,
          address,
          number,
          neighborhood,
          complement,
          email,
          phone,
          cnpj,
          logo: logoUrl,
          createdAt: serverTimestamp(),
        });

        Alert.alert("Sucesso", "Cliente registrado com sucesso!");
      }

      navigation.goBack();
    } catch (error) {
      console.error("Erro ao salvar cliente: ", error);
      Alert.alert("Erro", "Falha ao salvar o cliente. Tente novamente.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <TextInput style={styles.textAreas} placeholder="Pessoa" value={infoClients.person} onChangeText={(text) => handleInputChange("person", text)} />
        <TextInput style={styles.textAreas} placeholder="CEP" value={infoClients.cep} onChangeText={(text) => handleInputChange("cep", text)} />
        <TextInput style={styles.textAreas} placeholder="Endereço" value={infoClients.address} onChangeText={(text) => handleInputChange("address", text)} />
        <TextInput style={styles.textAreas} placeholder="Número" value={infoClients.number} onChangeText={(text) => handleInputChange("number", text)} />
        <TextInput style={styles.textAreas} placeholder="Bairro" value={infoClients.neighborhood} onChangeText={(text) => handleInputChange("neighborhood", text)} />
        <TextInput style={styles.textAreas} placeholder="Complemento" value={infoClients.complement} onChangeText={(text) => handleInputChange("complement", text)} />
        <TextInput style={styles.textAreas} placeholder="E-mail" value={infoClients.email} onChangeText={(text) => handleInputChange("email", text)} />
        <TextInput style={styles.textAreas} placeholder="Telefone" value={infoClients.phone} onChangeText={(text) => handleInputChange("phone", text)} />
        <TextInput style={styles.textAreas} placeholder="CNPJ" value={infoClients.cnpj} onChangeText={(text) => handleInputChange("cnpj", text)} />

        <Pressable onPress={pickImage}>
          <Text style={styles.logoText}>Adicionar logo do cliente</Text>
        </Pressable>

        {infoClients.logo && <Image source={{ uri: infoClients.logo }} style={styles.logoPreview} />}
      </ScrollView>

      <Pressable style={styles.saveButton} onPress={saveClient}>
        <Text style={styles.saveButtonText}>{client ? "Salvar Alterações" : "Adicionar Cliente"}</Text>
        <AntDesign name={client ? "save" : "plus"} size={24} color="white" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f3f4f6",
    flex: 1,
  },
  textAreas: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#52525b",
    marginBottom: 15,
    borderRadius: 5,
  },
  saveButton: {
    marginTop: 30,
    paddingVertical: 15,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1d4ed8",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    marginRight: 10,
  },
  logoText: {
    marginVertical: 10,
    color: "#1d4ed8",
    textAlign: "center",
  },
  logoPreview: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
});

export default RegisterClients;
