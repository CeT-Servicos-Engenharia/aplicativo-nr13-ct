import React, { useState, useEffect } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { db } from "../../database/firebaseConfig";
import { collection, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";

const RegisterAnalyst = ({ route, navigation }) => {
  const [infoInspector, setinfoInspector] = useState({
    name: "",
    cep: "",
    address: "",
    number: "",
    neighborhood: "",
    complement: "",
    email: "",
    phone: "",
    cnpj: "",
  });

  const inspector = route.params?.inspector || null;

  useEffect(() => {
    if (inspector) {
      setinfoInspector(inspector);
    }
  }, [inspector]);

  const handleInputChange = (field, value) => {
    setinfoInspector((prevState) => ({
      ...prevState,
      [field]: value,
    }));
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
    } = infoInspector;

    try {
      if (inspector) {
        await updateDoc(doc(db, "analyst", inspector.id), {
          name,
          cep,
          address,
          number,
          neighborhood,
          complement,
          email,
          phone,
          cnpj,
        })
        Alert.alert("Sucesso", "Inspetor atualizado com sucesso!");
      } else {
        await addDoc(collection(db, "analyst"), {
          name,
          cep,
          address,
          number,
          neighborhood,
          complement,
          email,
          phone,
          cnpj,
          createdAt: serverTimestamp(),
        });

        Alert.alert("Sucesso", "Inspetor cadastrado com sucesso!");
      }
      setinfoInspector({
        name: "",
        cep: "",
        address: "",
        number: "",
        neighborhood: "",
        complement: "",
        email: "",
        phone: "",
        cnpj: "",
      });

      navigation.goBack();
    } catch (error) {
      console.error("Erro ao registrar analista: ", error);
      Alert.alert("Erro", "Falha ao registrar o analista. Tente novamente.");
    }
  };

  return (
    <View style={styles.containerRegisterClients}>
      <ScrollView>
        <TextInput
          style={styles.textAreas}
          placeholder="Nome"
          value={infoInspector.name}
          onChangeText={(text) => handleInputChange("name", text)}
        />
        <TextInput
          style={styles.textAreas}
          placeholder="CEP"
          value={infoInspector.cep}
          onChangeText={(text) => handleInputChange("cep", text)}
        />
        <TextInput
          style={styles.textAreas}
          placeholder="Endereço"
          value={infoInspector.address}
          onChangeText={(text) => handleInputChange("address", text)}
        />
        <TextInput
          style={styles.textAreas}
          placeholder="Número"
          value={infoInspector.number}
          onChangeText={(text) => handleInputChange("number", text)}
        />
        <TextInput
          style={styles.textAreas}
          placeholder="Bairro"
          value={infoInspector.neighborhood}
          onChangeText={(text) => handleInputChange("neighborhood", text)}
        />
        <TextInput
          style={styles.textAreas}
          placeholder="Complemento"
          value={infoInspector.complement}
          onChangeText={(text) => handleInputChange("complement", text)}
        />
        <TextInput
          style={styles.textAreas}
          placeholder="E-mail"
          value={infoInspector.email}
          onChangeText={(text) => handleInputChange("email", text)}
        />
        <TextInput
          style={styles.textAreas}
          placeholder="Telefone"
          value={infoInspector.phone}
          onChangeText={(text) => handleInputChange("phone", text)}
        />
        <TextInput
          style={styles.textAreas}
          placeholder="CNPJ/CPF"
          value={infoInspector.cnpj}
          onChangeText={(text) => handleInputChange("cnpj", text)}
        />
      </ScrollView>

      <Pressable style={styles.addClient} onPress={() => register()}>
        <Text style={styles.addClientText}>Cadastrar analista</Text>
        <AntDesign name="plus" size={24} color="white" />
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
});

export default RegisterAnalyst;
