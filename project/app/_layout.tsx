import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, useThemeSpec } from '@/theme/useTheme';
import FundoComGradiente from '@/components/FundoComGradiente';
import { ThemeProvider as PaletteProvider, useTheme as usePaletteTheme } from '@/context/ThemeContext';
import { ShoppingListProvider } from '@/context/ShoppingListContext';
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const spec = useThemeSpec();
  const { paletteName, colorScheme } = usePaletteTheme();

  const content = (
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="paywall"
          options={{
            presentation: 'modal',
            headerTitle: 'Obter Premium',
            headerStyle: { backgroundColor: spec.card },
            headerTitleStyle: { color: spec.text },
          }}
        />
        <Stack.Screen
          name="camera"
          options={{
            presentation: 'modal',
            headerTitle: 'Escanear Recibo',
            headerStyle: { backgroundColor: spec.card },
            headerTitleStyle: { color: spec.text },
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
  );

  const isGlass =
    paletteName === 'sunriseGlass' || paletteName === 'nightfallGlass';

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      {isGlass ? (
        <FundoComGradiente>{content}</FundoComGradiente>
      ) : (
        content
      )}
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <PaletteProvider>
          <ShoppingListProvider>
            <RootLayoutNav />
          </ShoppingListProvider>
        </PaletteProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
