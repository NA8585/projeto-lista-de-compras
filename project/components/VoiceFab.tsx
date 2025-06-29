import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useThemeSpec } from '@/theme/useTheme';
import { Feather } from '@expo/vector-icons';

export function VoiceFab({ onPress }: { onPress(): void }) {
  const { accent, border } = useThemeSpec();
  return (
    <Pressable onPress={onPress} style={{ position: 'absolute', alignSelf: 'center', bottom: 80 }}>
      <BlurView intensity={40} tint="default" style={[styles.fab, { borderColor: border }]}>
        <Feather name="mic" size={30} color={accent} />
      </BlurView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
});
