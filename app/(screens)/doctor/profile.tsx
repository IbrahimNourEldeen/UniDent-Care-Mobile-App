import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Mail,
  Stethoscope,
  University,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  Edit3,
  X,
  Save,
  LogOut,
  Settings,
  RefreshCw,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { useRouter } from 'expo-router';
import { logout, updateUser } from '@/store/slices/authSlice';
import { authService } from '@/features/auth/services/authService';
import { UniversityLookup } from '@/types/types';
import { useDoctorProfile, useUpdateDoctorProfile, useUniversities } from '@/features/dashboard/hooks/useDoctorQueries';
import { useQueryClient } from '@tanstack/react-query';

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ value, label, color, isDark }: { value: number; label: string; color: string; isDark: boolean }) {
  return (
    <View className="flex-1 items-center bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4">
      <Text style={{ color }} className="text-3xl font-black">{value}</Text>
      <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 text-center uppercase tracking-wider" numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

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

export default function DoctorProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { theme } = useThemeLanguage();
  const isDark = theme === 'dark';
  const isRtl = I18nManager.isRTL;

  const doctorId = (user as any)?.publicId ?? (user as any)?.id;
  const queryClient = useQueryClient();

  // Use React Query hooks
  const { data: profile, isLoading: profileLoading } = useDoctorProfile(doctorId);
  const { data: universities = [] } = useUniversities();
  const { mutateAsync: updateProfile, isPending: saving } = useUpdateDoctorProfile(doctorId);

  const [editing, setEditing] = useState(false);

  // Still use local state for edits
  const [editFullName, setEditFullName] = useState('');
  const [editSpecialty, setEditSpecialty] = useState('');

  // Sync edit state with profile data periodically or on load
  useEffect(() => {
    if (profile) {
      setEditFullName(profile.fullName ?? '');
      setEditSpecialty(profile.specialty ?? '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!doctorId || !profile) return;
    try {
      await updateProfile({
        fullName: editFullName.trim(),
        specialty: editSpecialty.trim(),
      });
      
      // Update Redux state
      if (user) {
        dispatch(updateUser({
          ...user,
          fullName: editFullName.trim(),
          specialty: editSpecialty.trim(),
        } as any));
      }

      setEditing(false);
      Alert.alert('', t('profile_updated'));
    } catch (e) {
      Alert.alert('', t('profile_update_failed'));
    }
  };

  const onRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['doctor', 'profile'] });
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

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950 items-center justify-center">
        <Text className="text-slate-400 dark:text-slate-500 font-bold">{t('load_error')}</Text>
        <TouchableOpacity onPress={onRefresh} className="mt-4 px-6 py-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex-row items-center gap-2">
          <RefreshCw size={14} color={isDark ? '#818cf8' : '#4f46e5'} />
          <Text className="text-indigo-600 dark:text-indigo-400 font-black text-sm">{t('retry')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const initials = profile.fullName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  const joinDate = new Date(profile.createAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
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
              <View className="flex-row items-center gap-2 mt-2">
                <View className="bg-white/20 px-3 py-1 rounded-full">
                  <Text className="text-white/90 text-xs font-bold">
                    {editing ? (
                      <TextInput
                        value={editSpecialty}
                        onChangeText={setEditSpecialty}
                        className="text-white text-xs font-bold"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        placeholder={t('specialty')}
                        style={{ writingDirection: isRtl ? 'rtl' : 'ltr', minWidth: 100 }}
                      />
                    ) : (
                      profile.specialty
                    )}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Stats Row REMOVED as per request */}
          <View className="mb-6" />

          {/* Info Card */}
          <View className="mx-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none mb-5 overflow-hidden">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-5 pt-5 pb-3">
              {t('patient_info')}
            </Text>
            <InfoRow icon={<Mail size={14} color={isDark ? '#818cf8' : '#4f46e5'} />} label={t('email')} value={profile.email} isDark={isDark} />
            <InfoRow icon={<Stethoscope size={14} color={isDark ? '#818cf8' : '#4f46e5'} />} label={t('specialty')} value={profile.specialty} isDark={isDark} />
            <InfoRow 
              icon={<University size={14} color={isDark ? '#818cf8' : '#4f46e5'} />} 
              label={t('university')} 
              value={universities.find(u => u.id === profile.universityId)?.name || profile.universityId} 
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

          {/* Actions Card (Settings/Logout) REMOVED as per request */}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
