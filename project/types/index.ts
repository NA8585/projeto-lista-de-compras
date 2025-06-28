export interface ShoppingItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  price?: number;
  checked: boolean;
  category: string;
  createdAt: Date;
  scannedPrice?: number;
  barcode?: string;
}

export interface ShoppingList {
  id: string;
  title: string;
  date: Date;
  category: ListCategory;
  items: ShoppingItem[];
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ListCategory = 'Mercado' | 'Farmácia' | 'Papelaria' | 'Pet Shop';

export interface UserSubscription {
  isPremium: boolean;
  plan: 'free' | 'monthly' | 'annual' | 'lifetime';
  expiresAt?: Date;
  voiceUsageCount: number;
  listsCount: number;
}

export interface VoiceRecognitionResult {
  text: string;
  confidence: number;
}

export interface ParsedItems {
  items: Omit<ShoppingItem, 'id' | 'createdAt' | 'checked'>[];
}