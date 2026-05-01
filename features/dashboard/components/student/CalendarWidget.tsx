import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { CheckCircle, Clock, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { LocaleConfig, Calendar as RNCalendar } from 'react-native-calendars';
import { useStudentDashboardData } from '../../hooks/useStudentDashboardData';

// Set up locale configuration
LocaleConfig.locales['ar'] = {
  monthNames: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  monthNamesShort: ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول', 'أغس', 'سبت', 'أكت', 'نوف', 'ديس'],
  dayNames: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  dayNamesShort: ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'],
  today: 'اليوم'
};
LocaleConfig.locales['en'] = {
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  today: 'Today'
};

export default function CalendarWidget() {
  const { theme, language } = useThemeLanguage();
  const isDark = theme === 'dark';
  const isRtl = language === 'ar';
  
  // Apply locale
  LocaleConfig.defaultLocale = language === 'ar' ? 'ar' : 'en';

  const { sessions } = useStudentDashboardData();
  const { data, isLoading, isError } = sessions;

  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Map events to react-native-calendars format
  const markedDates: any = {};
  const eventsByDate: any = {};

  if (data?.data?.items) {
    data.data.items.forEach((event: any) => {
      // Assuming event.scheduledAt is ISO format e.g., "2023-10-15T14:30:00Z"
      const dateString = event.scheduledAt.split('T')[0];
      
      if (!eventsByDate[dateString]) {
        eventsByDate[dateString] = [];
      }
      eventsByDate[dateString].push(event);

      markedDates[dateString] = {
        marked: true,
        dotColor: '#4f46e5', // indigo-600
        activeOpacity: 0.8,
      };
    });
  }

  const handleDayPress = (day: any) => {
    const dateEvents = eventsByDate[day.dateString];
    if (dateEvents && dateEvents.length > 0) {
      // For simplicity, just pick the first event on that day if there are multiple
      // You could improve this by showing a list of events for the day
      setSelectedEvent(dateEvents[0]);
      setIsModalVisible(true);
    }
  };

  const themeConfig = {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    calendarBackground: isDark ? '#0f172a' : '#ffffff',
    textSectionTitleColor: isDark ? '#94a3b8' : '#64748b',
    selectedDayBackgroundColor: '#4f46e5',
    selectedDayTextColor: '#ffffff',
    todayTextColor: '#4f46e5',
    dayTextColor: isDark ? '#f8fafc' : '#0f172a',
    textDisabledColor: isDark ? '#334155' : '#cbd5e1',
    dotColor: '#4f46e5',
    selectedDotColor: '#ffffff',
    arrowColor: '#4f46e5',
    monthTextColor: isDark ? '#f8fafc' : '#0f172a',
    indicatorColor: '#4f46e5',
    textDayFontWeight: '500' as const,
    textMonthFontWeight: 'bold' as const,
    textDayHeaderFontWeight: '600' as const,
    textDayFontSize: 14,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 12,
  };

  if (isError) {
    return (
      <View className={`rounded-2xl border p-6 flex items-center justify-center min-h-[300px] ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
        <Text className="text-red-500 font-medium">
          {isRtl ? "حدث خطأ في تحميل التقويم" : "Failed to load calendar"}
        </Text>
      </View>
    );
  }

  return (
    <View className={`rounded-2xl border mb-8 overflow-hidden shadow-sm ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
      {/* Glow effect background (simulated using border/colors in RN) */}
      
      <View className="p-2 sm:p-4">
        {isLoading ? (
          <View className="min-h-[350px] p-4 gap-6">
            <View className={`flex-row justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
              <View className={`h-8 w-32 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
              <View className={`h-8 w-24 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
            </View>
            <View className={`flex-1 rounded-2xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`} />
          </View>
        ) : (
          <RNCalendar
            theme={themeConfig}
            markedDates={markedDates}
            onDayPress={handleDayPress}
            firstDay={isRtl ? 6 : 0} // Start week on Saturday for RTL (Arabic), Sunday for LTR
            renderHeader={(date: any) => {
              const month = date.toString('MMMM yyyy');
              return (
                <Text className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {month}
                </Text>
              );
            }}
          />
        )}
      </View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <View className={`w-full max-w-[400px] rounded-2xl overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            <View className={`px-6 py-5 border-b ${isDark ? 'bg-indigo-950/20 border-slate-800' : 'bg-indigo-50/50 border-slate-100'}`}>
              <View className={`flex-row justify-between items-start ${isRtl ? 'flex-row-reverse' : ''}`}>
                <View className={`flex-1 ${isRtl ? 'items-end' : 'items-start'}`}>
                  <Text className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                    {isRtl ? "تفاصيل الجلسة" : "Session Details"}
                  </Text>
                  <Text className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'} ${isRtl ? 'text-right' : 'text-left'}`}>
                    {isRtl ? "استعرض تفاصيل هذه الجلسة والمهام المتاحة." : "View the details of this session and available actions."}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setIsModalVisible(false)} className="p-1">
                  <X size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                </TouchableOpacity>
              </View>
            </View>

            <View className="px-6 py-6 gap-5">
              {selectedEvent && (
                <>
                  <View className={`gap-1.5 ${isRtl ? 'items-end' : 'items-start'}`}>
                    <Text className={`text-[11px] uppercase tracking-wider font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {isRtl ? "اسم المريض" : "Patient Name"}
                    </Text>
                    <Text className={`text-lg font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                      {selectedEvent.patientName}
                    </Text>
                  </View>

                  <View className={`gap-1.5 ${isRtl ? 'items-end' : 'items-start'}`}>
                    <Text className={`text-[11px] uppercase tracking-wider font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {isRtl ? "نوع العلاج" : "Treatment Type"}
                    </Text>
                    <Text className={`text-base font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {selectedEvent.treatmentType}
                    </Text>
                  </View>

                  <View className={`gap-1.5 ${isRtl ? 'items-end' : 'items-start'}`}>
                    <Text className={`text-[11px] uppercase tracking-wider font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {isRtl ? "الوقت" : "Time"}
                    </Text>
                    <View className={`flex-row items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <Clock size={16} color={isDark ? '#818cf8' : '#4f46e5'} />
                      <Text className={`text-base font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        {new Date(selectedEvent.scheduledAt).toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        {new Date(selectedEvent.endAt).toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>

            <View className={`p-4 border-t flex-row gap-3 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'} ${isRtl ? 'flex-row-reverse' : ''}`}>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                className={`flex-1 py-3 px-4 rounded-xl border flex-row justify-center items-center gap-2 ${isDark ? 'border-slate-700 bg-transparent' : 'border-slate-200 bg-white'} ${isRtl ? 'flex-row-reverse' : ''}`}
              >
                <Clock size={16} color={isDark ? '#e2e8f0' : '#475569'} />
                <Text className={`font-semibold text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  {isRtl ? "إعادة جدولة" : "Reschedule"}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                className={`flex-1 py-3 px-4 rounded-xl flex-row justify-center items-center gap-2 ${isDark ? 'bg-indigo-600' : 'bg-indigo-600'} ${isRtl ? 'flex-row-reverse' : ''}`}
              >
                <CheckCircle size={16} color="#ffffff" />
                <Text className="font-semibold text-sm text-white">
                  {isRtl ? "تأكيد الجلسة" : "Confirm Session"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
