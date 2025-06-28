import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { Mic, MicOff } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence,
  Easing
} from 'react-native-reanimated';
import { VoiceService } from '@/services/voice';
import { VoiceRecognitionResult } from '@/types';

interface VoiceButtonProps {
  onResult: (result: VoiceRecognitionResult) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export default function VoiceButton({ onResult, onError, disabled }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const startListening = async () => {
    if (disabled || isListening) return;

    try {
      const hasPermission = await VoiceService.requestPermissions();
      if (!hasPermission) {
        onError('Permissão de microfone necessária');
        return;
      }

      setIsListening(true);
      
      // Start pulsing animation
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        false
      );

      const result = await VoiceService.startListening();
      onResult(result);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Erro no reconhecimento de voz');
    } finally {
      setIsListening(false);
      scale.value = withTiming(1);
      opacity.value = withTiming(1);
    }
  };

  const stopListening = () => {
    if (!isListening) return;
    
    VoiceService.stopListening();
    setIsListening(false);
    scale.value = withTiming(1);
    opacity.value = withTiming(1);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[animatedStyle]}>
        <TouchableOpacity
          style={[
            styles.button,
            isListening && styles.buttonListening,
            disabled && styles.buttonDisabled,
          ]}
          onPress={isListening ? stopListening : startListening}
          disabled={disabled}
          activeOpacity={0.8}
        >
          {isListening ? (
            <View style={styles.listeningContent}>
              <MicOff size={28} color="white" />
              <ActivityIndicator size="small" color="white" style={styles.spinner} />
            </View>
          ) : (
            <Mic size={28} color={disabled ? '#C7C7CC' : 'white'} />
          )}
        </TouchableOpacity>
      </Animated.View>
      
      <Text style={[styles.label, disabled && styles.labelDisabled]}>
        {isListening ? 'Ouvindo...' : 'Toque para falar'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonListening: {
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
  },
  buttonDisabled: {
    backgroundColor: '#F2F2F7',
    shadowOpacity: 0,
    elevation: 0,
  },
  listeningContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  label: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  labelDisabled: {
    color: '#C7C7CC',
  },
});