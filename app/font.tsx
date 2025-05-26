import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

import RNPickerSelect from 'react-native-picker-select';

//KHAI BÁO FONT Ở ĐÂY
const FONT_FILES = [
  { name: 'SpaceMono-Regular', file: require('../assets/fonts/SpaceMono-Regular.ttf') },
  { name: 'Oswald-VariableFont', file: require('../assets/fonts/Oswald/Oswald-VariableFont_wght.ttf') },
  { name: 'DancingScript-VariableFont', file: require('../assets/fonts/Dancing_Script/DancingScript-VariableFont_wght.ttf') },
  { name: 'times', file: require('../assets/fonts/times.ttf') },
];

export default function FontScreen() {
  const [fontNames, setFontNames] = useState<string[]>([]);
  const [selectedFont, setSelectedFont] = useState<string>('System');
  const [loading, setLoading] = useState(true);

  /** Nạp font */
  const loadFonts = useCallback(async () => {
    try {
      const fontMap: Record<string, any> = {};
      FONT_FILES.forEach(({ name, file }) => (fontMap[name] = file));
      await Font.loadAsync(fontMap);
      setFontNames(FONT_FILES.map((f) => f.name));
      const saved = await AsyncStorage.getItem('ui:selectedFont');
      if (saved && fontMap[saved]) setSelectedFont(saved);
    } catch (err) {
      console.warn('[FontScreen] Failed to load fonts', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFonts();
  }, [loadFonts]);

  const onApply = async () => {
    await AsyncStorage.setItem('ui:selectedFont', selectedFont);
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16, fontSize: 16 }}>Đang tải phông chữ…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Combobox */}
      <View>
        <Text style={styles.title}>Chọn phông chữ</Text>
        <RNPickerSelect
          onValueChange={(v) => v && setSelectedFont(v)}
          value={selectedFont !== 'System' ? selectedFont : null}
          placeholder={{ label: 'Chọn phông chữ', value: null }}
          items={fontNames.map((n) => ({ label: n, value: n }))}
          style={pickerSelectStyles}
          useNativeAndroidPickerStyle={false}
        />
      </View>

      {/* Preview */}
      <Card>
        <View style={styles.cardContent}>
          <Text
            style={[
              styles.previewLarge,
              { fontFamily: selectedFont !== 'System' ? selectedFont : undefined },
            ]}
          >
            AaBbCc DdEeFf 123
          </Text>
          <Text
            style={[
              styles.previewSmall,
              { fontFamily: selectedFont !== 'System' ? selectedFont : undefined },
            ]}
          >
            Mẫu Font chữ
          </Text>
        </View>
      </Card>

      {/* Apply */}
      <Button onPress={onApply} title="Áp dụng" />
    </ScrollView>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function Button({ onPress, title }: { onPress: () => void; title: string }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { marginBottom: 8, fontSize: 20, fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    padding: 20,
  },
  cardContent: { alignItems: 'center', justifyContent: 'center' },
  previewLarge: { fontSize: 28, lineHeight: 36 },
  previewSmall: { fontSize: 16, marginTop: 8, opacity: 0.6 },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontSize: 18, fontWeight: '600' },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'gray',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
  },
});
