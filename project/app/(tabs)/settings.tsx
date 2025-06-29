import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Crown,
  Mic,
  Camera,
  Bell,
  Shield,
  HelpCircle,
  Star,
  ChevronRight,
  Trash2
} from 'lucide-react-native';
import { Feather } from '@expo/vector-icons';
import { palettes, PaletteName } from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';
import { UserSubscription } from '@/types';
import { StorageService } from '@/services/storage';
import { router } from 'expo-router';
import { colors } from '@/constants/Colors';

export default function SettingsScreen() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [notifications, setNotifications] = useState(true);
  const [voiceConfirmation, setVoiceConfirmation] = useState(false);
  const { colors, colorScheme, toggleColorScheme, paletteName, setPalette } = useTheme();

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const sub = await StorageService.getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const clearAllData = () => {
    Alert.alert(
      'Limpar Todos os Dados',
      'Esta ação irá remover todas as suas listas e configurações. Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all stored data
              const lists = await StorageService.getLists();
              for (const list of lists) {
                await StorageService.deleteList(list.id);
              }
              
              // Reset subscription
              await StorageService.saveSubscription({
                isPremium: false,
                plan: 'free',
                voiceUsageCount: 0,
                listsCount: 0,
              });
              
              await loadSubscription();
              
              Alert.alert('Sucesso', 'Todos os dados foram removidos.');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Erro', 'Não foi possível limpar os dados.');
            }
          },
        },
      ]
    );
  };

  const renderSubscriptionCard = () => {
    if (!subscription) return null;

    return (
      <TouchableOpacity
        style={[styles.card, subscription.isPremium && styles.premiumCard]}
        onPress={() => router.push('/paywall')}
      >
        <View style={styles.cardHeader}>
          <Crown size={24} color={subscription.isPremium ? '#FFD700' : colors.muted} />
          <Text style={[styles.cardTitle, subscription.isPremium && styles.premiumText]}>
            {subscription.isPremium ? 'ListaVox Premium' : 'ListaVox Gratuito'}
          </Text>
          <ChevronRight size={20} color={colors.muted} />
        </View>
        
        <View style={styles.subscriptionStats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {subscription.isPremium ? '∞' : `${30 - subscription.voiceUsageCount}`}
            </Text>
            <Text style={styles.statLabel}>Comandos de voz</Text>
          </View>
          
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {subscription.isPremium ? '∞' : `${3 - subscription.listsCount}`}
            </Text>
            <Text style={styles.statLabel}>Listas restantes</Text>
          </View>
        </View>
        
        {!subscription.isPremium && (
          <Text style={styles.upgradeText}>
            Toque para fazer upgrade
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          {icon}
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      
      {rightElement || (onPress && <ChevronRight size={20} color={colors.muted} />)}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Configurações</Text>
      </View>

      <ScrollView style={[styles.content, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        {renderSubscriptionCard()}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Aparência</Text>
          <TouchableOpacity onPress={toggleColorScheme} style={[styles.settingItem, { backgroundColor: colors.surface }]}> 
            <Text style={[styles.settingTitle, { color: colors.text }]}>Modo Escuro</Text>
            <View style={styles.switch}>
              <View style={[styles.switchTrack, { backgroundColor: colorScheme === 'dark' ? colors.primary : '#ccc' }]}>
                <View style={[styles.switchThumb, { alignSelf: colorScheme === 'dark' ? 'flex-end' : 'flex-start' }]} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Paleta de Cores</Text>
          <View style={[styles.settingItem, { backgroundColor: colors.surface, flexDirection: 'column', alignItems: 'stretch' }]}>
            {Object.keys(palettes).map((name) => (
              <Pressable key={name} onPress={() => setPalette(name as PaletteName)} style={styles.paletteOption}>
                <Text style={[styles.settingTitle, { color: colors.text, textTransform: 'capitalize' }]}>{name}</Text>
                {paletteName === name && (
                  <Feather name="check-circle" size={22} color={colors.primary} />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Funcionalidades</Text>
          
          {renderSettingItem(
            <Mic size={20} color={colors.primary} />,
            'Reconhecimento de Voz',
            'Configurar idioma e sensibilidade',
            () => {},
            <Switch
              value={voiceConfirmation}
              onValueChange={setVoiceConfirmation}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="white"
            />
          )}
          
          {renderSettingItem(
            <Camera size={20} color={colors.primary} />,
            'Scanner de Preços',
            subscription?.isPremium ? 'Disponível' : 'Apenas Premium',
            () => {}
          )}
          
          {renderSettingItem(
            <Bell size={20} color={colors.primary} />,
            'Notificações',
            'Lembretes de compras',
            () => {},
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="white"
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suporte</Text>
          
          {renderSettingItem(
            <HelpCircle size={20} color={colors.primary} />,
            'Central de Ajuda',
            'Tutoriais e perguntas frequentes',
            () => {}
          )}
          
          {renderSettingItem(
            <Star size={20} color={colors.primary} />,
            'Avaliar App',
            'Deixe sua avaliação na loja',
            () => {}
          )}
          
          {renderSettingItem(
            <Shield size={20} color={colors.primary} />,
            'Privacidade',
            'Política de privacidade e termos',
            () => {}
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados</Text>
          
          {renderSettingItem(
            <Trash2 size={20} color={colors.danger} />,
            'Limpar Todos os Dados',
            'Remove todas as listas e configurações',
            clearAllData
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ListaVox v1.0.0
          </Text>
          <Text style={styles.footerSubtext}>
            Feito com ❤️ para facilitar suas compras
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.control,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumCard: {
    backgroundColor: '#FFF8E1',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    flex: 1,
    marginLeft: 12,
  },
  premiumText: {
    color: '#FF8F00',
  },
  subscriptionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.muted,
    marginTop: 4,
  },
  upgradeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.primary,
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.muted,
    marginLeft: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.control,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.control,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.text,
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.muted,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.muted,
  },
  footerSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.separator,
    marginTop: 4,
  },
  switch: {
    width: 50,
    height: 30,
    justifyContent: 'center',
  },
  switchTrack: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    margin: 2,
  },
  paletteOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
});
