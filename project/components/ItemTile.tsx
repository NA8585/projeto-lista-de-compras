import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useThemeSpec } from '@/theme/useTheme';
import { GlassCard } from './GlassCard';
import { Check, Camera, Trash2 } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withSpring
} from 'react-native-reanimated';
import { ShoppingItem } from '@/types';
import { ParserService } from '@/services/parser';

interface ItemTileProps {
  item: ShoppingItem;
  onToggle: (itemId: string) => void;
  onDelete: (itemId: string) => void;
  onScan: (itemId: string) => void;
  onQuantityChange: (itemId: string, newQuantity: number) => void;
  showActions?: boolean;
}

export default function ItemTile({
  item,
  onToggle,
  onDelete,
  onScan,
  onQuantityChange,
  showActions = true
}: ItemTileProps) {
  const spec = useThemeSpec();
  const colors = React.useMemo(() => ({
    background: spec.card,
    text: spec.text,
    border: spec.border,
    primary: spec.primary,
    danger: spec.accent,
    control: spec.card,
    separator: spec.border,
    success: spec.primary,
    warning: spec.accent,
    highlight: spec.card,
    muted: spec.border,
  }), [spec]);
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(item.checked ? 0.6 : 1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleToggle = () => {
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    
    opacity.value = withTiming(item.checked ? 1 : 0.6);
    onToggle(item.id);
  };

  const handleQuantityChange = (value: string) => {
    let num = parseFloat(value.replace(',', '.'));
    if (isNaN(num) || num < 0.1) num = 0.1;
    onQuantityChange(item.id, num);
  };

  const handleIncrement = () => {
    const newValue = parseFloat((item.quantity + 1).toFixed(2));
    onQuantityChange(item.id, newValue);
  };

  const handleDecrement = () => {
    let newValue = parseFloat((item.quantity - 1).toFixed(2));
    if (newValue < 0.1) newValue = 0.1;
    onQuantityChange(item.id, newValue);
  };

  const displayPrice = item.scannedPrice || item.price;

  return (
    <Animated.View style={animatedStyle}>
      <GlassCard style={styles.container} checked={item.checked}>
      <TouchableOpacity
        style={styles.mainContent}
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
          {item.checked && <Check size={16} color="white" />}
        </View>
        
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, item.checked ? styles.itemNameChecked : undefined]}>
            {item.name}
          </Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.qtyButton} onPress={handleDecrement}>
              <Text style={styles.qtyButtonText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.qtyInput}
              keyboardType="decimal-pad"
              value={(item.quantity ?? 1).toString().replace('.', ',')}
              onChangeText={handleQuantityChange}
            />
            <TouchableOpacity style={styles.qtyButton} onPress={handleIncrement}>
              <Text style={styles.qtyButtonText}>+</Text>
            </TouchableOpacity>
            <Text style={styles.qtyUnit}>{item.unit}</Text>
          </View>
          
          <View style={styles.itemDetails}>
            <Text style={styles.itemCategory}>{item.category}</Text>
            {displayPrice && (
              <Text style={[styles.itemPrice, item.scannedPrice ? styles.scannedPrice : undefined]}>
                R$ {displayPrice.toFixed(2)}
                {item.scannedPrice && ' 📷'}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {showActions && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onScan(item.id)}
            activeOpacity={0.7}
          >
            <Camera size={20} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDelete(item.id)}
            activeOpacity={0.7}
          >
            <Trash2 size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      )}
      </GlassCard>
    </Animated.View>
  );
}

const createStyles = (colors: { [key: string]: string }) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.separator,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 4,
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: colors.muted,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemCategory: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.primary,
    backgroundColor: colors.highlight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: colors.success,
  },
  scannedPrice: {
    color: colors.warning,
  },
  actions: {
    flexDirection: 'row',
    paddingRight: 16,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.control,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.control,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  qtyButtonText: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: 'bold',
  },
  qtyInput: {
    width: 48,
    height: 28,
    borderWidth: 1,
    borderColor: colors.separator,
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 16,
    marginHorizontal: 2,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  qtyUnit: {
    fontSize: 14,
    color: colors.muted,
    marginLeft: 4,
  },
});