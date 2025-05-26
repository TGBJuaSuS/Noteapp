import { useRouter } from 'expo-router';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  ImageBackground,
} from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { subscribeToNotes, deleteNote } from '../../save/filebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [notes, setNotes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedFont, setSelectedFont] = useState<string | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      const storedUid = await AsyncStorage.getItem('uid');

      if (!storedUid) {
        router.replace('/login');
        return;
      }

      setUserId(storedUid);

      // Lấy font đã chọn
      const font = await AsyncStorage.getItem('ui:selectedFont');
      setSelectedFont(font || undefined);

      // Gọi subscribe và nhận hàm hủy
      unsubscribe = subscribeToNotes(storedUid, (fetchedNotes) => {
        setNotes(fetchedNotes);
      });
    };

    init();

    // Cleanup
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleDelete = (noteId: string) => {
    if (!userId) return;

    Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa ghi chú này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => deleteNote(userId, noteId),
      },
    ]);
  };

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!userId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontFamily: selectedFont && selectedFont !== 'System' ? selectedFont : undefined }}>
          Đang tải dữ liệu...
        </Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/images/hn1.jpg')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={{ flex: 1, padding: 16 }}>
        {/* Thanh tìm kiếm */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: 60,
            backgroundColor: '#C0C0C0',
            borderWidth: 1,
            borderRadius: 8,
            marginTop: 10,
            marginBottom: 5,
          }}
        >
          <TouchableOpacity style={{ marginLeft: 12, marginRight: 12 }}>
            <Ionicons name="menu" size={28} color="#333" />
          </TouchableOpacity>

          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#f2f2f2',
              borderRadius: 25,
              paddingHorizontal: 12,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                color: '#454343',
                height: 40,
                fontFamily: selectedFont && selectedFont !== 'System' ? selectedFont : undefined,
              }}
              placeholder="Tìm kiếm..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Ionicons name="search" size={20} color="#888" />
          </View>

          <TouchableOpacity
            style={{ marginLeft: 12, marginRight: 12 }}
            onPress={() => router.push('/settings')}
          >
            <Ionicons name="settings" size={26} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Danh sách ghi chú */}
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: '#f2f2f2',
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#ccc',
                marginBottom: 12,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() =>
                  router.push({ pathname: '../note/[id]', params: { id: item.id } })
                }
              >
                <Text
                  style={{
                    fontSize: 18,
                    
                    fontFamily: selectedFont && selectedFont !== '../assets/fonts/SpaceMono-Regular.ttf' ? selectedFont : undefined,
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: selectedFont && selectedFont !== 'System' ? selectedFont : undefined,
                  }}
                >
                  {item.content}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#666',
                    fontFamily: selectedFont && selectedFont !== 'System' ? selectedFont : undefined,
                  }}
                >
                  Tạo: {new Date(item.createdAt).toLocaleString()}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#666',
                    fontFamily: selectedFont && selectedFont !== 'System' ? selectedFont : undefined,
                  }}
                >
                  Cập nhật: {new Date(item.updatedAt).toLocaleString()}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ marginLeft: 12 }}>
                <Ionicons name="trash" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          )}
        />

        {/* Nút thêm */}
        <TouchableOpacity
          onPress={() => router.push('../note/new')}
          style={{
            position: 'absolute',
            bottom: 24,
            right: 24,
            backgroundColor: '#007AFF',
            width: 60,
            height: 60,
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}
