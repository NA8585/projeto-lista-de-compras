import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { X, Camera, FlipHorizontal, Zap } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { router, useLocalSearchParams } from 'expo-router';
import { StorageService } from '@/services/storage';
import { ParserService } from '@/services/parser';

export default function CameraScreen() {
  const { colors } = useTheme();
  const { itemId } = useLocalSearchParams();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const updatePriceAndReturn = async (priceString: string) => {
    if (!itemId) {
      router.back();
      return;
    }

    const price = parseFloat(priceString.replace(',', '.'));

    try {
      const lists = await StorageService.getLists();
      const list = lists.find(l => l.items.some(i => i.id === itemId));

      if (list) {
        const idx = list.items.findIndex(i => i.id === itemId);
        if (idx >= 0) {
          list.items[idx].scannedPrice = price;
          list.totalPrice = ParserService.calculateTotal(list.items);
          await StorageService.saveList(list);
          router.replace(`/list/${list.id}`);
          return;
        }
      }
    } catch (err) {
      console.error('Error updating scanned price:', err);
    }

    router.back();
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Camera size={64} color={colors.muted} />
          <Text style={styles.permissionTitle}>
            Acesso à Câmera Necessário
          </Text>
          <Text style={styles.permissionText}>
            Para escanear códigos de barras e capturar preços, precisamos acessar sua câmera.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>
              Permitir Acesso
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (isScanning) return;
    
    setIsScanning(true);
    
    // Simulate price detection
    const simulatedPrice = (Math.random() * 50 + 5).toFixed(2);
    
    Alert.alert(
      'Código Escaneado!',
      `Código: ${data}\nPreço detectado: R$ ${simulatedPrice}`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => setIsScanning(false),
        },
        {
          text: 'Confirmar',
          onPress: () => updatePriceAndReturn(simulatedPrice),
        },
      ]
    );
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;
    
    try {
      setIsScanning(true);
      
      // Simulate OCR price detection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const simulatedPrice = (Math.random() * 50 + 5).toFixed(2);
      
      Alert.alert(
        'Preço Detectado!',
        `Preço encontrado: R$ ${simulatedPrice}`,
        [
          {
            text: 'Tentar Novamente',
            style: 'cancel',
            onPress: () => setIsScanning(false),
          },
          {
            text: 'Confirmar',
            onPress: () => updatePriceAndReturn(simulatedPrice),
          },
        ]
      );
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Erro', 'Não foi possível capturar a imagem.');
      setIsScanning(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <X size={24} color="white" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Scanner de Preços</Text>
        
        <TouchableOpacity
          style={styles.flipButton}
          onPress={toggleCameraFacing}
        >
          <FlipHorizontal size={24} color="white" />
        </TouchableOpacity>
      </View>

      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={styles.scanCorner} />
            <View style={[styles.scanCorner, styles.scanCornerTopRight]} />
            <View style={[styles.scanCorner, styles.scanCornerBottomLeft]} />
            <View style={[styles.scanCorner, styles.scanCornerBottomRight]} />
          </View>
          
          <Text style={styles.instructionText}>
            Posicione o código de barras ou preço dentro da área
          </Text>
        </View>
      </CameraView>

      <View style={styles.controls}>
        <View style={styles.controlsRow}>
          <View style={styles.controlButton} />
          
          <TouchableOpacity
            style={[styles.captureButton, isScanning && styles.captureButtonDisabled]}
            onPress={takePicture}
            disabled={isScanning}
          >
            {isScanning ? (
              <Zap size={32} color="white" />
            ) : (
              <Camera size={32} color="white" />
            )}
          </TouchableOpacity>
          
          <View style={styles.controlButton} />
        </View>
        
        <Text style={styles.controlsText}>
          {isScanning ? 'Processando...' : 'Toque para capturar preço'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.control,
  },
  permissionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
  },
  permissionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  flipButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  scanCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.primary,
    borderWidth: 3,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    top: 0,
    left: 0,
  },
  scanCornerTopRight: {
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    top: 0,
    right: 0,
    left: 'auto',
  },
  scanCornerBottomLeft: {
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderTopWidth: 0,
    borderRightWidth: 0,
    bottom: 0,
    left: 0,
    top: 'auto',
  },
  scanCornerBottomRight: {
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
  },
  instructionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'white',
    textAlign: 'center',
    marginTop: 32,
    paddingHorizontal: 32,
  },
  controls: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  controlButton: {
    width: 60,
    height: 60,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  captureButtonDisabled: {
    backgroundColor: colors.muted,
    shadowOpacity: 0,
    elevation: 0,
  },
  controlsText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'white',
    textAlign: 'center',
  },
});