import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Modal } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

const CommentModal = ({ visble, onClose, comment, setComment, saveComment }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visble}
      onRequestClose={onClose}
    >
      <View style={styles.commentModalContent}>
        <View style={{ backgroundColor: '#fff', alignItems: 'center', width: '90%', paddingVertical: 20, borderRadius: 10 }}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <AntDesign name="closecircle" size={28} color="red" />
          </Pressable>
          <Text style={{ fontSize: 18, marginBottom: 15, fontWeight: 'bold' }}>Adicionar Comentário</Text>
          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder="Adicionar comentário"
            multiline={true}
          />
          <Pressable onPress={saveComment} style={styles.saveCommentButton}>
            <Text style={styles.saveCommentButtonText}>Salvar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}
const styles = StyleSheet.create({
  commentModalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10
  },
  modalContainer: {
    backgroundColor: '#fff',
    alignItems: 'center',
    width: '90%',
    paddingVertical: 20,
    borderRadius: 10
  },
  title: {
    fontSize: 18,
    marginBottom: 15
  },
  commentInput: {
    width: '90%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20
  },
  saveCommentButton: {
    backgroundColor: '#1d4ed8',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5
  },
  saveCommentButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default CommentModal;