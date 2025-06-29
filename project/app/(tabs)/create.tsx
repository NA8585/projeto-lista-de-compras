import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FundoComGradiente from '@/components/FundoComGradiente';
import { Calendar, Save, Trash2 } from 'lucide-react-native';
import { useThemeSpec } from '@/theme/useTheme';
import { ShoppingList, ShoppingItem, ListCategory, UserSubscription } from '@/types';
import { StorageService } from '@/services/storage';
import { ParserService } from '@/services/parser';
import { v4 as uuidv4 } from 'uuid';
import VoiceButton from '@/components/VoiceButton';
import ItemTile from '@/components/ItemTile';
import { router, useLocalSearchParams } from 'expo-router';
import { useShoppingLists } from '@/context/ShoppingListContext';

const CATEGORIES: ListCategory[] = ['Mercado', 'Farmácia', 'Papelaria', 'Pet Shop'];

export default function CreateScreen() {
  const spec = useThemeSpec();
  const colors = React.useMemo(() => ({
    background: spec.background[0],
    surface: spec.card,
    text: spec.text,
    primary: spec.primary,
    border: spec.border,
    control: spec.card,
    separator: spec.border,
    danger: spec.accent,
  }), [spec]);
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const { listId } = useLocalSearchParams<{ listId?: string }>();
  const { lists, upsertList } = useShoppingLists();
  const editing = Boolean(listId);
  const existing = editing ? lists.find(l => l.id === listId) : undefined;
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ListCategory>('Mercado');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [items, setItems] = useState<ShoppingItem[]>(() => existing?.items ?? []);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscription();
    generateDefaultTitle();
  }, [selectedCategory, selectedDate]);

  useEffect(() => {
    if (editing && existing) {
      setTitle(existing.title);
      setSelectedCategory(existing.category);
      setSelectedDate(new Date(existing.date));
      setItems(existing.items);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, existing?.id]);

  const loadSubscription = async () => {
    try {
      const sub = await StorageService.getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const generateDefaultTitle = () => {
    if (!title) {
      const today = new Date();
      const isToday = selectedDate.toDateString() === today.toDateString();
      const dateStr = isToday ? 'Hoje' : selectedDate.toLocaleDateString('pt-BR');
      setTitle(`${selectedCategory} - ${dateStr}`);
    }
  };

  const canUseVoice = (): boolean => {
    // Para ambiente de testes removemos qualquer bloqueio
    return true;
  };

  const handleVoiceResult = async (result: any) => {
    // Bloqueio removido em testes

    try {
      setError(null);
      const parsed = ParserService.parseVoiceInput(result.text, selectedCategory);
      
      const newItems: ShoppingItem[] = parsed.items.map(item => ({
        ...item,
        quantity: item.quantity ?? 1,
        id: uuidv4(),
        checked: false,
        createdAt: new Date(),
      }));

      setItems(prev => [...prev, ...newItems]);
      
      // Ignorar contagem de voz em ambiente de testes
    } catch (error) {
      console.error('Error processing voice input:', error);
      setError('Erro ao processar comando de voz');
    }
  };

  const handleVoiceError = (error: string) => {
    setError(error);
  };

  const toggleItem = (itemId: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const deleteItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleScan = (itemId: string) => {
    // Navigate to camera screen with item ID
    router.push(`/camera?itemId=${itemId}`);
  };

  const changeItemQuantity = (itemId: string, newQuantity: number) => {
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item));
  };

  const saveList = async () => {
    if (!title.trim()) {
      setError('Digite um título para a lista');
      return;
    }

    if (items.length === 0) {
      setError('Adicione pelo menos um item à lista');
      return;
    }

    // Bloqueio de plano removido em ambiente de testes

    try {
      const totalPrice = ParserService.calculateTotal(items);

      const newList: ShoppingList = {
        id: listId ?? uuidv4(),
        title: title.trim(),
        date: selectedDate,
        category: selectedCategory,
        items,
        totalPrice,
        createdAt: editing && existing ? existing.createdAt : new Date(),
        updatedAt: new Date(),
      };

      await upsertList(newList);

      // Reset form before navigating
      setTitle('');
      setItems([]);
      generateDefaultTitle();

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving list:', error);
      setError('Erro ao salvar lista');
    }
  };

  const totalPrice = ParserService.calculateTotal(items);
  const voiceUsageLeft = subscription ? (subscription.isPremium ? '∞' : `${30 - subscription.voiceUsageCount}`) : '0';

  return (
    <FundoComGradiente>
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{editing ? 'Editar Lista' : 'Nova Lista'}</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveList}
          disabled={items.length === 0}
        >
          <Save size={20} color={items.length === 0 ? colors.separator : 'white'} />
          <Text style={[styles.saveButtonText, items.length === 0 && styles.saveButtonTextDisabled]}>
            Salvar
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Título da Lista</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Compras do Mercado"
            placeholderTextColor={colors.separator}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Categoria</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonSelected,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category && styles.categoryButtonTextSelected,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Data</Text>
          <TouchableOpacity style={styles.dateButton}>
            <Calendar size={20} color={colors.primary} />
            <Text style={styles.dateButtonText}>
              {selectedDate.toLocaleDateString('pt-BR')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.voiceSection}>
          <View style={styles.voiceHeader}>
            <Text style={styles.sectionTitle}>Adicionar por Voz</Text>
            <Text style={styles.usageCounter}>
              {voiceUsageLeft} restantes
            </Text>
          </View>
          
          <VoiceButton
            onResult={handleVoiceResult}
            onError={handleVoiceError}
            disabled={!canUseVoice()}
          />
          
          {!canUseVoice() && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => router.push('/paywall')}
            >
              <Text style={styles.upgradeButtonText}>
                Upgrade para voz ilimitada
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {items.length > 0 && (
          <View style={styles.itemsSection}>
            <View style={styles.itemsHeader}>
              <Text style={styles.sectionTitle}>
                Itens ({items.length})
              </Text>
              {totalPrice > 0 && (
                <Text style={styles.totalPrice}>
                  Total: R$ {totalPrice.toFixed(2)}
                </Text>
              )}
            </View>

            {items.map((item) => (
              <ItemTile
                key={item.id}
                item={item}
                onToggle={toggleItem}
                onDelete={deleteItem}
                onScan={handleScan}
                onQuantityChange={changeItemQuantity}
              />
            ))}

            <TouchableOpacity
              style={styles.saveButtonBottom}
              onPress={saveList}
              disabled={items.length === 0}
            >
              <Text style={styles.saveButtonBottomText}>Salvar Lista</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
    </FundoComGradiente>
  );
}

const createStyles = (colors: { [key: string]: string }) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.control,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  saveButtonTextDisabled: {
    color: colors.separator,
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.danger,
  },
  formSection: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 12,
  },
  titleInput: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.control,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.control,
  },
  categoryButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.text,
  },
  categoryButtonTextSelected: {
    color: 'white',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.control,
  },
  dateButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.text,
  },
  voiceSection: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  voiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  usageCounter: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.muted,
  },
  upgradeButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.warning,
    borderRadius: 16,
  },
  upgradeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  itemsSection: {
    marginTop: 16,
    paddingBottom: 32,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  totalPrice: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: colors.success,
  },
  saveButtonBottom: {
    marginTop: 24,
    marginHorizontal: 32,
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonBottomText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
});