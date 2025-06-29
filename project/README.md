# ListaVox - Voice Shopping List App

Um aplicativo moderno de lista de compras com reconhecimento de voz, scanner de preços e funcionalidades premium.

## 🚀 Funcionalidades

### Gratuito
- ✅ 30 comandos de voz por mês
- ✅ Até 3 listas de compras
- ✅ Categorias predefinidas (Mercado, Farmácia, Papelaria, Pet Shop)
- ✅ Agenda de compras
- ✅ Interface moderna e intuitiva

### Premium
- 🎤 Comandos de voz ilimitados
- 📷 Scanner de preços com OCR
- ☁️ Backup na nuvem (Supabase)
- 👥 Colaboração com até 2 usuários
- 🚫 Sem anúncios

## 🛠️ Tecnologias Utilizadas

- **React Native** com Expo SDK 53
- **TypeScript** para type safety
- **Expo Router** para navegação
- **AsyncStorage** para armazenamento local
- **Expo Speech** para reconhecimento de voz
- **Expo Camera** para scanner de códigos
- **React Native Reanimated** para animações
- **Date-fns** para manipulação de datas

## 📱 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- Expo CLI
- iOS Simulator ou Android Emulator (opcional)

### Passos

1. **Clone o repositório**
```bash
git clone <repository-url>
cd listavox
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute o projeto**
```bash
npm run dev
```

4. **Abra no dispositivo**
- Escaneie o QR code com o app Expo Go
- Ou execute no simulador/emulador

## 🏗️ Estrutura do Projeto

```
app/
├── (tabs)/                 # Navegação por abas
│   ├── index.tsx          # Lista de compras
│   ├── create.tsx         # Criar nova lista
│   ├── calendar.tsx       # Agenda de compras
│   └── settings.tsx       # Configurações
├── camera.tsx             # Scanner de preços
├── paywall.tsx           # Tela de assinatura
└── _layout.tsx           # Layout raiz

components/
├── VoiceButton.tsx       # Botão de reconhecimento de voz
└── ItemTile.tsx         # Item da lista de compras

services/
├── storage.ts           # Gerenciamento de dados locais
├── voice.ts            # Reconhecimento de voz
└── parser.ts           # Parser de comandos de voz

types/
└── index.ts            # Definições de tipos TypeScript
```

## 🎯 Como Usar

### Criando uma Lista
1. Toque na aba "Criar"
2. Digite um título ou use o gerado automaticamente
3. Selecione a categoria
4. Use o botão de voz para adicionar itens
5. Salve a lista

### Comandos de Voz
Fale naturalmente, por exemplo:
- "arroz, feijão, açúcar e leite"
- "2kg de carne moída"
- "detergente R$ 3,50"

### Scanner de Preços (Premium)
1. Toque no ícone da câmera em um item
2. Aponte para o código de barras ou preço
3. Confirme o valor detectado

## 💰 Planos de Assinatura

### Mensal - R$ 4,99/mês
- Todos os recursos premium
- Renovação automática

### Anual - R$ 49,90/ano
- Economize 17%
- Todos os recursos premium

### Vitalício - R$ 89,90 (Oferta Limitada)
- Pagamento único
- Acesso permanente a todos os recursos

## 🔄 Migração para Flutter

Para migrar este projeto para Flutter, siga este guia:

### 1. Estrutura de Pastas Flutter
```
lib/
├── main.dart
├── app.dart
├── routes.dart
├── models/
│   ├── shopping_item.dart
│   ├── shopping_list.dart
│   └── user_subscription.dart
├── services/
│   ├── hive_service.dart
│   ├── whisper_service.dart
│   ├── ocr_service.dart
│   └── subscription_service.dart
├── screens/
│   ├── home/
│   ├── create/
│   ├── calendar/
│   ├── settings/
│   ├── camera/
│   └── paywall/
├── widgets/
│   ├── voice_button.dart
│   └── item_tile.dart
└── utils/
    └── parser.dart
```

### 2. Dependências Flutter (pubspec.yaml)
```yaml
dependencies:
  flutter:
    sdk: flutter
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  speech_to_text: ^6.3.0
  camera: ^0.10.5
  google_mlkit_barcode_scanning: ^0.5.0
  google_mlkit_text_recognition: ^0.4.0
  in_app_purchase: ^3.1.11
  google_mobile_ads: ^3.0.0
  supabase_flutter: ^1.10.25
  intl: ^0.18.1
  uuid: ^3.0.7

dev_dependencies:
  flutter_test:
    sdk: flutter
  hive_generator: ^2.0.0
  build_runner: ^2.4.6
```

### 3. Principais Diferenças na Implementação

#### Armazenamento Local
**React Native (AsyncStorage)**
```typescript
await AsyncStorage.setItem(key, JSON.stringify(data));
```

**Flutter (Hive)**
```dart
final box = await Hive.openBox('lists');
await box.put(key, data);
```

#### Reconhecimento de Voz
**React Native (Web Speech API)**
```typescript
const recognition = new webkitSpeechRecognition();
recognition.start();
```

**Flutter (speech_to_text)**
```dart
final speech = SpeechToText();
await speech.listen(onResult: (result) {
  // Handle result
});
```

#### Câmera e OCR
**React Native (Expo Camera)**
```typescript
<CameraView onBarcodeScanned={handleScan} />
```

**Flutter (Camera + ML Kit)**
```dart
CameraController controller;
final inputImage = InputImage.fromBytes(bytes);
final barcodes = await barcodeScanner.processImage(inputImage);
```

### 4. Passos para Migração

1. **Configurar Projeto Flutter**
```bash
flutter create listavox_flutter
cd listavox_flutter
```

2. **Adicionar Dependências**
```bash
flutter pub add hive hive_flutter speech_to_text camera
flutter pub add google_mlkit_barcode_scanning google_mlkit_text_recognition
flutter pub add in_app_purchase google_mobile_ads supabase_flutter
```

3. **Configurar Hive**
```dart
// main.dart
await Hive.initFlutter();
Hive.registerAdapter(ShoppingItemAdapter());
Hive.registerAdapter(ShoppingListAdapter());
```

4. **Implementar Whisper.cpp**
```bash
# Baixar modelo Whisper
wget https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin
# Mover para assets/models/
```

5. **Configurar Permissões**

**Android (android/app/src/main/AndroidManifest.xml)**
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.CAMERA" />
```

**iOS (ios/Runner/Info.plist)**
```xml
<key>NSMicrophoneUsageDescription</key>
<string>Para reconhecimento de voz</string>
<key>NSCameraUsageDescription</key>
<string>Para scanner de preços</string>
```

### 5. Build e Deploy

#### Android AAB
```bash
flutter build appbundle --release
```

#### iOS
```bash
flutter build ios --release
```

### 6. Configuração Google Play Console

1. **Upload do AAB**
2. **Configurar In-App Products**
   - monthly_premium: R$ 4,99
   - annual_premium: R$ 49,90
   - lifetime_premium: R$ 89,90

3. **Data Safety**
   - Coleta dados pessoais: Não
   - Compartilha dados: Não
   - Criptografia em trânsito: Sim

### 7. Testes

```bash
# Testes unitários
flutter test

# Testes de integração
flutter drive --target=test_driver/app.dart
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request.

## 📞 Suporte

Para suporte, entre em contato através do email: suporte@listavox.com
