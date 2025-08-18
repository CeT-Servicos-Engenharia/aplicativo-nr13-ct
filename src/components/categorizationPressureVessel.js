import React from 'react'
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import AntDesign from "@expo/vector-icons/AntDesign";

const CategorizationPressureVessel = () => {
  return (
    <View style={styles.containerCategorizacao}>
    <Text style={styles.title}>Categorização Vaso de Pressão</Text>

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

    <Text>PMTA: {categoryBoiler}</Text>
  </View>
  )
}

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
    height: 100,
    marginRight: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: "cover",
    marginTop: 10,
  },
  imageText: {
    marginTop: 10,
    textAlign: "center",
  },
  infosEquipments: {
    flex: 1,
    overflow: Platform.OS === "web" ? "auto" : "hidden",
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
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
  },
  dropdownTypeValue: {
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
    width: "72%",
    borderWidth: 1,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 10,
    borderRadius: 5,
  },
  inputContainerWhithInfoInFinal: {
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
});

export default CategorizationPressureVessel