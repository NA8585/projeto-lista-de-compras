import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShoppingList, UserSubscription } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
  LISTS: '@listavox:lists',
  SUBSCRIPTION: '@listavox:subscription',
  VOICE_USAGE: '@listavox:voice_usage',
} as const;

export class StorageService {
  static async getLists(): Promise<ShoppingList[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LISTS);
      if (!data) return [];
      
      const lists = JSON.parse(data);
      return lists.map((list: any) => ({
        ...list,
        date: new Date(list.date),
        createdAt: new Date(list.createdAt),
        updatedAt: new Date(list.updatedAt),
        items: list.items.map((item: any) => ({
          ...item,
          id: item.id ?? uuidv4(),
          quantity: item.quantity ?? 1,
          createdAt: new Date(item.createdAt),
        })),
      }));
    } catch (error) {
      console.error('Error loading lists:', error);
      return [];
    }
  }

  static async saveList(list: ShoppingList): Promise<void> {
    try {
      const lists = await this.getLists();
      const existingIndex = lists.findIndex(l => l.id === list.id);
      
      if (existingIndex >= 0) {
        lists[existingIndex] = { ...list, updatedAt: new Date() };
      } else {
        lists.push(list);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(lists));
    } catch (error) {
      console.error('Error saving list:', error);
      throw error;
    }
  }

  static async deleteList(listId: string): Promise<void> {
    try {
      const lists = await this.getLists();
      const filteredLists = lists.filter(l => l.id !== listId);
      await AsyncStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(filteredLists));
    } catch (error) {
      console.error('Error deleting list:', error);
      throw error;
    }
  }

  static async getSubscription(): Promise<UserSubscription> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
      if (!data) {
        return {
          isPremium: false,
          plan: 'free',
          voiceUsageCount: 0,
          listsCount: 0,
        };
      }
      
      const subscription = JSON.parse(data);
      return {
        ...subscription,
        expiresAt: subscription.expiresAt ? new Date(subscription.expiresAt) : undefined,
      };
    } catch (error) {
      console.error('Error loading subscription:', error);
      return {
        isPremium: false,
        plan: 'free',
        voiceUsageCount: 0,
        listsCount: 0,
      };
    }
  }

  static async saveSubscription(subscription: UserSubscription): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(subscription));
    } catch (error) {
      console.error('Error saving subscription:', error);
      throw error;
    }
  }

  static async incrementVoiceUsage(): Promise<number> {
    try {
      const subscription = await this.getSubscription();
      const newCount = subscription.voiceUsageCount + 1;
      
      await this.saveSubscription({
        ...subscription,
        voiceUsageCount: newCount,
      });
      
      return newCount;
    } catch (error) {
      console.error('Error incrementing voice usage:', error);
      throw error;
    }
  }

  static async resetMonthlyUsage(): Promise<void> {
    try {
      const subscription = await this.getSubscription();
      await this.saveSubscription({
        ...subscription,
        voiceUsageCount: 0,
      });
    } catch (error) {
      console.error('Error resetting monthly usage:', error);
      throw error;
    }
  }
}