import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, TextInput, Button, ActivityIndicator, Alert, ImageBackground, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState, useLayoutEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { saveNote } from '../../save/filebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NoteDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedFont, setSelectedFont] = useState<string | undefined>(undefined);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    if (id) {
      navigation.setOptions({
        title: `${id}`,
      });
    }
  }, [id]);


  useEffect(() => {
    const fetchNote = async () => {
      const uid = await AsyncStorage.getItem('uid');
      if (!uid) {
        Alert.alert('Lỗi', 'Không tìm thấy người dùng!');
        router.replace('/');
        return;
      }

      setUserId(uid);

      // Lấy font đã chọn lưu trong AsyncStorage
      const font = await AsyncStorage.getItem('ui:selectedFont');
      setSelectedFont(font || undefined);

      const db = getDatabase();
      const noteRef = ref(db, `notes/${uid}/${id}`);

      const unsubscribe = onValue(noteRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setTitle(data.title);
          setContent(data.content);
        } else {
          Alert.alert('Không tìm thấy ghi chú!');
          router.back();
        }
        setLoading(false);
      });

      return () => unsubscribe();
    };

    fetchNote();
  }, [id]);

  const handleSave = async () => {
    if (!userId) return;

    await saveNote(userId, id as string, title, content);
    router.back();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ImageBackground source={require('../../assets/images/hn1.jpg')} style={{ flex: 1 }} resizeMode="cover">
      <View style={{ flex: 1, padding: 16 }}>
        <TextInput
          placeholder="Tiêu đề"
          value={title}
          onChangeText={setTitle}
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 16,
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: 'white',
            fontFamily: selectedFont && selectedFont !== 'System' ? selectedFont : undefined,
          }}
        />
        <TextInput
          placeholder="Nội dung"
          value={content}
          onChangeText={setContent}
          multiline
          style={{
            fontSize: 16,
            height: 200,
            textAlignVertical: 'top',
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 8,
            marginBottom: 16,
            borderRadius: 8,
            backgroundColor: 'white',
            fontFamily: selectedFont && selectedFont !== 'System' ? selectedFont : undefined,
          }}
        />
        <Button title="Lưu thay đổi" onPress={handleSave} />
        <View style={{ height: 8 }} />
        <Button title="Quay lại" onPress={() => router.back()} color="gray" />
      </View>
    </ImageBackground>
  );
}
