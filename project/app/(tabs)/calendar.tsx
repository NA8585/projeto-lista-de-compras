import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { palettes } from '@/constants/Colors';
import { ShoppingList } from '@/types';
import { StorageService } from '@/services/storage';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { router } from 'expo-router';

export default function CalendarScreen() {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      const loadedLists = await StorageService.getLists();
      setLists(loadedLists);
    } catch (error) {
      console.error('Error loading lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getListsForDate = (date: Date) => {
    return lists.filter(list => isSameDay(list.date, date));
  };

  const selectedDateLists = getListsForDate(selectedDate);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const renderCalendarDay = (day: Date) => {
    const dayLists = getListsForDate(day);
    const isSelected = isSameDay(day, selectedDate);
    const isToday = isSameDay(day, new Date());
    const hasLists = dayLists.length > 0;

    return (
      <TouchableOpacity
        key={day.toISOString()}
        style={[
          styles.calendarDay,
          isSelected && styles.calendarDaySelected,
          isToday && styles.calendarDayToday,
        ]}
        onPress={() => setSelectedDate(day)}
      >
        <Text
          style={[
            styles.calendarDayText,
            isSelected && styles.calendarDayTextSelected,
            isToday && styles.calendarDayTextToday,
          ]}
        >
          {format(day, 'd')}
        </Text>
        {hasLists && (
          <View style={styles.calendarDayIndicator}>
            <Text style={styles.calendarDayIndicatorText}>
              {dayLists.length}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderListItem = (list: ShoppingList) => {
    const completedItems = list.items.filter(item => item.checked).length;
    const totalItems = list.items.length;
    const progress = totalItems > 0 ? completedItems / totalItems : 0;

    return (
      <TouchableOpacity
        key={list.id}
        style={styles.listItem}
        onPress={() => router.push(`/list/${list.id}`)}
      >
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{list.title}</Text>
          <Text style={styles.listCategory}>{list.category}</Text>
        </View>
        
        <View style={styles.listStats}>
          <Text style={styles.itemCount}>
            {completedItems}/{totalItems} itens
          </Text>
          
          {list.totalPrice > 0 && (
            <Text style={styles.totalPrice}>
              R$ {list.totalPrice.toFixed(2)}
            </Text>
          )}
        </View>
        
        <View style={styles.progressBar}>
          <View 
            style={[styles.progressFill, { width: `${progress * 100}%` }]} 
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Agenda</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calendar Header */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigateMonth('prev')}
          >
            <ChevronLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <Text style={styles.monthTitle}>
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </Text>
          
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigateMonth('next')}
          >
            <ChevronRight size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendar}>
          <View style={styles.weekDays}>
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <Text key={day} style={styles.weekDayText}>{day}</Text>
            ))}
          </View>
          
          <View style={styles.calendarGrid}>
            {daysInMonth.map(renderCalendarDay)}
          </View>
        </View>

        {/* Selected Date Lists */}
        <View style={styles.selectedDateSection}>
          <View style={styles.selectedDateHeader}>
            <Text style={styles.selectedDateTitle}>
              {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/create')}
            >
              <Plus size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {selectedDateLists.length > 0 ? (
            <View style={styles.listsContainer}>
              {selectedDateLists.map(renderListItem)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Nenhuma lista para este dia
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push('/create')}
              >
                <Text style={styles.createButtonText}>
                  Criar Lista
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: typeof palettes.fresh.light) => StyleSheet.create({
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
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: colors.surface,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.control,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    textTransform: 'capitalize',
  },
  calendar: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  weekDayText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.muted,
    textAlign: 'center',
    width: 40,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  calendarDay: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 20,
    position: 'relative',
  },
  calendarDaySelected: {
    backgroundColor: colors.primary,
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  calendarDayText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.text,
  },
  calendarDayTextSelected: {
    color: 'white',
    fontFamily: 'Inter-SemiBold',
  },
  calendarDayTextToday: {
    color: colors.primary,
    fontFamily: 'Inter-SemiBold',
  },
  calendarDayIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayIndicatorText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  selectedDateSection: {
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 32,
  },
  selectedDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedDateTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    textTransform: 'capitalize',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.control,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listsContainer: {
    gap: 12,
  },
  listItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    flex: 1,
  },
  listCategory: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.primary,
    backgroundColor: colors.highlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  listStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemCount: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.text,
  },
  totalPrice: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: colors.success,
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.muted,
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  createButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});