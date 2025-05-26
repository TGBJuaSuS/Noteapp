import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getDatabase, ref, get, set, onValue, off } from 'firebase/database';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDa8GFHqOlz9TgCXmJaQFx5Yqv1Yk5cqak",
  authDomain: "note-edd78.firebaseapp.com",
  databaseURL: "https://note-edd78-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "note-edd78",
  storageBucket: "note-edd78.appspot.com",
  messagingSenderId: "444907325879",
  appId: "1:444907325879:web:6950a479341cfb08e7c032",
  measurementId: "G-HHDCEYWMNQ"
};

// Khởi tạo Firebase app
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Khởi tạo Analytics (chỉ trên web)
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  });
}

// Thêm ghi chú mới
export async function addNote(userId: string, noteId: string, title: string, content: string): Promise<boolean> {
  const timestamp = Date.now();
  const noteData = {
    id: noteId,
    title,
    content,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  try {
    await set(ref(db, `notes/${userId}/${noteId}`), noteData);
    return true;
  } catch (error) {
    console.error('Lỗi khi lưu ghi chú:', error);
    return false;
  }
}

// Lưu/Sửa ghi chú (giữ nguyên createdAt nếu có)
export async function saveNote(userId: string, noteId: string, title: string, content: string) {
  const noteRef = ref(db, `notes/${userId}/${noteId}`);
  const snapshot = await get(noteRef);
  const oldData = snapshot.val();

  const noteData = {
    id: noteId,
    title,
    content,
    createdAt: oldData?.createdAt || Date.now(),
    updatedAt: Date.now(),
  };

  return set(noteRef, noteData);
}

// Theo dõi realtime ghi chú (và trả về hàm unsubscribe)
export function subscribeToNotes(userId: string, callback: (notes: any[]) => void): () => void {
  const notesRef = ref(db, `notes/${userId}`);

  const handleValueChange = (snapshot: any) => {
    const data = snapshot.val();

    if (!data) {
      const sampleNote = {
        id: 'sample-note-id',
        title: 'Ghi chú mẫu',
        content: 'Nội dung của ghi chú mẫu.',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      set(ref(db, `notes/${userId}/sample-note-id`), sampleNote)
        .then(() => {
          callback([sampleNote]);
        })
        .catch((error) => {
          console.error('Lỗi khi tạo ghi chú mẫu:', error);
          callback([]);
        });
    } else {
      const notes = Object.values(data).sort((a: any, b: any) => b.createdAt - a.createdAt);
      callback(notes);
    }
  };

  onValue(notesRef, handleValueChange, (error) => {
    console.error('Lỗi kết nối Firebase:', error);
    callback([]);
  });

  // Trả về hàm hủy lắng nghe (unsubscribe)
  return () => off(notesRef, 'value', handleValueChange);
}

// Xóa ghi chú
export function deleteNote(userId: string, noteId: string) {
  return set(ref(db, `notes/${userId}/${noteId}`), null);
}

// Đăng ký người dùng
export async function registerUser(email: string, password: string): Promise<{ uid: string } | null> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userData = {
      uid: user.uid,
      email: user.email,
      createdAt: Date.now(),
    };

    await set(ref(db, `users/${user.uid}`), userData);
    console.log('Đăng ký thành công:', user.uid);
    return { uid: user.uid };
  } catch (error: any) {
    console.error('Lỗi khi đăng ký:', error.message);
    return null;
  }
}

// Đăng nhập người dùng
export async function loginUser(email: string, password: string): Promise<{ uid: string } | null> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await AsyncStorage.setItem('uid', user.uid);
    console.log('Đăng nhập thành công:', user.uid);
    return { uid: user.uid };
  } catch (error: any) {
    console.error('Lỗi khi đăng nhập:', error.message);
    return null;
  }
}
