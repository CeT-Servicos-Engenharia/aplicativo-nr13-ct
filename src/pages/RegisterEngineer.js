import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  Image,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as ImagePicker from "expo-image-picker";
import { db } from "../../database/firebaseConfig";
import { collection, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const RegisterEngineer = ({ route, navigation }) => {
  const [infoEngenieer, setInfoEngenieer] = useState({
    name: "",
    cep: "",
    address: "",
    number: "",
    neighborhood: "",
    complement: "",
    email: "",
    phone: "",
    cnpj: "",
    crea: "",
    signature: null,
  });

  const engenieer = route.params?.engenieer || null;

  useEffect(() => {
    if (engenieer) {
      setInfoEngenieer(engenieer);
    }
  }, [engenieer]);

  const handleInputChange = (field, value) => {
    setInfoEngenieer((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const uploadImageToFirebase = async (imageUri) => {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const storage = getStorage();
      const storageRef = ref(storage, `engenieers/${Date.now()}.png`);

      // Adiciona metadata para preservar a transparência
      const metadata = {
        contentType: 'image/png',
      };

      await uploadBytes(storageRef, blob, metadata);
      const downloadURL = await getDownloadURL(storageRef);

      return downloadURL;
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      throw error;
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Erro", "É necessário permitir o acesso à galeria de imagens!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      allowsMultipleSelection: false,
      base64: true,
    });

    if (!result.canceled) {
      setInfoEngenieer((prevState) => ({
        ...prevState,
        signature: result.assets[0].uri,
      }));
    }
  };


  const register = async () => {
    const {
      name,
      cep,
      address,
      number,
      neighborhood,
      complement,
      email,
      phone,
      cnpj,
      crea,
      signature,
    } = infoEngenieer;

    try {
      let signatureUrl = null;

      if (signature) {
        signatureUrl = await uploadImageToFirebase(signature)
      }

      if (engenieer) {
        await updateDoc(doc(db, "engenieer", engenieer.id), {
          name,
          cep,
          address,
          number,
          neighborhood,
          complement,
          email,
          phone,
          cnpj,
          crea,
          signature: signatureUrl,
        });

        Alert.alert("Sucesso", "Engenheiro atualizado com sucesso!");
      } else {
        await addDoc(collection(db, "engenieer"), {
          name,
          cep,
          address,
          number,
          neighborhood,
          complement,
          email,
          phone,
          cnpj,
          crea,
          signature: signatureUrl,
          createdAt: serverTimestamp(),
        });

        Alert.alert("Sucesso", "Engenheiro cadastrado com sucesso!");
      }
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao registrar engenheiro: ", error);
      Alert.alert("Erro", "Falha ao registrar o engenheiro. Tente novamente.");
    }
  };

  return (
    <View style={styles.containerRegisterClients}>
      <ScrollView>
        <TextInput
          style={styles.textAreas}
          placeholder="Nome"
          value={infoEngenieer.name}
          onChangeText={(text) => handleInputChange("name", text)}
        />
        <TextInput
          style={styles.textAreas}
          placeholder="CEP"
          value={infoEngenieer.cep}
          onChangeText={(text) => handleInputChange("cep", text)}
        />
        <TextInput
          style={styles.textAreas}
          placeholder="Endereço"
          value={infoEngenieer.address}
          onChangeText={(text) => handleInputChange("address", text)}
        />
        <TextInput
          style={styles.textAreas}
          placeholder="Número"
          value={infoEngenieer.number}
          onChangeText={(text) => handleInputChange("number", text)}
        />
        <TextInput
          style={styles.textAreas}
          placeholder="Bairro"
          value={infoEngenieer.neighborhood}
          onChangeText={(text) => handleInputChange("neighborhood", text)}
        />
        <TextInput
          style={styles.textAreas}
          placeholder="Complemento"
          value={infoEngenieer.complement}
          onChangeText={(text) => handleInputChange("complement", text)}
        />
        <TextInput
          style={styles.textAreas}
          placeholder="E-mail"
          value={infoEngenieer.email}
          onChangeText={(text) => handleInputChange("email", text)}
        />
        <TextInput
          style={styles.textAreas}
          placeholder="Telefone"
          value={infoEngenieer.phone}
          onChangeText={(text) => handleInputChange("phone", text)}
        />
        <TextInput
          style={styles.textAreas}
          placeholder="CNPJ/CPF"
          value={infoEngenieer.cnpj}
          onChangeText={(text) => handleInputChange("cnpj", text)}
        />
        <TextInput
          style={styles.textAreas}
          placeholder="CREA"
          value={infoEngenieer.crea}
          onChangeText={(text) => handleInputChange("crea", text)}
        />

        <Pressable onPress={pickImage}>
          <Text style={styles.logoText}>Adicionar logo do cliente</Text>
        </Pressable>

        {/* Exibir a logo selecionada, se existir */}
        {infoEngenieer.signature && (
          <Image
            source={{ uri: infoEngenieer.signature }}
            style={styles.logoPreview}
          />
        )}
      </ScrollView>
      <Pressable style={styles.addClient} onPress={() => register()}>
        <Text style={styles.saveButtonText}>{engenieer ? "Salvar Alterações" : "Adicionar Cliente"}</Text>
        <AntDesign name={engenieer ? "save" : "plus"} size={24} color="white" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  containerRegisterClients: {
    padding: 20,
    backgroundColor: "#f3f4f6",
    flex: 1,
    justifyContent: "center",
  },
  textAreas: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#52525b",
    marginBottom: 15,
    borderRadius: 5,
  },
  addClient: {
    marginTop: 30,
    paddingVertical: 15,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1d4ed8",
  },
  addClientText: {
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
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    marginRight: 10,
  },
});

export default RegisterEngineer;
