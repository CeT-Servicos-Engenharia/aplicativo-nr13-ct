import { StyleSheet, Text, View, TextInput } from "react-native";
import React from "react";

const ThicknessRegistered = ({ medidas, atualizarValorMedida, lado }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
      }}
    >
      {medidas.map((medida, index) => (
        <View
          key={index}
          style={{
            width: "27%",
            padding: 10,
            margin: 2,
            backgroundColor: "#e0f2fe",
            borderColor: "#71717a",
            borderWidth: 1,
            borderRadius: 5,
            marginBottom: 10,
          }}
        >
          <View style={styles.containerlineInformationMedidas}>
            <Text>{medida.titulo || `P ${index + 1}`}</Text>
            <TextInput
              style={styles.inputMedida}
              placeholder="(mm)"
              keyboardType="decimal-pad"
              value={medida.valor?.toString() || ""}
              onChangeText={(valor) => {
                const valorNumerico = valor.replace(/[^0-9.]/g, "");
                atualizarValorMedida(lado, medida.id, valorNumerico);
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

export default ThicknessRegistered;

const styles = StyleSheet.create({});
