import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Modal } from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

const ChecklistDocumentationModal = ({
  visible,
  onClose,
  checklistItemsInspection,
  checklistSelections, 
  toggleChecklistSelection,
  openModalComment,
  comments,
}) => {
  useEffect(() => {
    if (visible) {
      checklistItemsInspection.forEach((item) => {
        if (!checklistSelections[item.label]) {
          toggleChecklistSelection(item.label, 'N/A');
        }
      });
    }
  }, [visible, checklistItemsInspection]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <ScrollView>
        <View style={styles.modalContent}>
          <View style={{ backgroundColor: "#f0f0f0", borderRadius: 5 }}>
            <Pressable style={{ flexDirection: 'row-reverse', padding: 10, marginBottom: -30 }} onPress={onClose}>
              <AntDesign name="closecircle" size={28} color="red" />
            </Pressable>
            {checklistItemsInspection.map((item) => (
              <View key={item.id} style={styles.checklistItem}>
                <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>{item.label}</Text>
                <View style={styles.buttonContainer}>
                  {['Não Existe', 'Parcial', 'Completa', 'N/A'].map((status) => (
                    <Pressable
                      key={status}
                      style={[
                        styles.button,
                        checklistSelections[item.label] === status && styles.selectedButton,
                      ]}
                      onPress={() => toggleChecklistSelection(item.label, status)}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          checklistSelections[item.label] === status && styles.selectedButtonText,
                        ]}
                      >
                        {status}
                      </Text>
                    </Pressable>
                  ))}
                  <Pressable onPress={() => openModalComment(item.id)}>
                    <MaterialIcons name="comment" size={24} color="gray" />
                  </Pressable>
                </View>
                {comments[item.id] && (
                  <View>
                    <Text style={styles.commentText}>Comentário: {comments[item.id]}</Text>
                  </View>
                )}
                <View style={{ width: '100%', height: 1, backgroundColor: '#e0e0e0' }} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};


const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    padding: 10,
  },
  checklistItem: {
    marginVertical: 15,
    marginBottom: 15,
    marginHorizontal: 10
  },
  itemLabel: {
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold'
  },
  button: {
    marginVertical: 10,
    marginHorizontal: 2,
    padding: 10,
    paddingHorizontal: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  selectedButton: {
    backgroundColor: '#1d4ed8',
  },
  buttonText: {
    color: '#000',
  },
  selectedButtonText: {
    color: '#fff',
  },
  commentText: {
    marginTop: 10,
    fontStyle: 'italic',
    color: '#555',
  },
});

export default ChecklistDocumentationModal;