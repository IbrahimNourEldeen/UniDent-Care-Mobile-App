import { authService, getProfileByRole } from '@/features/auth/services/authService';
import { doctorDashboardService } from '@/features/dashboard/services/doctorDashboardService';
import { studentDashboardService } from '@/features/dashboard/services/studentDashboardService';
import { updatePatientProfile } from '@/features/patient/services/patientService';
import { updateUser } from '@/store/slices/authSlice';
import { RootState } from '@/store/store';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Award,
    Calendar,
    ChevronRight,
    CreditCard,
    Edit3,
    GraduationCap,
    HeartPulse,
    MapPin,
    Phone,
    Save,
    ShieldCheck,
    Stethoscope,
    User as UserIcon,
    X
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from 'react-redux';

const { width, height } = Dimensions.get('window');

const cityMap: Record<number, string> = {
  0: 'Cairo', 1: 'Alexandria', 2: 'Giza', 3: 'Qalyubia', 4: 'PortSaid', 5: 'Suez', 6: 'Gharbia', 7: 'Dakahlia',
  8: 'Ismailia', 9: 'Asyut', 10: 'Fayoum', 11: 'Minya', 12: 'Aswan', 13: 'Luxor', 14: 'Damietta',
  15: 'BeniSuef', 16: 'Qena', 17: 'Sohag', 18: 'Hurghada', 19: 'SharmElSheikh'
};

const InfoCard = ({ title, fields, isDark }: { title: string; fields: any[]; isDark: boolean }) => (
  <Animated.View 
    entering={FadeInUp.delay(200).duration(500)}
    className={`mb-6 p-6 rounded-[32px] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}
  >
    <Text className={`text-[11px] font-black uppercase tracking-[2px] mb-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
      {title}
    </Text>
    <View className="gap-y-5">
      {fields.map((field, idx) => (
        <View key={idx} className="flex-row items-center gap-4">
          <View className={`w-11 h-11 rounded-2xl items-center justify-center ${field.bg}`}>
            <field.icon size={20} color={field.color} strokeWidth={2.5} />
          </View>
          <View className="flex-1">
            <Text className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {field.label}
            </Text>
            <Text className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`} numberOfLines={1}>
              {field.value || '—'}
            </Text>
          </View>
        </View>
      ))}
    </View>
  </Animated.View>
);

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { theme, language } = useThemeLanguage();
  const isDark = theme === 'dark';
  const isRtl = language === 'ar';
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  
  const auth = useSelector((state: RootState) => state.auth);
  const role = auth.role || "";
  const publicId = (auth.user as any)?.publicId || "";

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const { data: profile, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['profile', role, publicId],
    queryFn: () => getProfileByRole(role, publicId),
    enabled: !!role && !!publicId,
  });

  const { data: universitiesResp } = useQuery({
    queryKey: ['universities'],
    queryFn: () => authService.getUniversitiesLookup(),
    staleTime: Infinity,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      if (role === 'Student') {
        return studentDashboardService.updateStudentProfile(publicId, data);
      } else if (role === 'Doctor' || role === 'ClinicalDoctor') {
        return doctorDashboardService.updateDoctorProfile(publicId, data);
      } else if (role === 'Patient') {
        return updatePatientProfile(publicId, data);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile', role, publicId] });
      // Update redux
      const updatedUser = { ...auth.user, ...formData };
      if (formData.fullName) (updatedUser as any).fullName = formData.fullName;
      if (formData.name) (updatedUser as any).name = formData.name;
      dispatch(updateUser(updatedUser as any));
      
      setIsEditModalVisible(false);
      Alert.alert(isRtl ? "نجاح" : "Success", t('profile_updated'));
    },
    onError: (error: any) => {
      Alert.alert(isRtl ? "خطأ" : "Error", t('profile_update_failed'));
    }
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || profile.name || '',
        name: profile.name || profile.fullName || '',
        phoneNumber: profile.phone || profile.phoneNumber || '',
        phone: profile.phone || profile.phoneNumber || '',
        specialty: profile.specialty || '',
        level: profile.level || 1,
        nationalId: profile.nationalId || '',
        gender: profile.gender ?? 0,
        city: profile.city ?? 0,
      });
    }
  }, [profile]);

  if (isLoading) {
    return (
      <View className={`flex-1 items-center justify-center ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  const getUniversityName = () => {
    const uniId = profile?.universityId || profile?.university;
    if (uniId && universitiesResp?.data) {
      const match = universitiesResp.data.find((u: any) => u.id === uniId || u.id === String(uniId));
      if (match) return match.name;
    }
    return profile?.university || '—';
  };

  const getGenderText = (gender?: number) => {
    if (gender === 0) return isRtl ? "ذكر" : "Male";
    if (gender === 1) return isRtl ? "أنثى" : "Female";
    return "—";
  };

  const getCityName = (cityValue?: number) => {
    if (cityValue === undefined || cityValue === null) return "—";
    return cityMap[cityValue] || "—";
  };

  const personalFields = [
    { icon: Phone, bg: 'bg-blue-50 dark:bg-blue-900/20', color: '#3b82f6', label: t('phone'), value: profile?.phone || profile?.phoneNumber },
    { icon: CreditCard, bg: 'bg-indigo-50 dark:bg-indigo-900/20', color: '#6366f1', label: isRtl ? "الرقم القومي" : "National ID", value: profile?.nationalId },
    { icon: Calendar, bg: 'bg-amber-50 dark:bg-amber-900/20', color: '#f59e0b', label: t('age'), value: profile?.age ? `${profile.age} ${isRtl ? "سنة" : "years old"}` : (profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : null) },
    { icon: HeartPulse, bg: 'bg-rose-50 dark:bg-rose-900/20', color: '#f43f5e', label: isRtl ? "الجنس" : "Gender", value: getGenderText(profile?.gender) },
    { icon: MapPin, bg: 'bg-teal-50 dark:bg-teal-900/20', color: '#14b8a6', label: isRtl ? "المدينة" : "City", value: getCityName(profile?.city) },
  ];

  const academicFields = [
    { icon: GraduationCap, bg: 'bg-indigo-50 dark:bg-indigo-900/20', color: '#6366f1', label: t('university'), value: getUniversityName() },
    { icon: Award, bg: 'bg-purple-50 dark:bg-purple-900/20', color: '#a855f7', label: t('level'), value: profile?.level ? `${isRtl ? "المستوى" : "Level"} ${profile.level}` : null },
  ];

  const professionalFields = [
    { icon: Stethoscope, bg: 'bg-blue-50 dark:bg-blue-900/20', color: '#3b82f6', label: t('specialty'), value: profile?.specialty || (isRtl ? "طبيب عام" : "General Doctor") },
    { icon: GraduationCap, bg: 'bg-indigo-50 dark:bg-indigo-900/20', color: '#6366f1', label: t('university'), value: getUniversityName() },
    { icon: ShieldCheck, bg: 'bg-emerald-50 dark:bg-emerald-900/20', color: '#10b981', label: isRtl ? "اسم المستخدم" : "Username", value: profile?.userName || profile?.username },
  ];

  const roleColors = {
    Patient: ['#0d9488', '#0f766e'], // Teal
    Student: ['#4f46e5', '#4338ca'], // Indigo
    Doctor: ['#2563eb', '#1d4ed8'],  // Blue
    ClinicalDoctor: ['#2563eb', '#1d4ed8'],
  };

  const currentRoleColors = (roleColors as any)[role] || roleColors.Student;

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#4f46e5" />}
      >
        {/* Header Section */}
        <LinearGradient
          colors={currentRoleColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingBottom: 40, borderBottomLeftRadius: 48, borderBottomRightRadius: 48 }}
        >
          <SafeAreaView>
            <View className="px-6 pt-4 flex-row justify-between items-center">
              <TouchableOpacity className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                <ChevronRight size={20} color="white" style={{ transform: [{ rotate: isRtl ? '0deg' : '180deg' }] }} />
              </TouchableOpacity>
              <Text className="text-lg font-black text-white uppercase tracking-widest">{t('profile')}</Text>
              <TouchableOpacity 
                onPress={() => setIsEditModalVisible(true)}
                className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
              >
                <Edit3 size={20} color="white" />
              </TouchableOpacity>
            </View>

            <View className="items-center mt-6">
              <Animated.View 
                entering={FadeInDown.duration(600)}
                className="relative"
              >
                <View className="w-32 h-32 rounded-[40px] bg-white p-1 shadow-2xl">
                   <View className="w-full h-full rounded-[36px] bg-slate-100 items-center justify-center overflow-hidden">
                      <UserIcon size={64} color={currentRoleColors[0]} strokeWidth={1.5} />
                   </View>
                </View>
                <View className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full border-4 border-white items-center justify-center">
                   <ShieldCheck size={18} color="white" />
                </View>
              </Animated.View>

              <Text className="text-2xl font-black text-white mt-5 tracking-tight">
                {profile?.fullName || profile?.name || '—'}
              </Text>
              
              <View className="flex-row items-center mt-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30">
                 <Text className="text-[10px] font-black text-white uppercase tracking-[2px]">
                   {role === 'ClinicalDoctor' ? (isRtl ? 'طبيب إكلينيكي' : 'Clinical Doctor') : (isRtl ? t(role.toLowerCase()) : role)}
                 </Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Content Section */}
        <View className="px-6 -mt-8 z-10">
          {role === 'Patient' && (
            <InfoCard 
              title={isRtl ? "المعلومات الشخصية" : "Personal Information"} 
              fields={personalFields} 
              isDark={isDark} 
            />
          )}

          {role === 'Student' && (
            <>
              <InfoCard 
                title={isRtl ? "المعلومات الأكاديمية" : "Academic Information"} 
                fields={academicFields} 
                isDark={isDark} 
              />
              <InfoCard 
                title={isRtl ? "المعلومات الشخصية" : "Personal Information"} 
                fields={personalFields.filter(f => f.label !== t('age') && f.label !== (isRtl ? "الجنس" : "Gender"))} 
                isDark={isDark} 
              />
            </>
          )}

          {(role === 'Doctor' || role === 'ClinicalDoctor') && (
            <>
              <InfoCard 
                title={isRtl ? "المعلومات المهنية" : "Professional Information"} 
                fields={professionalFields} 
                isDark={isDark} 
              />
              <InfoCard 
                title={isRtl ? "المعلومات الشخصية" : "Personal Information"} 
                fields={personalFields.filter(f => f.label !== t('age') && f.label !== (isRtl ? "الجنس" : "Gender") && f.label !== (isRtl ? "المدينة" : "City"))} 
                isDark={isDark} 
              />
            </>
          )}
          
          <View className="h-20" />
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <Animated.View 
            entering={SlideInDown.duration(400)}
            exiting={SlideOutDown.duration(300)}
            className={`w-full max-h-[85%] rounded-t-[48px] ${isDark ? 'bg-slate-900' : 'bg-white'}`}
          >
            <View className="p-8 pb-4 flex-row justify-between items-center">
               <View>
                  <Text className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('edit_profile')}</Text>
                  <Text className={`text-xs font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'} mt-1`}>Update your personal details</Text>
               </View>
               <TouchableOpacity 
                 onPress={() => setIsEditModalVisible(false)}
                 className={`w-10 h-10 rounded-full items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
               >
                  <X size={20} color={isDark ? '#94a3b8' : '#64748b'} />
               </TouchableOpacity>
            </View>

            <ScrollView className="px-8" showsVerticalScrollIndicator={false}>
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View className="py-6 gap-y-6">
                  
                  {/* Common: Full Name */}
                  <View>
                    <Text className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {t('name')}
                    </Text>
                    <View className={`flex-row items-center px-4 py-3.5 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <UserIcon size={18} color="#94a3b8" />
                      <TextInput 
                        value={formData.fullName}
                        onChangeText={(t) => setFormData({...formData, fullName: t, name: t})}
                        className={`flex-1 ml-3 text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
                        placeholder={t('name')}
                        placeholderTextColor="#64748b"
                      />
                    </View>
                  </View>

                  {/* Patient Only: Phone, NationalID, Gender, City */}
                  {role === 'Patient' && (
                    <>
                      <View>
                        <Text className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {t('phone')}
                        </Text>
                        <View className={`flex-row items-center px-4 py-3.5 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                          <Phone size={18} color="#94a3b8" />
                          <TextInput 
                            value={formData.phoneNumber}
                            onChangeText={(t) => setFormData({...formData, phoneNumber: t, phone: t})}
                            keyboardType="phone-pad"
                            className={`flex-1 ml-3 text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
                            placeholder="01xxxxxxxxx"
                            placeholderTextColor="#64748b"
                          />
                        </View>
                      </View>

                      <View>
                        <Text className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {isRtl ? "الرقم القومي" : "National ID"}
                        </Text>
                        <View className={`flex-row items-center px-4 py-3.5 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                          <CreditCard size={18} color="#94a3b8" />
                          <TextInput 
                            value={formData.nationalId}
                            onChangeText={(t) => setFormData({...formData, nationalId: t})}
                            keyboardType="numeric"
                            maxLength={14}
                            className={`flex-1 ml-3 text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
                            placeholder="14 digits"
                            placeholderTextColor="#64748b"
                          />
                        </View>
                      </View>

                      <View className="flex-row gap-x-4">
                        <View className="flex-1">
                          <Text className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {isRtl ? "الجنس" : "Gender"}
                          </Text>
                          <View className="flex-row gap-x-2">
                             {[0, 1].map(g => (
                               <TouchableOpacity 
                                 key={g}
                                 onPress={() => setFormData({...formData, gender: g})}
                                 className={`flex-1 py-3.5 rounded-2xl border items-center ${formData.gender === g ? 'bg-indigo-600 border-indigo-600' : (isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200')}`}
                               >
                                  <Text className={`font-bold ${formData.gender === g ? 'text-white' : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>
                                    {getGenderText(g)}
                                  </Text>
                               </TouchableOpacity>
                             ))}
                          </View>
                        </View>
                      </View>
                    </>
                  )}

                  {/* Student Only: Level */}
                  {role === 'Student' && (
                    <View>
                      <Text className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {t('level')}
                      </Text>
                      <View className={`flex-row items-center px-4 py-3.5 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <Award size={18} color="#94a3b8" />
                        <TextInput 
                          value={formData.level?.toString()}
                          onChangeText={(t) => setFormData({...formData, level: parseInt(t) || 1})}
                          keyboardType="numeric"
                          className={`flex-1 ml-3 text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
                          placeholder="1-10"
                          placeholderTextColor="#64748b"
                        />
                      </View>
                    </View>
                  )}

                  {/* Doctor Only: Specialty */}
                  {(role === 'Doctor' || role === 'ClinicalDoctor') && (
                    <View>
                      <Text className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {t('specialty')}
                      </Text>
                      <View className={`flex-row items-center px-4 py-3.5 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <Stethoscope size={18} color="#94a3b8" />
                        <TextInput 
                          value={formData.specialty}
                          onChangeText={(t) => setFormData({...formData, specialty: t})}
                          className={`flex-1 ml-3 text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
                          placeholder="e.g. Endodontics"
                          placeholderTextColor="#64748b"
                        />
                      </View>
                    </View>
                  )}

                </View>
              </KeyboardAvoidingView>
            </ScrollView>

            <View className="p-8 pt-4">
               <TouchableOpacity 
                 onPress={handleSave}
                 disabled={updateMutation.isPending}
                 className="w-full h-16 rounded-3xl bg-indigo-600 flex-row items-center justify-center shadow-xl shadow-indigo-500/30"
               >
                 {updateMutation.isPending ? (
                   <ActivityIndicator color="white" />
                 ) : (
                   <>
                     <Save size={20} color="white" strokeWidth={2.5} />
                     <Text className="text-white font-black text-lg ml-3">{t('save_changes')}</Text>
                   </>
                 )}
               </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}
