import * as Speech from 'expo-speech';
import { Platform, Alert } from 'react-native';
import { Audio } from 'expo-av';
import Voice from '@react-native-voice/voice';
import { VoiceRecognitionResult } from '@/types';

export class VoiceService {
  private static isListening = false;
  private static recognition: any = null;
  /** Timeout handler for the simulated speech recognition */
  private static recognitionTimeout: ReturnType<typeof setTimeout> | null = null;

  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      try {
        // Web Speech API
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
          throw new Error('Speech recognition not supported');
        }
        return true;
      } catch (error) {
        console.error('Speech recognition not available:', error);
        return false;
      }
    }

    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  }

  static async startListening(): Promise<VoiceRecognitionResult> {
    if (this.isListening) {
      throw new Error('Already listening');
    }

    if (Platform.OS === 'web') {
      return new Promise((resolve, reject) => {
        this.startWebSpeechRecognition(resolve, reject);
      });
    }

    if (!Voice.start) {
      Alert.alert(
        'Reconhecimento não disponível',
        'Instale a versão Dev do app para usar voz no celular.'
      );
      throw new Error('Voice not available');
    }

    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permissão negada');
    }

    return new Promise((resolve, reject) => {
      Voice.onSpeechResults = e => {
        this.isListening = false;
        resolve({ text: e.value?.[0] ?? '', confidence: 1 });
      };
      Voice.onSpeechError = err => {
        this.isListening = false;
        reject(new Error(err.error ?? 'Erro de voz'));
      };
      this.isListening = true;
      Voice.start('pt-BR');
    });
  }

  private static startWebSpeechRecognition(
    resolve: (result: VoiceRecognitionResult) => void,
    reject: (error: Error) => void
  ) {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.lang = 'pt-BR';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event: any) => {
        const result = event.results[0][0];
        resolve({
          text: result.transcript,
          confidence: result.confidence,
        });
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.start();
    } catch (error) {
      reject(error as Error);
    }
  }

  private static simulateSpeechRecognition(
    resolve: (result: VoiceRecognitionResult) => void,
    reject: (error: Error) => void
  ) {
    this.isListening = true;

    // Simulate listening for 3 seconds
    this.recognitionTimeout = setTimeout(() => {
      this.isListening = false;

      // Simulate some common shopping list items
      const sampleTexts = [
        'arroz, feijão, açúcar e leite',
        'pão, manteiga, presunto e queijo',
        'maçã, banana, laranja e uva',
        'detergente, sabão em pó e amaciante',
        'frango, carne moída e linguiça'
      ];
      
      const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
      
      resolve({
        text: randomText,
        confidence: 0.95,
      });
    }, 3000);
  }

  static stopListening(): void {
    if (this.recognition && Platform.OS === 'web') {
      this.recognition.stop();
    }
    if (Voice.stop) {
      Voice.stop();
    }
    if (this.recognitionTimeout) {
      clearTimeout(this.recognitionTimeout);
      this.recognitionTimeout = null;
    }
    this.isListening = false;
  }

  static isCurrentlyListening(): boolean {
    return this.isListening;
  }

  static speak(text: string): void {
    Speech.speak(text, {
      language: 'pt-BR',
      pitch: 1.0,
      rate: 0.9,
    });
  }
}