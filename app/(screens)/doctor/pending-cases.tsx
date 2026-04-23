import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ClipboardList,
  FileText,
  User,
  GraduationCap,
  Hospital,
  BookOpen,
  Stethoscope,
  Calendar,
  Info,
  X,
  ChevronRight,
  MessageSquare,
  Quote,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import {
  doctorDashboardService,
  CaseRequest,
  PaginatedRequests,
} from '@/features/dashboard/services/doctorDashboardService';
import { useDoctorRequests, useDoctorRequestActions } from '@/features/dashboard/hooks/useDoctorQueries';
import { useQueryClient } from '@tanstack/react-query';

const PAGE_SIZE = 12;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStatusStyle(status: string, isDark: boolean) {
  switch (status.toLowerCase()) {
    case 'approved':
      return {
        bg: isDark ? '#064e3b' : '#d1fae5',
        text: isDark ? '#34d399' : '#065f46',
        bar: '#34d399',
        icon: 'approved',
      };
    case 'rejected':
      return {
        bg: isDark ? '#450a0a' : '#fee2e2',
        text: isDark ? '#f87171' : '#991b1b',
        bar: '#f87171',
        icon: 'rejected',
      };
    default:
      return {
        bg: isDark ? '#451a03' : '#fef3c7',
        text: isDark ? '#fbbf24' : '#92400e',
        bar: '#fbbf24',
        icon: 'pending',
      };
  }
}

function StatusIcon({ type, size = 13, color }: { type: string; size?: number; color: string }) {
  if (type === 'approved') return <CheckCircle2 size={size} color={color} />;
  if (type === 'rejected') return <XCircle size={size} color={color} />;
  return <Clock size={size} color={color} />;
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function PendingCasesScreen() {
  const { t } = useTranslation();
  const { user } = useAppSelector((s) => s.auth);
  const { theme, language } = useThemeLanguage();
  const isDark = theme === 'dark';
  const isRtl = I18nManager.isRTL;
  const locale = language === 'ar' ? 'ar-EG' : 'en-GB';

  const doctorId = (user as any)?.publicId ?? (user as any)?.id;

  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReq, setSelectedReq] = useState<CaseRequest | null>(null);

  // Use React Query hooks
  const { data: resData, isLoading: loading } = useDoctorRequests(doctorId, currentPage, PAGE_SIZE);
  const { approveRequest, rejectRequest } = useDoctorRequestActions();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const requests = resData?.items.filter(req => req.status === 'Pending') || [];
  const pagination = resData ? { ...resData, totalCount: requests.length } : null;

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['doctor', 'requests'] });
    setRefreshing(false);
  };

  const handleApprove = async (id: string) => {
    if (actionLoading) return;
    setActionLoading(id);
    try {
      await approveRequest(id);
      if (selectedReq?.id === id) {
        setSelectedReq({ ...selectedReq, status: 'Approved' });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (actionLoading) return;
    setActionLoading(id);
    try {
      await rejectRequest(id);
      if (selectedReq?.id === id) {
        setSelectedReq({ ...selectedReq, status: 'Rejected' });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? '#fbbf24' : '#d97706'}
          />
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center gap-3 flex-1">
            <View className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-2xl">
              <Clock size={24} color={isDark ? '#fbbf24' : '#d97706'} strokeWidth={2.5} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-black text-slate-800 dark:text-white">
                {t('pending_cases')}
              </Text>
              <Text className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5" numberOfLines={1}>
                {pagination
                  ? t('total_requests_label', { count: pagination.totalCount })
                  : t('loading')}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={onRefresh}
            className="p-2.5 rounded-xl"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {loading ? (
              <ActivityIndicator size={18} color={isDark ? '#94a3b8' : '#64748b'} />
            ) : (
              <RefreshCw size={18} color={isDark ? '#94a3b8' : '#64748b'} />
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <View
              key={i}
              className="h-52 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 mb-4 animate-pulse"
            />
          ))
        ) : requests.length === 0 ? (
          <View className="py-24 items-center">
            <View className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center mb-5">
              <ClipboardList size={36} color={isDark ? '#334155' : '#cbd5e1'} />
            </View>
            <Text className="text-base font-bold text-slate-500 dark:text-slate-400">
              {t('no_pending_cases')}
            </Text>
            <Text className="text-sm text-slate-400 dark:text-slate-500 mt-1 text-center px-8">
              {t('no_pending_cases_desc')}
            </Text>
          </View>
        ) : (
          requests.map((req) => {
            const s = getStatusStyle(req.status, isDark);
            const isPending = req.status === 'Pending';
            const isLoading = actionLoading === req.id;
            const initials = req.studentName.split(' ').filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2);

            return (
              <TouchableOpacity
                key={req.id}
                activeOpacity={0.95}
                onPress={() => setSelectedReq(req)}
                style={{
                  shadowColor: isDark ? '#000' : '#4f46e5',
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: isDark ? 0.4 : 0.08,
                  shadowRadius: 24,
                  elevation: 8,
                }}
                className={`rounded-[40px] mb-8 overflow-hidden border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-50'}`}
              >
                {/* ─── Premium Glassmorphic Header ─── */}
                <View className="p-7 pb-0">
                  <View className="flex-row items-start justify-between gap-4 mb-6">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-2">
                        <View className={`w-2 h-2 rounded-full ${isDark ? 'bg-indigo-500' : 'bg-indigo-600'}`} />
                        <Text className={`text-[10px] font-black uppercase tracking-[3px] ${isDark ? 'text-indigo-400/80' : 'text-indigo-600/60'}`}>
                          {t('case_request_item')}
                        </Text>
                      </View>
                      <Text className={`text-2xl font-black leading-tight tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`} numberOfLines={2}>
                        {req.caseName}
                      </Text>
                    </View>
                    
                    {/* Status Badge - Glassmorphic Style */}
                    <View 
                      style={{ backgroundColor: s.bg, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }} 
                      className="px-4 py-2 rounded-2xl flex-row items-center gap-2 border"
                    >
                      <StatusIcon type={s.icon} size={12} color={s.text} />
                      <Text style={{ color: s.text }} className="text-[11px] font-black uppercase tracking-widest">
                        {t(req.status.toLowerCase()) || req.status}
                      </Text>
                    </View>
                  </View>

                  {/* ─── Student Profile "Hero" Segment ─── */}
                  <LinearGradient
                    colors={isDark ? ['#1e293b', '#0f172a'] : ['#f8fafc', '#f1f5f9']}
                    className="flex-row items-center p-5 rounded-[32px] mb-5 border border-white/10 dark:border-slate-800/50"
                  >
                    <View className="relative">
                       <LinearGradient
                        colors={['#818cf8', '#4f46e5', '#3730a3']}
                        className="w-14 h-14 rounded-[22px] items-center justify-center shadow-lg shadow-indigo-500/50"
                      >
                        <Text className="text-white font-black text-lg">{initials}</Text>
                      </LinearGradient>
                      <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 items-center justify-center">
                          <CheckCircle2 size={10} color="white" />
                      </View>
                    </View>
                    
                    <View className="flex-1 ml-5">
                      <Text className={`text-base font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`} numberOfLines={1}>
                        {req.studentName}
                      </Text>
                      <View className="flex-row items-center gap-2 mt-1">
                        <View className={`px-2.5 py-1 rounded-lg ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
                           <Text className={`text-[10px] font-black uppercase ${isDark ? 'text-indigo-400' : 'text-indigo-700'}`}>{t('level_label')} {req.level}</Text>
                        </View>
                        <View className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <Text className={`text-[11px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`} numberOfLines={1}>
                          {req.university}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>

                  {/* ─── Motivation Preview Detail ─── */}
                  {req.description && (
                    <View className={`mb-6 p-5 rounded-[28px] relative ${isDark ? 'bg-slate-950/60' : 'bg-slate-50'}`}>
                       <View className="absolute top-0 right-0 p-3 opacity-20">
                          <Quote size={24} color={isDark ? '#4f46e5' : '#4f46e5'} style={{ transform: [{ rotate: '180deg' }] }} />
                       </View>
                       <Text className={`text-[13px] leading-6 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`} numberOfLines={3}>
                         {req.description}
                       </Text>
                    </View>
                  )}

                  {/* ─── Footer: Patient & Meta ─── */}
                  <View className="flex-row items-center justify-between mb-8">
                    <View className="flex-row items-center gap-3">
                      <View className={`w-10 h-10 rounded-full items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        <User size={18} color={isDark ? '#818cf8' : '#4f46e5'} />
                      </View>
                      <View>
                        <Text className={`text-[10px] font-black uppercase tracking-tight ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t('patient_name')}</Text>
                        <Text className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{req.patientName || 'N/A'}</Text>
                      </View>
                    </View>
                    <View className="items-end">
                       <Text className={`text-[10px] font-black uppercase tracking-tight ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t('sent_at')}</Text>
                       <Text className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{formatDate(req.createAt)}</Text>
                    </View>
                  </View>
                </View>

                {/* ─── Actions: Approve / Reject ─── */}
                {isPending ? (
                  <View className={`p-5 flex-row gap-4 ${isDark ? 'bg-slate-800/40 border-t border-slate-800' : 'bg-slate-50/50 border-t border-slate-50'}`}>
                    <TouchableOpacity
                      onPress={() => handleReject(req.id)}
                      disabled={!!isLoading}
                      activeOpacity={0.7}
                      className={`flex-1 flex-row items-center justify-center gap-2.5 py-4.5 rounded-[22px] border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}
                    >
                      {isLoading && actionLoading === req.id ? (
                        <ActivityIndicator size={14} color="#f87171" />
                      ) : (
                        <X size={18} color="#f87171" />
                      )}
                      <Text className="text-xs font-black text-rose-500 uppercase tracking-widest">{t('reject')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleApprove(req.id)}
                      disabled={!!isLoading}
                      activeOpacity={0.8}
                      className="flex-[1.5] py-4.5 rounded-[22px] bg-indigo-600 flex-row items-center justify-center gap-2.5 shadow-xl shadow-indigo-600/40"
                    >
                      {isLoading && actionLoading === req.id ? (
                        <ActivityIndicator size={14} color="white" />
                      ) : (
                        <CheckCircle2 size={18} color="white" />
                      )}
                      <Text className="text-xs font-black text-white uppercase tracking-widest">{t('approve')}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className={`p-6 items-center justify-center ${isDark ? 'bg-slate-800/20' : 'bg-slate-50/30'}`}>
                     <TouchableOpacity
                        onPress={() => setSelectedReq(req)}
                        className="flex-row items-center gap-2 group"
                     >
                        <Text className={`text-xs font-black uppercase tracking-[2px] ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{t('full_details')}</Text>
                        <ChevronRight size={16} color={isDark ? '#818cf8' : '#4f46e5'} />
                     </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {t('page_of', { current: pagination.currentPage, total: pagination.totalPages })}
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPreviousPage}
                style={{ opacity: pagination.hasPreviousPage ? 1 : 0.4 }}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <Text className="text-xs font-bold text-slate-600 dark:text-slate-300">‹ Prev</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                style={{ opacity: pagination.hasNextPage ? 1 : 0.4 }}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <Text className="text-xs font-bold text-slate-600 dark:text-slate-300">Next ›</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Detail Modal ── */}
      <Modal
        visible={!!selectedReq}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedReq(null)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }}
          onPress={() => setSelectedReq(null)}
        >
          <Pressable
            style={{ marginTop: 'auto' }}
            onPress={(e) => e.stopPropagation()}
          >
            <View className="bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-100 dark:border-slate-800">
              {/* Modal handle */}
              <View className="items-center pt-3 pb-1">
                <View className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
              </View>

              {/* Modal header */}
              <View className="flex-row items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                <View className="flex-row items-center gap-2">
                  <View className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                    <FileText size={16} color={isDark ? '#818cf8' : '#4f46e5'} />
                  </View>
                  <Text className="text-base font-black text-slate-800 dark:text-white">
                    {t('full_details')}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedReq(null)}
                  className="p-2 rounded-xl"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X size={18} color={isDark ? '#94a3b8' : '#64748b'} />
                </TouchableOpacity>
              </View>

              {selectedReq && (
                <ScrollView
                  className="max-h-[80%]"
                  contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                >
                  {/* Status row */}
                  {(() => {
                    const s = getStatusStyle(selectedReq.status, isDark);
                    return (
                      <View className="flex-row items-center justify-between mb-4">
                        <View style={{ backgroundColor: s.bg }} className="flex-row items-center gap-2 px-4 py-2 rounded-full">
                          <StatusIcon type={s.icon} size={14} color={s.text} />
                          <Text style={{ color: s.text }} className="text-sm font-bold">
                            {selectedReq.status}
                          </Text>
                        </View>
                        <Text className="text-xs text-slate-400 dark:text-slate-500">
                          {formatDate(selectedReq.createAt)}
                        </Text>
                      </View>
                    );
                  })()}

                  {/* Description */}
                  {selectedReq.description && (
                    <View className="mb-4">
                      <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                        Description
                      </Text>
                      <View className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                        <Text className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          {selectedReq.description}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Detail grid */}
                  {[
                    { icon: <FileText size={14} color="#6366f1" />, label: t('case_name'), value: selectedReq.caseName },
                    { icon: <User size={14} color="#6366f1" />, label: t('patient_name'), value: selectedReq.patientName || 'N/A' },
                    { icon: <GraduationCap size={14} color="#6366f1" />, label: t('student_name'), value: selectedReq.studentName },
                    { icon: <BookOpen size={14} color="#6366f1" />, label: t('student_id'), value: selectedReq.studentPublicId },
                    { icon: <Hospital size={14} color="#6366f1" />, label: t('university'), value: selectedReq.university },
                    { icon: <Info size={14} color="#6366f1" />, label: t('level_label'), value: String(selectedReq.level) },
                    { icon: <Stethoscope size={14} color="#6366f1" />, label: t('doctor_name'), value: selectedReq.doctorName },
                    { icon: <Calendar size={14} color="#6366f1" />, label: t('submitted_on'), value: formatDate(selectedReq.createAt) },
                  ].map((row, i) => (
                    <View
                      key={i}
                      className="flex-row items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-2"
                    >
                      <View className="mt-0.5">{row.icon}</View>
                      <View className="flex-1">
                        <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          {row.label}
                        </Text>
                        <Text className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5" selectable>
                          {row.value}
                        </Text>
                      </View>
                    </View>
                  ))}

                  {/* Modal action buttons */}
                  {selectedReq.status === 'Pending' && (
                    <View className="flex-row gap-3 mt-4">
                      <TouchableOpacity
                        onPress={() => handleApprove(selectedReq.id)}
                        disabled={actionLoading === selectedReq.id}
                        className="flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-500"
                        style={{ opacity: actionLoading === selectedReq.id ? 0.6 : 1 }}
                      >
                        {actionLoading === selectedReq.id ? (
                          <ActivityIndicator size={15} color="white" />
                        ) : (
                          <CheckCircle2 size={15} color="white" />
                        )}
                        <Text className="text-white font-black text-sm">{t('approve')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleReject(selectedReq.id)}
                        disabled={actionLoading === selectedReq.id}
                        className="flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-500"
                        style={{ opacity: actionLoading === selectedReq.id ? 0.6 : 1 }}
                      >
                        {actionLoading === selectedReq.id ? (
                          <ActivityIndicator size={15} color="white" />
                        ) : (
                          <XCircle size={15} color="white" />
                        )}
                        <Text className="text-white font-black text-sm">{t('reject')}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </ScrollView>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ── Helper component ──────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
  truncate = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  truncate?: boolean;
}) {
  return (
    <View className="flex-row items-start gap-2 mb-1.5">
      <View className="mt-0.5">{icon}</View>
      <Text className="text-xs text-slate-400 dark:text-slate-500 font-semibold shrink-0">
        {label}:{' '}
      </Text>
      <Text
        className="flex-1 text-xs text-slate-700 dark:text-slate-200 font-semibold"
        numberOfLines={truncate ? 1 : undefined}
      >
        {value}
      </Text>
    </View>
  );
}
