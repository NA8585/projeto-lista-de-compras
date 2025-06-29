import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShoppingList } from '@/types';
import { StorageService } from '@/services/storage';

interface ShoppingListContextValue {
  lists: ShoppingList[];
  upsertList: (list: ShoppingList) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
}

const ShoppingListContext = createContext<ShoppingListContextValue | undefined>(undefined);

export function ShoppingListProvider({ children }: { children: React.ReactNode }) {
  const [lists, setLists] = useState<ShoppingList[]>([]);

  useEffect(() => {
    (async () => {
      const stored = await StorageService.getLists();
      setLists(stored);
    })();
  }, []);

  const persist = async (next: ShoppingList[]) => {
    await AsyncStorage.setItem('@listavox:lists', JSON.stringify(next));
  };

  const upsertList = async (list: ShoppingList) => {
    setLists(prev => {
      const filtered = prev.filter(l => l.id !== list.id);
      const next = [...filtered, list];
      persist(next);
      return next;
    });
  };

  const deleteList = async (id: string) => {
    setLists(prev => {
      const next = prev.filter(l => l.id !== id);
      persist(next);
      return next;
    });
  };

  return (
    <ShoppingListContext.Provider value={{ lists, upsertList, deleteList }}>
      {children}
    </ShoppingListContext.Provider>
  );
}

export function useShoppingLists() {
  const ctx = useContext(ShoppingListContext);
  if (!ctx) throw new Error('useShoppingLists must be within provider');
  return ctx;
}
