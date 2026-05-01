import { useRouter } from 'expo-router';
import { Activity, AlertCircle, ArrowRight, BookOpen, Briefcase, Calendar, CheckCircle, ChevronLeft, ChevronRight, Clock3, Send, Stethoscope, User } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMyCasesStudent } from '@/features/cases/hooks/useMyCasesStudent';
import { StudentCaseItem, StudentRequestItem } from '@/features/cases/types/caseTypes';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';


const { width } = Dimensions.get('window');

function getCaseStatusConfig(status: string, isDark: boolean) {
  const s = status?.toLowerCase();
  if (s === 'in-progress' || s === 'inprogress')
    return { label: 'status_in_progress', dot: '#f59e0b', text: isDark ? '#fbbf24' : '#d97706', bg: isDark ? 'bg-amber-900/30' : 'bg-amber-100', Icon: Activity };
  if (s === 'completed')
    return { label: 'status_completed', dot: '#34d399', text: isDark ? '#6ee7b7' : '#059669', bg: isDark ? 'bg-emerald-900/40' : 'bg-emerald-100', Icon: CheckCircle };
  if (s === 'diagnosis')
    return { label: 'status_diagnosis', dot: '#60a5fa', text: isDark ? '#93c5fd' : '#2563eb', bg: isDark ? 'bg-blue-900/40' : 'bg-blue-100', Icon: Stethoscope };
  return { label: 'status_unassigned', dot: '#94a3b8', text: isDark ? '#94a3b8' : '#64748b', bg: isDark ? 'bg-slate-800' : 'bg-slate-200', Icon: AlertCircle };
}

function getRequestStatusConfig(status: string, isDark: boolean) {
  const s = status?.toLowerCase();
  if (s === 'approved') return { label: 'status_approved', dot: '#34d399', text: isDark ? '#6ee7b7' : '#059669', bg: isDark ? 'bg-emerald-900/40' : 'bg-emerald-100' };
  if (s === 'rejected') return { label: 'status_rejected', dot: '#f87171', text: isDark ? '#fca5a5' : '#dc2626', bg: isDark ? 'bg-red-900/30' : 'bg-red-100' };
  return { label: 'status_pending', dot: '#f59e0b', text: isDark ? '#fbbf24' : '#d97706', bg: isDark ? 'bg-amber-900/30' : 'bg-amber-100' };
}

function CardSkeleton({ isDark }: { isDark: boolean }) {
  const shimmer = isDark ? 'bg-slate-800' : 'bg-slate-200';
  const bg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  return (
    <View className={`rounded-[28px] p-5 mb-4 border ${bg}`}>
      <View className="flex-row items-center gap-4">
        <View className={`w-14 h-14 rounded-2xl ${shimmer}`} />
        <View className="flex-1 gap-2">
          <View className={`h-4 w-2/3 rounded-lg ${shimmer}`} />
          <View className={`h-3 w-1/3 rounded-lg ${shimmer}`} />
        </View>
      </View>
    </View>
  );
}

function EmptyState({ message, subMessage, isDark }: { message: string, subMessage: string, isDark: boolean }) {
  return (
    <View className={`py-12 px-6 rounded-[32px] items-center justify-center mt-6 border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-sm shadow-slate-200/50'}`}>
      <View className={`w-20 h-20 rounded-full items-center justify-center mb-5 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-indigo-50'}`}>
        <BookOpen size={30} color={isDark ? '#4f46e5' : '#6366f1'} />
      </View>
      <Text className={`text-lg font-black text-center mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>{message}</Text>
      <Text className={`text-xs text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{subMessage}</Text>
    </View>
  );
}

function FilterRow({ options, selected, onSelect, isDark }: { options: { label: string; value: string }[], selected: string, onSelect: (v: string) => void, isDark: boolean }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 20, paddingBottom: 6 }} className="mb-2">
      {options.map((opt) => {
        const active = selected === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            className={`px-5 py-2.5 rounded-full border shadow-sm ${active ? (isDark ? 'bg-indigo-600 border-indigo-500' : 'bg-indigo-600 border-indigo-600 shadow-indigo-200') : (isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}`}
          >
            <Text className={`text-xs font-bold ${active ? 'text-white' : (isDark ? 'text-slate-300' : 'text-slate-600')}`}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function CaseCard({ item, isDark, t }: { item: StudentCaseItem; isDark: boolean; t: any }) {
  const router = useRouter();
  const sc = getCaseStatusConfig(item.status, isDark);
  const { Icon: StatusIcon } = sc;
  const initials = (item.patientName || 'P').split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <TouchableOpacity onPress={() => router.push(`/case-detail/${item.id}` as any)} activeOpacity={0.8} className={`mb-4 mx-5 rounded-[28px] p-5 shadow-lg ${isDark ? 'bg-slate-900 shadow-black/40 border border-slate-800' : 'bg-white shadow-slate-200/60 border border-slate-100'}`}>
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-row items-center gap-3.5 flex-1 min-w-0">
          <View className={`w-12 h-12 rounded-[18px] items-center justify-center ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-50'}`}>
            <Text className={`font-black text-base ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{initials}</Text>
          </View>
          <View className="flex-1 min-w-0">
            <Text className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`} numberOfLines={1}>{item.patientName || 'Anonymous'}</Text>
            <Text className={`text-xs font-medium mt-0.5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} numberOfLines={1}>{item.diagnosisdto?.caseType || t('unknown_type')}</Text>
          </View>
        </View>
        <View className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${sc.bg}`}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: sc.dot }} />
          <Text style={{ color: sc.text }} className="text-[10px] font-black uppercase tracking-widest">{t(sc.label)}</Text>
        </View>
      </View>

      <View className={`flex-row flex-wrap gap-2 p-3 rounded-2xl ${isDark ? 'bg-slate-950/50' : 'bg-slate-50'}`}>
        <View className="flex-row items-center gap-1.5 pr-2">
          <User size={12} color={isDark ? '#64748b' : '#94a3b8'} />
          <Text className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t('years_old', { age: item.patientAge })}</Text>
        </View>
        <View className="flex-row items-center gap-1.5 px-2 border-l border-r border-slate-200 dark:border-slate-800">
          <Stethoscope size={12} color={isDark ? '#64748b' : '#94a3b8'} />
          <Text className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t('sessions_label', { count: item.totalSessions })}</Text>
        </View>
        <View className="flex-row items-center gap-1.5 pl-1">
          <Calendar size={12} color={isDark ? '#64748b' : '#94a3b8'} />
          <Text className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{item.createAt ? new Date(item.createAt).toLocaleDateString() : ''}</Text>
        </View>
      </View>

      {item.processStatus ? (
        <View className={`mt-3 p-2.5 rounded-xl flex-row items-center justify-between ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
           <View className="flex-row items-center gap-2">
              <StatusIcon size={14} color={sc.text} />
              <Text style={{ color: sc.text }} className="text-xs font-bold">{item.processStatus}</Text>
           </View>
           <ArrowRight size={14} color={isDark ? '#64748b' : '#94a3b8'} />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

function RequestCard({ item, isDark, t }: { item: StudentRequestItem; isDark: boolean; t: any }) {
  const router = useRouter();
  const sc = getRequestStatusConfig(item.status, isDark);

  return (
    <TouchableOpacity onPress={() => router.push(`/case-detail/${item.patientCasePublicId}` as any)} activeOpacity={0.8} className={`mb-4 mx-5 rounded-[28px] p-5 shadow-lg ${isDark ? 'bg-slate-900 shadow-black/40 border border-slate-800' : 'bg-white shadow-slate-200/60 border border-slate-100'}`}>
      <View className="flex-row items-start justify-between gap-3 mb-4">
        <View className="flex-1 min-w-0">
          <Text className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`} numberOfLines={1}>{item.patientName || 'Anonymous'}</Text>
          <Text className={`text-[11px] font-bold tracking-widest uppercase mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} numberOfLines={1}>{item.caseName || 'Unknown Case'}</Text>
        </View>
        <View className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${sc.bg}`}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: sc.dot }} />
          <Text style={{ color: sc.text }} className="text-[10px] font-black uppercase tracking-widest">{t(sc.label)}</Text>
        </View>
      </View>

      {item.description ? (
        <View className={`p-3 rounded-2xl mb-4 ${isDark ? 'bg-slate-950/60' : 'bg-slate-50'}`}>
          <Text className={`text-xs font-medium leading-5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} numberOfLines={2}>"{item.description}"</Text>
        </View>
      ) : null}

      <View className={`flex-row items-center justify-between pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <View className="flex-row items-center gap-2">
          <Clock3 size={12} color={isDark ? '#64748b' : '#94a3b8'} />
          <Text className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.createAt ? new Date(item.createAt).toLocaleDateString() : ''}</Text>
        </View>
        {item.doctorName ? (
           <View className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <Stethoscope size={10} color={isDark ? '#94a3b8' : '#64748b'} />
              <Text className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.doctorName}</Text>
           </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

function Pagination({ page, totalPages, onPageChange, isDark }: any) {
  const safeTotalPages = Number.isFinite(totalPages) ? totalPages : 0;
  if (safeTotalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(safeTotalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    return Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
  });

  return (
    <View className="flex-row items-center justify-center gap-2.5 mt-6 mb-12">
      <TouchableOpacity onPress={() => onPageChange(page - 1)} disabled={page === 1} className={`w-10 h-10 rounded-2xl items-center justify-center ${page === 1 ? 'opacity-40' : ''} ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200 shadow-sm'}`}>
        <ChevronLeft size={18} color={isDark ? '#94a3b8' : '#475569'} />
      </TouchableOpacity>
      {pages.map((p) => (
        <TouchableOpacity key={p} onPress={() => onPageChange(p)} className={`w-10 h-10 rounded-2xl items-center justify-center ${p === page ? 'bg-indigo-600 shadow-sm shadow-indigo-500/50' : (isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200')}`}>
          <Text className={`text-sm font-black ${p === page ? 'text-white' : (isDark ? 'text-slate-400' : 'text-slate-600')}`}>{p}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity onPress={() => onPageChange(page + 1)} disabled={page === totalPages} className={`w-10 h-10 rounded-2xl items-center justify-center ${page === totalPages ? 'opacity-40' : ''} ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200 shadow-sm'}`}>
        <ChevronRight size={18} color={isDark ? '#94a3b8' : '#475569'} />
      </TouchableOpacity>
    </View>
  );
}

export default function MyCasesScreen() {
  const { t } = useTranslation();
  const { theme } = useThemeLanguage();
  const insets = useSafeAreaInsets();
  const isDark = theme === 'dark';

  const {
    activeTab, setActiveTab,
    cases, casesLoading, caseType, setCaseType, casesPage, setCasesPage, casesTotalPages, casesTotalCount, refetchCases,
    requests, requestsLoading, requestStatus, setRequestStatus, requestsPage, setRequestsPage, requestsTotalPages, requestsTotalCount,
  } = useMyCasesStudent();

  const CASE_TYPE_OPTIONS = [
    { label: t('all_case_types'), value: '' }, { label: 'Restorative', value: 'Restorative' }, { label: 'Orthodontic', value: 'Orthodontic' },
    { label: 'Surgical', value: 'Surgical' }, { label: 'Endodontic', value: 'Endodontic' }, { label: 'Periodontic', value: 'Periodontic' }, { label: 'Prosthodontic', value: 'Prosthodontic' }
  ];

  const REQUEST_STATUS_OPTIONS = [
    { label: t('all_statuses'), value: '' }, { label: t('status_pending'), value: 'Pending' }, { label: t('status_approved'), value: 'Approved' }, { label: t('status_rejected'), value: 'Rejected' },
  ];

  const bgClass = isDark ? 'bg-[#020617]' : 'bg-slate-50';

  return (
    <View className={`flex-1 ${bgClass}`}>
      {/* Hero Background */}
      <View className="bg-indigo-600 dark:bg-indigo-900 absolute top-0 left-0 right-0" style={{ height: 260 + insets.top, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={{ paddingTop: insets.top + 20 }}>
          
          {/* Header Title */}
          <View className="px-6 flex-row items-center justify-between mb-8">
            <View>
              <Text className="text-3xl font-black text-white tracking-tight">{t('my_cases')}</Text>
              <Text className="text-sm font-medium text-indigo-100 mt-1 opacity-90">{t('my_cases_desc')}</Text>
            </View>
          </View>

          {/* Floating Dashboard Card */}
          <View className="px-5 z-20 mb-8">
             <View className={`rounded-[32px] p-2 shadow-xl ${isDark ? 'bg-slate-900 shadow-black/50' : 'bg-white shadow-indigo-900/10'}`} style={{ elevation: 15 }}>
                <View className={`flex-row p-1.5 rounded-2xl ${isDark ? 'bg-slate-950/50' : 'bg-slate-50'}`}>
                    {[ { id: 'cases', labelKey: 'cases_tab', icon: Briefcase, count: casesTotalCount },
                       { id: 'requests', labelKey: 'requests_tab', icon: Send, count: requestsTotalCount },
                    ].map((tab) => {
                       const active = activeTab === tab.id;
                       const Icon = tab.icon;
                       return (
                          <TouchableOpacity
                             key={tab.id}
                             onPress={() => setActiveTab(tab.id as any)}
                             className={`flex-1 py-4 flex-row items-center justify-center gap-2 rounded-xl ${active ? (isDark ? 'bg-indigo-600 shadow-md shadow-indigo-500/20' : 'bg-white shadow-sm border border-slate-100') : 'bg-transparent'}`}
                          >
                             <Icon size={16} color={active ? (isDark ? '#ffffff' : '#4f46e5') : (isDark ? '#64748b' : '#64748b')} />
                             <Text className={`text-xs font-black uppercase tracking-wider ${active ? (isDark ? 'text-white' : 'text-indigo-600') : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>{t(tab.labelKey)}</Text>
                             {tab.count > 0 && (
                                <View className={`px-2 py-0.5 rounded-md ${active ? 'bg-indigo-500/30 dark:bg-white/20' : (isDark ? 'bg-slate-800' : 'bg-slate-200')}`}>
                                   <Text className={`text-[10px] font-bold ${active ? 'text-white border-white' : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>{tab.count}</Text>
                                </View>
                             )}
                          </TouchableOpacity>
                       );
                    })}
                </View>
             </View>
          </View>

          {/* Tab Content */}
          <View className="flex-1 mt-2">
            {activeTab === 'cases' && (
              <View>
                <View className="flex-row items-center justify-between px-6 mb-3">
                  <Text className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Filter by Case</Text>
                  {casesLoading && <ActivityIndicator size="small" color="#4f46e5" />}
                </View>
                <FilterRow options={CASE_TYPE_OPTIONS} selected={caseType} onSelect={setCaseType} isDark={isDark} />
                
                <View className="mt-2">
                  {casesLoading ? <View className="px-5"><CardSkeleton isDark={isDark} /><CardSkeleton isDark={isDark} /></View>
                  : cases.length === 0 ? <View className="px-5"><EmptyState message={t('no_cases_assigned')} subMessage="When you are assigned cases, they will appear here" isDark={isDark} /></View>
                  : cases.map((item) => <CaseCard key={item.id} item={item} isDark={isDark} t={t} />)}
                </View>
                <Pagination page={casesPage} totalPages={casesTotalPages} onPageChange={setCasesPage} isDark={isDark} />
              </View>
            )}

            {activeTab === 'requests' && (
              <View>
                <View className="flex-row items-center justify-between px-6 mb-3">
                  <Text className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Filter Status</Text>
                  {requestsLoading && <ActivityIndicator size="small" color="#4f46e5" />}
                </View>
                <FilterRow options={REQUEST_STATUS_OPTIONS} selected={requestStatus} onSelect={setRequestStatus} isDark={isDark} />

                <View className="mt-2">
                  {requestsLoading ? <View className="px-5"><CardSkeleton isDark={isDark} /><CardSkeleton isDark={isDark} /></View>
                  : requests.length === 0 ? <View className="px-5"><EmptyState message={t('no_requests_sent')} subMessage="Your submitted case requests will show up here" isDark={isDark} /></View>
                  : requests.map((item) => <RequestCard key={item.id} item={item} isDark={isDark} t={t} />)}
                </View>
                <Pagination page={requestsPage} totalPages={requestsTotalPages} onPageChange={setRequestsPage} isDark={isDark} />
              </View>
            )}
          </View>

        </View>
      </ScrollView>
    </View>
  );
}
