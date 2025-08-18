import React, { useEffect, useState } from "react";
import {
  View,
  Modal,
  Text,
  TextInput,
  Platform,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const PerformingHydrostaticTest = ({
  visible,
  setModalVisible,
  content,
  onSave
}) => {
  const [testDate, setTestDate] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [performingTestData, setPerformingTestData] = useState(content || {});

  useEffect(() => {
    if (content) {
      setPerformingTestData(content);
    } else {
      setPerformingTestData({
        component: "",
        testPressure: "",
        fluid: "",
        fluidTemp: "",
        metalTemp: "",
        testDuration: "",
        testDate: "",
      });
    }
  }, [content]);

  const handleFieldChange = (field, value) => {
    setPerformingTestData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
    console.log(`Campo atualizado - ${field}:`, value);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    const formattedDate = `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;
    setTestDate(formattedDate);
    hideDatePicker();
  };

  const handleSave = () => {
    const updatedData = {
      ...performingTestData,
      testDate: testDate || performingTestData.testDate, // Garantir que a data está salva
    };

    console.log("Dados do teste antes de salvar:", updatedData);
    onSave(updatedData);
    setPerformingTestData({
      component: "",
      testPressure: "",
      fluid: "",
      fluidTemp: "",
      metalTemp: "",
      testDuration: "",
      testDate: "",
    });
    setTestDate("");
  };


  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => setModalVisible(false)}
    >

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />

      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.headerModal}>
            <Text style={styles.titleModal}>Execução do Teste</Text>
            <Pressable
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <AntDesign name="closecircle" size={24} color="red" />
            </Pressable>
          </View>

          <TextInput
            style={styles.textAreas}
            placeholder="Componente"
            value={performingTestData.component}
            onChangeText={(value) => handleFieldChange('component', value)}
          />

          <TextInput
            style={styles.textAreas}
            placeholder="Pressão do teste"
            keyboardType="decimal-pad"
            value={performingTestData.testPressure}
            onChangeText={(value) => handleFieldChange('testPressure', value)}
          />

          <TextInput
            style={styles.textAreas}
            placeholder="Fluído"
            value={performingTestData.fluid}
            onChangeText={(value) => handleFieldChange('fluid', value)}
          />

          <TextInput
            style={styles.textAreas}
            placeholder="Temperatura do fluido (°C)"
            keyboardType="decimal-pad"
            value={performingTestData.fluidTemp}
            onChangeText={(value) => handleFieldChange('fluidTemp', value)}
          />

          <TextInput
            style={styles.textAreas}
            placeholder="Temperatura do metal (°C)"
            keyboardType="decimal-pad"
            value={performingTestData.metalTemp}
            onChangeText={(value) => handleFieldChange('metalTemp', value)}
          />

          <TextInput
            style={styles.textAreas}
            placeholder="Duração do teste (min)"
            keyboardType="decimal-pad"
            value={performingTestData.testDuration}
            onChangeText={(value) => handleFieldChange('testDuration', value)}
          />

          {Platform.OS === "web" ? (
            <View style={{ width: "85%" }}>
              <Text style={{ marginBottom: 5 }}>Data do teste</Text>
              <input
                type="date"
                onChange={(e) => setTestDate(e.target.value)}
                style={{
                  padding: 10,
                  borderRadius: 5,
                  border: "1px solid #ccc",
                  width: "100%",
                }}
              />
            </View>
          ) : (
            <View style={{ width: "100%" }}>
              <Pressable
                onPress={showDatePicker}
                style={styles.inputDatePicker}
              >
                <Text style={{ color: "white" }}>
                  Data do teste
                </Text>
                <AntDesign name="calendar" size={24} color="white" />
              </Pressable>
              <Text>
                {testDate
                  ? `Início: ${testDate}`
                  : "Selecione a data de início"}
              </Text>
            </View>
          )}
          <Pressable style={styles.registerBocal} onPress={handleSave}>
            <Text style={styles.registerBocalText}> Registrar Teste</Text>
            <AntDesign name="plus" size={24} color="white" />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainerInternal: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    margin: 20,
    width: "80%",
    alignItems: "center",
  },
  headerModal: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  closeModal: {
    padding: 10,
  },
  titleModal: {
    fontSize: 20,
    fontWeight: "bold",
  },
  textInputModalSearch: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    width: "100%",
    marginVertical: 10,
  },
  lineClientsInOpen: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  addClientModal: {
    backgroundColor: "#007BFF",
    borderRadius: 5,
    padding: 10,
    width: "100%",
    marginVertical: 10,
    alignItems: "center",
  },
  textAreas: {
    width: '100%',
    borderColor: 'gray',
    borderBottomWidth: 1,
    marginBottom: 5,
    paddingVertical: 10,
    borderRadius: 5,
  },
  inputDatePicker: {
    flexDirection: 'row',
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#1d4ed8',
  },
  registerBocal: {
    backgroundColor: '#1d4ed8',
    width: '100%',
    margin: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  registerBocalText: {
    color: '#fff'
  },
})

export default PerformingHydrostaticTest;