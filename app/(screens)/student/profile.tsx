import { useUniversities } from '@/features/dashboard/hooks/useDoctorQueries';
import { useStudentProfile, useUpdateStudentProfile } from '@/features/dashboard/hooks/useStudentQueries';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout, updateUser } from '@/store/slices/authSlice';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Calendar,
  Edit3,
  GraduationCap,
  Mail,
  Save,
  University,
  X
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  I18nManager,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({ icon, label, value, isDark }: { icon: React.ReactNode; label: string; value: string; isDark: boolean }) {
  return (
    <View className="flex-row items-start gap-3 px-5 py-3.5 border-b border-slate-50 dark:border-slate-800/60">
      <View className="mt-0.5 w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 items-center justify-center">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</Text>
        <Text className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5" selectable>{value}</Text>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function StudentProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { theme } = useThemeLanguage();
  const isDark = theme === 'dark';
  const isRtl = I18nManager.isRTL;

  const studentId = (user as any)?.publicId ?? (user as any)?.id;
  const queryClient = useQueryClient();

  // Use React Query hooks
  const { data: profile, isLoading: profileLoading } = useStudentProfile(studentId);
  const { data: universities = [] } = useUniversities();
  const { mutateAsync: updateProfile, isPending: saving } = useUpdateStudentProfile(studentId);

  const [editing, setEditing] = useState(false);

  // Still use local state for edits
  const [editFullName, setEditFullName] = useState('');
  const [editLevel, setEditLevel] = useState('');

  // Sync edit state with profile data periodically or on load
  useEffect(() => {
    if (profile) {
      setEditFullName(profile.fullName ?? '');
      setEditLevel(profile.level?.toString() ?? '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!studentId || !profile) return;
    try {
      const levelNum = parseInt(editLevel);
      if (isNaN(levelNum)) {
        Alert.alert('', t('invalid_level'));
        return;
      }

      await updateProfile({
        fullName: editFullName.trim(),
        level: levelNum,
      });
      
      // Update Redux state
      if (user) {
        dispatch(updateUser({
          ...user,
          fullName: editFullName.trim(),
          level: levelNum,
        } as any));
      }

      setEditing(false);
      Alert.alert('', t('profile_updated'));
    } catch (e) {
      Alert.alert('', t('profile_update_failed'));
    }
  };

  const onRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['student', 'profile'] });
  };

  const handleLogout = () => {
    Alert.alert(t('logout'), t('logout_confirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('logout'), style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  const loading = profileLoading || !profile;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color={isDark ? '#818cf8' : '#4f46e5'} />
      </SafeAreaView>
    );
  }

  const initials = profile.fullName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  const joinDate = new Date(profile.createAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
          {/* Header */}
          <LinearGradient
            colors={isDark ? ['#1e1b4b', '#0f172a'] : ['#4f46e5', '#6366f1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="pt-6 pb-10 px-6"
          >
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-white/70 text-xs font-bold uppercase tracking-widest">{t('profile')}</Text>
              <View className="flex-row gap-2">
                {!editing ? (
                  <TouchableOpacity
                    onPress={() => setEditing(true)}
                    className="flex-row items-center gap-1.5 px-3 py-2 bg-white/15 rounded-xl"
                  >
                    <Edit3 size={14} color="white" />
                    <Text className="text-white text-xs font-bold">{t('edit_profile')}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => setEditing(false)} className="p-2 bg-white/15 rounded-xl">
                    <X size={16} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Avatar */}
            <View className="items-center">
              <View className="w-24 h-24 rounded-3xl bg-white/20 items-center justify-center mb-4 shadow-xl shadow-black/20">
                <Text className="text-white text-3xl font-black">{initials}</Text>
              </View>
              {editing ? (
                <TextInput
                  value={editFullName}
                  onChangeText={setEditFullName}
                  className="text-white font-black text-xl text-center border-b border-white/40 pb-1 min-w-48"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  placeholder={t('name')}
                  style={{ writingDirection: isRtl ? 'rtl' : 'ltr' }}
                />
              ) : (
                <Text className="text-white text-2xl font-black">{profile.fullName}</Text>
              )}
              
            </View>
          </LinearGradient>

          <View className="mb-6" />

          {/* Info Card */}
          <View className="mx-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none mb-5 overflow-hidden">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-5 pt-5 pb-3">
              {t('student_info')}
            </Text>
            <InfoRow icon={<Mail size={14} color={isDark ? '#818cf8' : '#4f46e5'} />} label={t('email')} value={profile.email} isDark={isDark} />
            <InfoRow icon={<GraduationCap size={14} color={isDark ? '#818cf8' : '#4f46e5'} />} label={t('level')} value={profile.level?.toString()} isDark={isDark} />
            <InfoRow 
              icon={<University size={14} color={isDark ? '#818cf8' : '#4f46e5'} />} 
              label={t('university')} 
              value={universities.find(u => u.id === profile.universityId)?.name || profile.university || profile.universityId} 
              isDark={isDark} 
            />
            <View className="border-b-0">
              <InfoRow icon={<Calendar size={14} color={isDark ? '#818cf8' : '#4f46e5'} />} label={t('submitted_on')} value={joinDate} isDark={isDark} />
            </View>
          </View>

          {/* Save button (when editing) */}
          {editing && (
            <View className="px-5 mb-5">
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className="rounded-2xl overflow-hidden shadow-md shadow-indigo-200 dark:shadow-none"
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#6366f1', '#4f46e5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="flex-row items-center justify-center gap-2 py-4"
                >
                  {saving ? (
                    <ActivityIndicator size={16} color="white" />
                  ) : (
                    <Save size={16} color="white" />
                  )}
                  <Text className="text-white font-black text-sm">{saving ? t('updating') : t('save_changes')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
