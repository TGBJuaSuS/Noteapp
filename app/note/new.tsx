import { View, TextInput, Button, ImageBackground, Alert } from 'react-native'; 
import { useState, useEffect } from 'react'; 
import { useRouter } from 'expo-router'; 
import { addNote } from '../../save/filebase'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NewNote() {
  const [title, setTitle] = useState(''); 
  const [content, setContent] = useState(''); 
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedFont, setSelectedFont] = useState<string | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    const fetchUserIdAndFont = async () => {
      const storedUid = await AsyncStorage.getItem('uid');
      if (!storedUid) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng!');
        router.push('/');
        return;
      }
      setUserId(storedUid);

      // Lấy font chữ đã chọn
      const font = await AsyncStorage.getItem('ui:selectedFont');
      setSelectedFont(font || undefined);
    };

    fetchUserIdAndFont();
  }, []);

  const handleSave = async () => {
    if (!title || !content) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ tiêu đề và nội dung');
      return;
    }

    if (!userId) {
      Alert.alert('Lỗi', 'Không tìm thấy người dùng');
      return;
    }

    const noteId = Date.now().toString() + Math.floor(Math.random() * 1000);
    const result = await addNote(userId, noteId, title, content);

    if (result) {
      Alert.alert('Thành công', 'Ghi chú đã được lưu');
      router.push('/(tabs)');
    } else {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi lưu ghi chú');
    }
  };

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
            marginBottom: 12,
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
            height: 120,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            marginBottom: 12,
            textAlignVertical: 'top',
            backgroundColor: 'white',
            fontFamily: selectedFont && selectedFont !== 'System' ? selectedFont : undefined,
          }}
        />
        <Button title="Lưu ghi chú" onPress={handleSave} />
      </View>
    </ImageBackground>
  );
}
