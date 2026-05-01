import { Building2, Calendar, GraduationCap, Mail, Phone, Stethoscope, User as UserIcon } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppSelector } from '../../store/hooks';
import { useThemeLanguage } from '../../store/ThemeLanguageContext';
import { DoctorUser, PatientUser, StudentUser } from '../../types/types';

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | undefined }) => {
  return (
    <View className="flex-row items-center py-4 border-b border-gray-100 dark:border-slate-700/50 last:border-0">
      <View className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-700/50 items-center justify-center mr-4">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-0.5">{label}</Text>
        <Text className="text-base font-semibold text-gray-800 dark:text-gray-200">{value || '---'}</Text>
      </View>
    </View>
  );
};

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, role } = useAppSelector((state) => state.auth);
  const { theme } = useThemeLanguage();

  const isDark = theme === 'dark';

  if (!user) return null;

  const renderPatientData = (userData: PatientUser) => (
    <>
      <InfoRow icon={<Phone size={20} color={isDark ? '#94a3b8' : '#3b82f6'} />} label={t('phone')} value={userData.phone} />
      <InfoRow icon={<Calendar size={20} color={isDark ? '#94a3b8' : '#3b82f6'} />} label={t('age')} value={userData.age?.toString()} />
    </>
  );

  const renderStudentData = (userData: StudentUser) => (
    <>
      <InfoRow icon={<Building2 size={20} color={isDark ? '#94a3b8' : '#3b82f6'} />} label={t('universityName')} value={userData.university} />
      <InfoRow icon={<GraduationCap size={20} color={isDark ? '#94a3b8' : '#3b82f6'} />} label={t('level')} value={userData.level?.toString()} />
    </>
  );

  const renderDoctorData = (userData: DoctorUser) => (
    <>
      <InfoRow icon={<Stethoscope size={20} color={isDark ? '#94a3b8' : '#3b82f6'} />} label={t('specialty')} value={userData.specialty} />
      <InfoRow icon={<Building2 size={20} color={isDark ? '#94a3b8' : '#3b82f6'} />} label={t('universityId')} value={userData.universityId} />
    </>
  );

  const renderRoleSpecificData = () => {
    switch (role?.toLowerCase()) {
      case 'patient':
        return renderPatientData(user as PatientUser);
      case 'student':
        return renderStudentData(user as StudentUser);
      case 'doctor':
        return renderDoctorData(user as DoctorUser);
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="p-6 pt-8 bg-blue-600 dark:bg-slate-800 rounded-b-[40px] shadow-lg">
          <Text className="text-2xl font-bold text-white mb-6 text-center">
            {t('profile')}
          </Text>
          <View className="items-center">
            <View className="w-28 h-28 bg-white dark:bg-slate-700 rounded-full items-center justify-center mb-4 shadow-xl border-4 border-white/20">
              <UserIcon size={50} color={isDark ? '#e2e8f0' : '#2563eb'} />
            </View>
            <Text className="text-2xl font-bold text-white mb-1">
              {user.fullName || (user as DoctorUser).name || t('name')}
            </Text>
            <View className="flex-row items-center mb-3">
              <Mail size={16} color="#bfdbfe" />
              <Text className="text-sm text-blue-100 dark:text-slate-400 ml-2">
                {user.email || t('email')}
              </Text>
            </View>
            <View className="bg-white/20 dark:bg-slate-700 px-5 py-1.5 rounded-full">
              <Text className="text-xs font-bold text-white uppercase tracking-widest">
                {role || t('role')}
              </Text>
            </View>
          </View>
        </View>

        <View className="p-6 mt-2">
          <Text className="text-lg font-bold text-gray-800 dark:text-white mb-4 ml-1">
            {t('profile')}
          </Text>
          <View className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
            {renderRoleSpecificData()}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
