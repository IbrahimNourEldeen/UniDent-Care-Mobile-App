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

  const [requests, setRequests] = useState<CaseRequest[]>([]);
  const [pagination, setPagination] = useState<Omit<PaginatedRequests, 'items'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReq, setSelectedReq] = useState<CaseRequest | null>(null);

  const fetchRequests = useCallback(
    async (page = currentPage) => {
      if (!doctorId) return;
      try {
        setLoading(true);
        const res = await doctorDashboardService.getCaseRequestsByDoctor(doctorId, page, PAGE_SIZE);
        // User wants only pending cases on this page
        const pendingOnly = res.items.filter((req) => req.status === 'Pending');
        setRequests(pendingOnly);
        
        const { items: _items, ...rest } = res;
        setPagination({
          ...rest,
          totalCount: pendingOnly.length, // Update count to match filtered list
        });
      } catch (e) {
        console.error('fetchRequests error:', e);
      } finally {
        setLoading(false);
      }
    },
    [doctorId, currentPage],
  );

  useEffect(() => {
    fetchRequests(1);
  }, [doctorId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRequests(currentPage);
    setRefreshing(false);
  };

  const applyStatusUpdate = (id: string, status: string) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    setSelectedReq((prev) => (prev?.id === id ? { ...prev, status } : prev));
  };

  const handleApprove = async (id: string) => {
    if (actionLoading) return;
    setActionLoading(id);
    try {
      await doctorDashboardService.approveRequest(id);
      applyStatusUpdate(id, 'Approved');
      await fetchRequests(currentPage);
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
      await doctorDashboardService.rejectRequest(id);
      applyStatusUpdate(id, 'Rejected');
      await fetchRequests(currentPage);
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
            onPress={() => fetchRequests(currentPage)}
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
            const initials = req.studentName.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();

            return (
              <View
                key={req.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none mb-5 overflow-hidden flex-row"
              >
                {/* Side-Accent bar */}
                <View style={{ width: 4, backgroundColor: s.bar }} />

                <View className="flex-1 p-5">
                  {/* Header: Case Name + Status */}
                  <View className="flex-row items-start justify-between gap-3 mb-4">
                    <Text
                      className="flex-1 font-black text-slate-900 dark:text-white text-lg leading-tight"
                      numberOfLines={2}
                    >
                      {req.caseName}
                    </Text>
                    <View
                      style={{ backgroundColor: s.bg }}
                      className="flex-row items-center gap-1.5 px-3 py-1 rounded-full border border-black/5 dark:border-white/5"
                    >
                      <StatusIcon type={s.icon} size={10} color={s.text} />
                      <Text style={{ color: s.text }} className="text-[10px] font-black uppercase tracking-wider">
                        {req.status}
                      </Text>
                    </View>
                  </View>

                  {/* Student Profile Section */}
                  <View className="flex-row items-center bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl mb-4 gap-3">
                    <LinearGradient
                      colors={isDark ? ['#4f46e5', '#1e1b4b'] : ['#6366f1', '#3b82f6']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="w-10 h-10 rounded-xl items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                      <Text className="text-white font-black text-xs">{initials}</Text>
                    </LinearGradient>
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-slate-800 dark:text-slate-100" numberOfLines={1}>
                        {req.studentName}
                      </Text>
                      <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-medium" numberOfLines={1}>
                        {req.university} · {t('level_label')} {req.level}
                      </Text>
                    </View>
                  </View>

                  {/* Patient Info Detail */}
                  <View className="flex-row items-center px-1 mb-4 gap-2">
                    <View className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center">
                      <User size={12} color={isDark ? '#94a3b8' : '#64748b'} />
                    </View>
                    <Text className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      {t('patient_name')}: <Text className="text-slate-900 dark:text-white">{req.patientName || 'N/A'}</Text>
                    </Text>
                  </View>

                  {/* Date and Actions */}
                  <View className="flex-row items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/60">
                    <View className="flex-row items-center gap-1.5">
                      <Calendar size={12} color={isDark ? '#475569' : '#94a3b8'} />
                      <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                        {formatDate(req.createAt)}
                      </Text>
                    </View>
                    
                    <TouchableOpacity
                      onPress={() => setSelectedReq(req)}
                      className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex-row items-center gap-2"
                    >
                      <FileText size={12} color={isDark ? '#818cf8' : '#4f46e5'} />
                      <Text className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                        {t('full_details')}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Primary Action Buttons */}
                  {isPending && (
                    <View className="flex-row gap-3 mt-4">
                      <TouchableOpacity
                        onPress={() => handleApprove(req.id)}
                        disabled={!!isLoading}
                        className="flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-500 shadow-md shadow-emerald-200 dark:shadow-none active:bg-emerald-600"
                        style={{ opacity: isLoading ? 0.7 : 1 }}
                      >
                        {isLoading && actionLoading === req.id ? (
                          <ActivityIndicator size={14} color="white" />
                        ) : (
                          <CheckCircle2 size={14} color="white" />
                        )}
                        <Text className="text-xs font-black text-white uppercase tracking-tighter">{t('approve')}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleReject(req.id)}
                        disabled={!!isLoading}
                        className="flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-2xl bg-rose-500 shadow-md shadow-rose-200 dark:shadow-none active:bg-rose-600"
                        style={{ opacity: isLoading ? 0.7 : 1 }}
                      >
                        {isLoading && actionLoading === req.id ? (
                          <ActivityIndicator size={14} color="white" />
                        ) : (
                          <XCircle size={14} color="white" />
                        )}
                        <Text className="text-xs font-black text-white uppercase tracking-tighter">{t('reject')}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
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
                onPress={() => { const p = currentPage - 1; setCurrentPage(p); fetchRequests(p); }}
                disabled={!pagination.hasPreviousPage}
                style={{ opacity: pagination.hasPreviousPage ? 1 : 0.4 }}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <Text className="text-xs font-bold text-slate-600 dark:text-slate-300">‹ Prev</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { const p = currentPage + 1; setCurrentPage(p); fetchRequests(p); }}
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
