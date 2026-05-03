import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { useAppStore } from '../storage/useAppStore';

interface QuranTextProps {
  children: string;
  style?: TextStyle;
  isAyahNumber?: boolean;
}

export const QuranText: React.FC<QuranTextProps> = ({ children, style, isAyahNumber }) => {
  const fontSize = useAppStore((state) => state.fontSize);
  
  return (
    <Text 
      style={[
        styles.text, 
        { fontSize: isAyahNumber ? fontSize * 0.6 : fontSize }, 
        style
      ]}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Amiri-Regular',
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 50,
  },
});
