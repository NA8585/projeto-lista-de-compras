import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useThemeSpec } from '@/theme/useTheme';

export default function FundoComGradiente({ children }: { children: React.ReactNode }) {
  const { background, shapeA, shapeB } = useThemeSpec();

  return (
    <LinearGradient colors={background} style={{ flex: 1 }}>
      <BlurView
        intensity={50}
        tint="default"
        style={{
          position: 'absolute',
          top: -80,
          left: -60,
          width: 280,
          height: 280,
          borderRadius: 140,
          backgroundColor: shapeA,
          opacity: 0.35,
        }}
      />
      <BlurView
        intensity={50}
        tint="default"
        style={{
          position: 'absolute',
          bottom: -90,
          right: -80,
          width: 320,
          height: 320,
          borderRadius: 160,
          backgroundColor: shapeB,
          opacity: 0.35,
        }}
      />
      {children}
    </LinearGradient>
  );
}
