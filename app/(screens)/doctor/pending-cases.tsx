import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Image,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Clock,
  RefreshCw,
  ClipboardList,
  CheckCircle2,
  XCircle,
  User,
  GraduationCap,
  Hospital,
  Stethoscope,
  Calendar,
  X,
  ImageIcon,
  ChevronRight,
  FileText,
  ChevronLeft,
  Phone,
  MapPin,
  Stethoscope as CaseIcon,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import {
  doctorDashboardService,
  CaseRequest,
  PatientCaseDto,
} from '@/features/dashboard/services/doctorDashboardService';
import {
  useDoctorRequests,
  useDoctorRequestActions,
} from '@/features/dashboard/hooks/useDoctorQueries';
import { useAppSelector } from '@/store/hooks';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const PAGE_SIZE = 20;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function formatDate(dateStr: string, locale: string) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Shared Components for Modal ───────────────────────────────────────────

function InfoCard({ 
  icon: Icon, 
  label, 
  value, 
  isDark,
  colorClass 
}: { 
  icon: any, 
  label: string, 
  value: string, 
  isDark: boolean,
  colorClass: string 
}) {
  return (
    <View className={`p-4 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
      <View className="flex-row items-center gap-2.5 mb-1.5">
        <View className={`w-7 h-7 rounded-lg items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
          <Icon size={14} className={colorClass} />
        </View>
        <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {label}
        </Text>
      </View>
      <Text className="text-sm font-bold text-slate-900 dark:text-white" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

// ─── Case Detail Modal (Refined to match Case Details style) ───────────────

interface CaseDetailModalProps {
  request: CaseRequest | null;
  onClose: () => void;
  onApprove: (requestId: string) => Promise<void>;
  onReject: (requestId: string) => Promise<void>;
  isDark: boolean;
  locale: string;
  t: (k: string, opts?: any) => string;
}

function CaseDetailModal({
  request,
  onClose,
  onApprove,
  onReject,
  isDark,
  locale,
  t,
}: CaseDetailModalProps) {
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null);

  const { data: caseDetail, isLoading: caseLoading } = useQuery<PatientCaseDto>({
    queryKey: ['case-detail-modal', request?.patientCasePublicId],
    queryFn: () => doctorDashboardService.getCaseById(request!.patientCasePublicId),
    enabled: !!request?.patientCasePublicId,
    staleTime: 2 * 60 * 1000,
  });

  const handleApprove = async () => {
    if (!request || actionLoading) return;
    setActionLoading('approve');
    try {
      await onApprove(request.id);
      onClose();
    } catch (e: any) {
      Alert.alert(t('approve'), e?.message || t('request_failed'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!request || actionLoading) return;
    setActionLoading('reject');
    try {
      await onReject(request.id);
      onClose();
    } catch (e: any) {
      Alert.alert(t('reject'), e?.message || t('request_failed'));
    } finally {
      setActionLoading(null);
    }
  };

  const imageUrls: string[] = caseDetail?.imageUrls ?? [];
  const initials = getInitials(caseDetail?.patientName ?? request?.patientName ?? '?');

  return (
    <Modal visible={!!request} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} onPress={onClose}>
        <Pressable style={{ marginTop: 'auto' }} onPress={(e) => e.stopPropagation()}>
          <View className={`rounded-t-[48px] border-t overflow-hidden ${isDark ? 'bg-[#020617] border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
            {/* Top Bar / Handle */}
            <View className="items-center pt-3 pb-1">
              <View className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
            </View>

            <View className={`flex-row items-center justify-between px-6 py-4`}>
               <Text className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[2px]">
                  {t('case_request_item')}
               </Text>
               <TouchableOpacity onPress={onClose} className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-900 items-center justify-center">
                  <X size={20} color={isDark ? '#94a3b8' : '#64748b'} />
               </TouchableOpacity>
            </View>

            <ScrollView className="max-h-[85%]" contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
              {caseLoading ? (
                <View className="py-24 items-center">
                  <ActivityIndicator size="large" color="#4f46e5" />
                  <Text className="text-slate-400 text-sm font-bold mt-4">{t('loading')}</Text>
                </View>
              ) : (
                <View className="px-6">
                  {/* Identity Section (Like CaseDetails) */}
                  <View className="flex-row items-center gap-4 mb-6 mt-2">
                    <LinearGradient
                      colors={['#3b82f6', '#4f46e5']}
                      className="w-16 h-16 rounded-[24px] items-center justify-center shadow-lg shadow-indigo-500/30"
                    >
                      <Text className="text-white font-black text-2xl">{initials}</Text>
                    </LinearGradient>
                    <View className="flex-1">
                      <Text className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                        {caseDetail?.patientName ?? request?.patientName}
                      </Text>
                      <View className="flex-row items-center gap-2 mt-1">
                         <View className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40">
                            <Text className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase">
                               {caseDetail?.status || 'Active'}
                            </Text>
                         </View>
                         <Text className="text-xs font-bold text-slate-400">
                            ID: {request?.patientCasePublicId?.slice(0, 8)}
                         </Text>
                      </View>
                    </View>
                  </View>

                  {/* Divider */}
                  <View className="h-[1px] bg-slate-200 dark:bg-slate-800 mb-6" />

                  {/* Description Card */}
                  {(request?.description || caseDetail?.diagnosisdto?.notes) && (
                    <View className={`p-5 rounded-[32px] mb-6 border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                       <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                          {t('motivation_label')}
                       </Text>
                       <Text className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-6">
                          {request?.description || caseDetail?.diagnosisdto?.notes}
                       </Text>
                    </View>
                  )}

                  {/* Info Grid (Simplified CaseDetails style) */}
                  <View className="flex-row flex-wrap justify-between gap-y-3 mb-6">
                    <View className="w-[48%]">
                      <InfoCard icon={User} label={t('age')} value={`${caseDetail?.patientAge || '?'} ${t('years_old').replace('{{age}}', '')}`} isDark={isDark} colorClass="text-blue-500" />
                    </View>
                    <View className="w-[48%]">
                      <InfoCard icon={Phone} label={t('phone_label')} value={caseDetail?.phone || "N/A"} isDark={isDark} colorClass="text-emerald-500" />
                    </View>
                    <View className="w-[48%]">
                      <InfoCard icon={MapPin} label={t('city_label')} value={caseDetail?.city || "N/A"} isDark={isDark} colorClass="text-rose-500" />
                    </View>
                    <View className="w-[48%]">
                      <InfoCard icon={Hospital} label={t('university')} value={caseDetail?.universityName || request?.university || "N/A"} isDark={isDark} colorClass="text-indigo-500" />
                    </View>
                    <View className="w-[48%]">
                      <InfoCard icon={GraduationCap} label={t('student_name')} value={request?.studentName || "N/A"} isDark={isDark} colorClass="text-cyan-500" />
                    </View>
                    <View className="w-[48%]">
                      <InfoCard icon={Calendar} label={t('sent_at')} value={formatDate(request?.createAt ?? '', locale)} isDark={isDark} colorClass="text-violet-500" />
                    </View>
                  </View>

                  {/* Images Section */}
                  {imageUrls.length > 0 && (
                    <View className="mb-6">
                      <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-4 ml-1">
                        {t('case_images')} ({imageUrls.length})
                      </Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                        {imageUrls.map((url, idx) => (
                          <Image key={idx} source={{ uri: url }} style={{ width: 140, height: 140, borderRadius: 28 }} resizeMode="cover" />
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            {/* Action Buttons (Always visible at bottom) */}
            {request?.status === 'Pending' && (
              <View className={`flex-row gap-4 px-6 pt-5 pb-12 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <TouchableOpacity 
                  onPress={handleReject} 
                  disabled={!!actionLoading} 
                  activeOpacity={0.7}
                  className={`flex-1 h-15 rounded-3xl flex-row items-center justify-center gap-2 border ${isDark ? 'bg-slate-900 border-rose-500/20' : 'bg-white border-rose-100'}`}
                >
                  {actionLoading === 'reject' ? <ActivityIndicator size={18} color="#f43f5e" /> : <XCircle size={22} color="#f43f5e" />}
                  <Text className="text-rose-600 font-black text-sm uppercase tracking-widest">{t('reject')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleApprove} 
                  disabled={!!actionLoading} 
                  activeOpacity={0.9}
                  className="flex-[1.5] h-15 rounded-3xl overflow-hidden shadow-xl shadow-indigo-500/30"
                >
                  <LinearGradient colors={['#3b82f6', '#4f46e5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="flex-1 flex-row items-center justify-center gap-2">
                    {actionLoading === 'approve' ? <ActivityIndicator size={18} color="white" /> : <CheckCircle2 size={22} color="white" />}
                    <Text className="text-white font-black text-sm uppercase tracking-widest">{t('approve')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Compact Request Card ───────────────────────────────────────────────────

function RequestCard({ request, onPress, isDark, locale, t }: { request: CaseRequest; onPress: () => void; isDark: boolean; locale: string; t: (k: string) => string }) {
  const initials = getInitials(request.studentName);

  return (
    <Animated.View entering={FadeInDown.duration(400)}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        className={`mb-4 rounded-[32px] overflow-hidden border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm shadow-slate-200/50'}`}
      >
        <View className="p-5 flex-row items-center gap-4">
          <LinearGradient colors={['#3b82f6', '#4f46e5']} className="w-15 h-15 rounded-[22px] items-center justify-center">
            <Text className="text-white font-black text-xl">{initials}</Text>
          </LinearGradient>

          <View className="flex-1">
            <View className={`flex-row items-center justify-between mb-1.5`}>
               <Text className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{t('case_request_item')}</Text>
               <Text className="text-[10px] text-slate-400 font-bold">{formatDate(request.createAt, locale)}</Text>
            </View>
            
            <Text className="text-[17px] font-black text-slate-900 dark:text-white leading-tight mb-2" numberOfLines={1}>
              {request.caseName}
            </Text>

            <View className="flex-row items-center gap-2.5">
              <Text className="text-sm font-bold text-slate-600 dark:text-slate-300" numberOfLines={1}>
                {request.studentName}
              </Text>
              <View className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <Text className="text-xs font-medium text-slate-400" numberOfLines={1}>
                {request.university}
              </Text>
            </View>
          </View>
        </View>

        <View className={`px-6 py-3.5 flex-row items-center justify-between ${isDark ? 'bg-slate-800/30' : 'bg-slate-50/70'}`}>
           <View className="flex-row items-center gap-2">
              <User size={14} color={isDark ? '#64748b' : '#94a3b8'} />
              <Text className="text-xs font-bold text-slate-500 dark:text-slate-400">{request.patientName || 'N/A'}</Text>
           </View>
           <View className="flex-row items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full">
              <View className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <Text className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">{t('status_pending')}</Text>
           </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PendingCasesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);
  const { theme, language } = useThemeLanguage();
  const isDark = theme === "dark";
  const isRtl = language === "ar";
  const locale = isRtl ? "ar-EG" : "en-GB";

  const doctorId = (user as any)?.publicId ?? (user as any)?.id;
  const queryClient = useQueryClient();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CaseRequest | null>(null);

  const { data: resData, isLoading: loading } = useDoctorRequests(doctorId, 1, PAGE_SIZE, 0);
  const { approveRequest, rejectRequest } = useDoctorRequestActions();

  const pendingRequests = resData?.items ?? [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['doctor'] });
    setRefreshing(false);
  }, [queryClient]);

  const handleApprove = useCallback(async (requestId: string) => {
    await approveRequest(requestId);
    await queryClient.invalidateQueries({ queryKey: ['doctor'] });
  }, [approveRequest, queryClient]);

  const handleReject = useCallback(async (requestId: string) => {
    await rejectRequest(requestId);
    await queryClient.invalidateQueries({ queryKey: ['doctor'] });
  }, [rejectRequest, queryClient]);

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar barStyle="light-content" />
      
      {/* Fixed Gradient Background */}
      <View className="absolute top-0 left-0 right-0 h-[280px]">
        <LinearGradient
          colors={isDark ? ['#1e1b4b', '#0f172a'] : ['#3b82f6', '#4f46e5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-full h-full rounded-b-[48px] shadow-2xl shadow-indigo-500/20"
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? "#818cf8" : "white"}
          />
        }
      >
        {/* Header Content */}
        <Animated.View entering={FadeInUp.duration(600)} className="px-6 pt-16 pb-10">
          <View className={`flex-row justify-between items-center ${isRtl ? 'flex-row-reverse' : ''}`}>
            <View className={isRtl ? 'items-end' : 'items-start'}>
              <Text className="text-white/70 font-bold text-xs uppercase tracking-[3px] mb-1">
                {t('doctor_dashboard')}
              </Text>
              <Text className="text-white text-3xl font-black" numberOfLines={1}>
                {t('pending_cases')}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.back()}
              className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md items-center justify-center"
            >
              <ChevronLeft size={24} color="white" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Content Section */}
        <View className="px-6">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <View key={i} className={`h-32 rounded-[32px] mb-4 bg-white/10`} />
            ))
          ) : pendingRequests.length === 0 ? (
            <Animated.View entering={FadeInDown.delay(200)} className="py-24 items-center bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm">
              <View className="w-24 h-24 rounded-[40px] bg-slate-50 dark:bg-slate-800 items-center justify-center mb-6">
                <ClipboardList size={40} color={isDark ? '#334155' : '#cbd5e1'} />
              </View>
              <Text className="text-xl font-black text-slate-800 dark:text-white">
                {t('no_pending_cases')}
              </Text>
              <Text className="text-sm text-slate-400 dark:text-slate-500 mt-2 text-center px-12 font-bold leading-5">
                {t('no_pending_cases_desc')}
              </Text>
            </Animated.View>
          ) : (
            pendingRequests.map((req) => (
              <RequestCard key={req.id} request={req} onPress={() => setSelectedRequest(req)} isDark={isDark} locale={locale} t={t} />
            ))
          )}
        </View>
      </ScrollView>

      <CaseDetailModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        isDark={isDark}
        locale={locale}
        t={t}
      />
    </View>
  );
}
