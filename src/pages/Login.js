import React, { useState, useEffect } from 'react';
import { Button, Text, TextInput, View, StyleSheet, Image, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from "../../database/firebaseConfig";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = ({ navigation, setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Verificar login offline ao abrir o app
  useEffect(() => {
    checkOfflineLogin();
  }, []);

  const checkOfflineLogin = async () => {
    try {
      const userUID = await AsyncStorage.getItem('userUID');
      if (userUID) {
        console.log("Usuário autenticado offline!");
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Erro ao recuperar sessão offline:", error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Salvar UID localmente para login offline
      await AsyncStorage.setItem('userUID', user.uid);
      await AsyncStorage.setItem('userEmail', email);

      Alert.alert('Sucesso', 'Login realizado com sucesso!');
      setIsAuthenticated(true);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível realizar o login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert('Erro', 'Por favor, insira seu e-mail para redefinir a senha.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Sucesso', 'Um e-mail para redefinição de senha foi enviado.');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível enviar o e-mail de redefinição de senha.');
    }
  };

  return (
    <LinearGradient colors={['#3b4d84', '#5587b6']} style={styles.container}>
      <View style={styles.container}>
        <Image source={require(`../../assets/LOGO CET BRANCO.png`)} style={styles.logoImage} />
        <View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="exemplo@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType='email-address'
              style={styles.input}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              placeholder="Senha"
              value={password}
              secureTextEntry={true}
              onChangeText={setPassword}
              style={styles.input}
            />
          </View>
          <View style={styles.buttonGroup}>
            <Pressable style={styles.buttonLogin} onPress={handleLogin} disabled={loading}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'semibold' }}>
                {loading ? "Carregando..." : "Entrar"}
              </Text>
            </Pressable>

            <Pressable style={styles.buttonLogin} onPress={handlePasswordReset}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'semibold' }}>Esqueceu sua senha?</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  logoImage: {
    width: 'auto',
    height: 300,
    resizeMode: 'center'
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#fff"
  },
  input: {
    borderWidth: 1,
    borderColor: '#fff',
    padding: 10,
    borderRadius: 5,
    color: "#fff"
  },
  buttonGroup: {
    marginBottom: 15,
  },
  buttonLogin: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginHorizontal: 2,
    marginVertical: 10,
    backgroundColor: '#1d4ed8',
    borderRadius: 5,
    alignItems: 'center',

  },
  socialGroup: {
    alignItems: 'center',
    marginTop: 20,
  },
});

export default Login;