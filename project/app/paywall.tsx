import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Crown, Check, Zap, Camera, Users, Cloud } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserSubscription } from '@/types';
import { StorageService } from '@/services/storage';
import { router } from 'expo-router';

const PLANS = [
  {
    id: 'monthly',
    title: 'Mensal',
    price: 'R$ 4,99',
    period: '/mês',
    popular: false,
  },
  {
    id: 'annual',
    title: 'Anual',
    price: 'R$ 49,90',
    period: '/ano',
    popular: true,
    savings: 'Economize 17%',
  },
  {
    id: 'lifetime',
    title: 'Vitalício',
    price: 'R$ 89,90',
    period: 'pagamento único',
    popular: false,
    badge: 'Oferta Limitada',
  },
];

const FEATURES = [
  {
    icon: <Zap size={20} color="#FFD700" />,
    title: 'Comandos de voz ilimitados',
    description: 'Use quantas vezes quiser',
  },
  {
    icon: <Camera size={20} color="#FFD700" />,
    title: 'Scanner de preços OCR',
    description: 'Capture preços automaticamente',
  },
  {
    icon: <Cloud size={20} color="#FFD700" />,
    title: 'Backup na nuvem',
    description: 'Suas listas sempre seguras',
  },
  {
    icon: <Users size={20} color="#FFD700" />,
    title: 'Colaboração (2 usuários)',
    description: 'Compartilhe listas com família',
  },
];

export default function PaywallScreen() {
  const { colors } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState('annual');
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(false);

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

  const handlePurchase = async () => {
    setLoading(true);
    
    try {
      // Simulate purchase process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newSubscription: UserSubscription = {
        isPremium: true,
        plan: selectedPlan as any,
        expiresAt: selectedPlan === 'lifetime' ? undefined : new Date(Date.now() + (selectedPlan === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000),
        voiceUsageCount: 0,
        listsCount: 0,
      };
      
      await StorageService.saveSubscription(newSubscription);
      
      Alert.alert(
        'Parabéns! 🎉',
        'Você agora tem acesso a todos os recursos Premium do ListaVox!',
        [
          {
            text: 'Começar',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Erro', 'Não foi possível processar a compra. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderPlanCard = (plan: typeof PLANS[0]) => {
    const isSelected = selectedPlan === plan.id;
    
    return (
      <TouchableOpacity
        key={plan.id}
        style={[styles.planCard, isSelected && styles.planCardSelected]}
        onPress={() => setSelectedPlan(plan.id)}
      >
        {plan.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularBadgeText}>Mais Popular</Text>
          </View>
        )}
        
        {plan.badge && (
          <View style={styles.limitedBadge}>
            <Text style={styles.limitedBadgeText}>{plan.badge}</Text>
          </View>
        )}
        
        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>{plan.title}</Text>
          {plan.savings && (
            <Text style={styles.planSavings}>{plan.savings}</Text>
          )}
        </View>
        
        <View style={styles.planPricing}>
          <Text style={styles.planPrice}>{plan.price}</Text>
          <Text style={styles.planPeriod}>{plan.period}</Text>
        </View>
        
        <View style={[styles.planSelector, isSelected && styles.planSelectorSelected]}>
          {isSelected && <Check size={16} color="white" />}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFeature = (feature: typeof FEATURES[0]) => (
    <View key={feature.title} style={styles.feature}>
      <View style={styles.featureIcon}>
        {feature.icon}
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#007AFF', '#0051D5']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <X size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Crown size={48} color="#FFD700" />
          <Text style={styles.headerTitle}>ListaVox Premium</Text>
          <Text style={styles.headerSubtitle}>
            Desbloqueie todo o potencial do seu app de compras
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>O que você ganha:</Text>
          {FEATURES.map(renderFeature)}
        </View>

        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>Escolha seu plano:</Text>
          {PLANS.map(renderPlanCard)}
        </View>

        <View style={styles.currentUsage}>
          <Text style={styles.usageTitle}>Seu uso atual:</Text>
          <View style={styles.usageStats}>
            <View style={styles.usageStat}>
              <Text style={styles.usageValue}>
                {subscription ? `${subscription.voiceUsageCount}/30` : '0/30'}
              </Text>
              <Text style={styles.usageLabel}>Comandos de voz</Text>
            </View>
            <View style={styles.usageStat}>
              <Text style={styles.usageValue}>
                {subscription ? `${subscription.listsCount}/3` : '0/3'}
              </Text>
              <Text style={styles.usageLabel}>Listas criadas</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.purchaseButton, loading && styles.purchaseButtonDisabled]}
          onPress={handlePurchase}
          disabled={loading}
        >
          <Text style={styles.purchaseButtonText}>
            {loading ? 'Processando...' : `Assinar ${PLANS.find(p => p.id === selectedPlan)?.title}`}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.footerText}>
          Cancele a qualquer momento • Sem compromisso
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.control,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  content: {
    flex: 1,
  },
  featuresSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.muted,
  },
  plansSection: {
    padding: 16,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    backgroundColor: colors.danger,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  limitedBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  limitedBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
  },
  planSavings: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: colors.success,
    backgroundColor: colors.highlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  planPrice: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: colors.text,
  },
  planPeriod: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.muted,
    marginLeft: 4,
  },
  planSelector: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.separator,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planSelectorSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  currentUsage: {
    backgroundColor: colors.surface,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  usageTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 16,
  },
  usageStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  usageStat: {
    alignItems: 'center',
  },
  usageValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: colors.danger,
  },
  usageLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.muted,
    marginTop: 4,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  purchaseButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  purchaseButtonDisabled: {
    backgroundColor: colors.separator,
  },
  purchaseButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.muted,
    textAlign: 'center',
  },
});