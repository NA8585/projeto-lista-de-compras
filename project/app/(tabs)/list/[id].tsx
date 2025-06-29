import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ShoppingList, ShoppingItem } from '@/types';
import { StorageService } from '@/services/storage';
import { ParserService } from '@/services/parser';
import ItemTile from '@/components/ItemTile';
import { useTheme } from '@/context/ThemeContext';
import { palettes } from '@/constants/Colors';

export default function ListDetailScreen() {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const params = useLocalSearchParams();
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const [list, setList] = useState<ShoppingList | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadList();
  }, [idParam]);

  const loadList = async () => {
    try {
      const allLists = await StorageService.getLists();
      const found = allLists.find(l => l.id === idParam);
      if (found) {
        setList(found);
        setItems(found.items.map(item => ({ ...item, quantity: item.quantity ?? 1 })));
        setTitle(found.title);
        const inputs: Record<string, string> = {};
        found.items.forEach(i => {
          inputs[i.id] = i.price !== undefined ? i.price.toString().replace('.', ',') : '';
        });
        setPriceInputs(inputs);
      }
    } catch (e) {
      setError('Erro ao carregar lista');
    }
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item));
  };

  const handlePriceChange = (itemId: string, text: string) => {
    const sanitized = text.replace(/[^0-9.,]/g, '');
    setPriceInputs(prev => ({ ...prev, [itemId]: sanitized }));
    const parsed = parseFloat(sanitized.replace(',', '.'));
    setItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, price: Number.isNaN(parsed) ? undefined : parsed }
          : item
      )
    );
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleToggleItem = (itemId: string) => {
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item));
  };

  const saveEdits = async () => {
    if (!list) return;
    try {
      const updatedList = {
        ...list,
        title: title.trim() || list.title,
        items,
        totalPrice: ParserService.calculateTotal(items),
        updatedAt: new Date(),
      };
      await StorageService.saveList(updatedList);
      setList(updatedList);
      Alert.alert('Lista atualizada!', 'As alterações foram salvas.');
    } catch (e) {
      setError('Erro ao salvar alterações');
    }
  };

  const totalPrice = ParserService.calculateTotal(items);

  if (!list) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Carregando...'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.titleInput}
        value={title}
        onChangeText={setTitle}
      />
      <Text style={styles.category}>{list.category}</Text>
      <Text style={styles.date}>{list.date.toLocaleDateString('pt-BR')}</Text>
      <View style={styles.itemsSection}>
        {items.map(item => (
          <View key={item.id} style={styles.itemRow}>
            <ItemTile
              item={item}
              onToggle={handleToggleItem}
              onDelete={handleDeleteItem}
              onScan={() => {}}
              onQuantityChange={handleQuantityChange}
              showActions={true}
            />
            <View style={styles.priceEditRow}>
              <Text style={styles.priceLabel}>Preço:</Text>
              <TextInput
                style={styles.priceInput}
                keyboardType="decimal-pad"
                inputMode="decimal"
                value={priceInputs[item.id] ?? ''}
                onChangeText={value => handlePriceChange(item.id, value)}
                placeholder="0,00"
              />
            </View>
          </View>
        ))}
      </View>
      <Text style={styles.totalLabel}>Total estimado:</Text>
      <Text style={styles.totalValue}>R$ {totalPrice.toFixed(2)}</Text>
      <TouchableOpacity style={styles.saveButton} onPress={saveEdits}>
        <Text style={styles.saveButtonText}>Salvar Alterações</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (colors: typeof palettes.fresh.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.control,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.danger,
    fontSize: 16,
  },
  titleInput: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 8,
    marginBottom: 4,
    backgroundColor: colors.control,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    color: colors.primary,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 16,
  },
  itemsSection: {
    marginBottom: 24,
  },
  itemRow: {
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  priceEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.muted,
    marginRight: 8,
  },
  priceInput: {
    width: 80,
    height: 32,
    borderWidth: 1,
    borderColor: colors.separator,
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 16,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  totalLabel: {
    fontSize: 18,
    color: colors.text,
    marginTop: 16,
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  totalValue: {
    fontSize: 22,
    color: colors.success,
    fontFamily: 'Inter-Bold',
    marginBottom: 24,
  },
  saveButton: {
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
    marginBottom: 32,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
}); 