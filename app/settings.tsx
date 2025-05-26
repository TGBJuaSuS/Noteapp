import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const [selectedFont, setSelectedFont] = useState<string>('System');

  useFocusEffect(
    React.useCallback(() => {
      const fetchFont = async () => {
        const font = await AsyncStorage.getItem('ui:selectedFont');
        if (font) setSelectedFont(font);
        else setSelectedFont('System');
      };
      fetchFont();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.title, selectedFont !== 'System' ? { fontFamily: selectedFont } : {}]}>
        Cài đặt
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/font')}
      >
        <Text style={[styles.buttonText, selectedFont !== 'System' ? { fontFamily: selectedFont } : {}]}>
          Thay đổi font chữ
        </Text>
      </TouchableOpacity>

      <Text style={[styles.title, selectedFont !== 'System' ? { fontFamily: selectedFont } : {}]}>
        Tài Khoản
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/login')}
      >
        <Text style={[styles.buttonText, selectedFont !== 'System' ? { fontFamily: selectedFont } : {}]}>
          Đăng Xuất
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 32,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4a90e2',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
