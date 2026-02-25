import * as SecureStore from 'expo-secure-store';

export const storage = {
  save: async (key: string, value: any) => {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await SecureStore.setItemAsync(key, stringValue);
    } catch (error) {
      console.error("Storage Save Error:", error);
    }
  },

  get: async (key: string) => {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (!value) return null;
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error("Storage Get Error:", error);
      return null;
    }
  },

  delete: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error("Storage Delete Error:", error);
    }
  },
};