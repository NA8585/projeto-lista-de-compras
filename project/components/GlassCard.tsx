import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useThemeSpec } from '@/theme/useTheme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  checked?: boolean;
}

export function GlassCard({ children, style, checked }: Props) {
  const { card, border, shadow } = useThemeSpec();

  return (
    <BlurView
      intensity={40}
      tint="default"
      style={[
        styles.blur,
        style,
        {
          backgroundColor: card,
          borderColor: border,
          shadowColor: shadow,
          opacity: checked ? 0.5 : 1,
        },
      ]}
    >
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blur: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
});
