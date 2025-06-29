import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useShoppingLists } from '@/context/ShoppingListContext';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { lists, deleteList } = useShoppingLists();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Minhas Listas</Text>
      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.listItem, { backgroundColor: colors.surface }]}
            onPress={() => router.push(`/list/${item.id}`)}
          >
            <View>
              <Text style={[styles.listTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.listDate, { color: colors.text }]}> {item.date.toLocaleDateString()} </Text>
            </View>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                deleteList(item.id);
              }}
              style={styles.deleteButton}
            >
              <Text style={{ color: '#E53935' }}>Excluir</Text>
            </Pressable>
          </Pressable>
        )}
        contentContainerStyle={{ gap: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    marginBottom: 20,
  },
  listItem: {
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  listDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    opacity: 0.7,
  },
  deleteButton: {
    padding: 8,
  },
});

