// components/ui/button.tsx
import { Pressable, Text, ViewStyle, TextStyle, StyleProp } from 'react-native';

export function Button({
  onPress,
  children,
  style,
  textStyle,
}: {
  onPress?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: '#2563eb',
          padding: 12,
          borderRadius: 8,
          opacity: pressed ? 0.8 : 1,
          alignItems: 'center',
        },
        style,
      ]}>
      <Text style={[{ color: '#fff', fontWeight: '600' }, textStyle]}>{children}</Text>
    </Pressable>
  );
}
