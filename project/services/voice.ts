import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
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
    
    // For mobile platforms, permissions are handled by expo-speech
    return true;
  }

  static async startListening(): Promise<VoiceRecognitionResult> {
    return new Promise((resolve, reject) => {
      if (this.isListening) {
        reject(new Error('Already listening'));
        return;
      }

      if (Platform.OS === 'web') {
        this.startWebSpeechRecognition(resolve, reject);
      } else {
        // For mobile, we'll simulate speech recognition for demo purposes
        // In a real app, you'd integrate with a proper speech recognition service
        this.simulateSpeechRecognition(resolve, reject);
      }
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