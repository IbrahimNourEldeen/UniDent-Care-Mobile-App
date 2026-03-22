import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {
  User,
  Briefcase,
  Calendar,
  Clock,
  X,
  ChevronRight,
  CheckCircle2,
  Send,
  Stethoscope,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { useAppSelector } from '@/store/hooks';
import { CaseItem } from '@/features/cases/types/caseTypes';
import api from '@/utils/api';

interface CaseCardProps {
  caseItem: CaseItem;
  onRequestSent?: () => void;
}

function SendRequestModal({
  caseItem,
  onClose,
  onSuccess,
}: {
  caseItem: CaseItem;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const { theme } = useThemeLanguage();
  const isDark = theme === 'dark';
  const student = useAppSelector((s) => s.auth.user);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError(t('error_short_desc'));
      return;
    }
    if (!student?.publicId) {
      setError(t('error_student_not_found'));
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/CaseRequests', {
        patientCasePublicId: caseItem.id,
        studentPublicId: student.publicId,
        description: description.trim(),
      });
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? t('request_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible animationType="slide" transparent>
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View className="bg-white dark:bg-slate-900 rounded-t-3xl p-6 pb-10">
            {/* Handle */}
            <View className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full self-center mb-5" />
            <Text className="text-xl font-black text-slate-900 dark:text-white mb-1">
              {t('request_case_title')}
            </Text>
            <Text className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              {caseItem.patientName} • {caseItem.caseType?.name ?? 'General'}
            </Text>
            <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              {t('motivation_label')}
            </Text>
            <TextInput
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white text-sm min-h-24 text-left"
              placeholder={t('motivation_placeholder')}
              placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
              value={description}
              onChangeText={(t_val) => { setDescription(t_val); setError(''); }}
              multiline
              textAlignVertical="top"
            />
            {error ? (
              <Text className="text-red-500 text-xs font-bold mt-2">{error}</Text>
            ) : null}
            <View className="flex-row gap-3 mt-5">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 items-center"
              >
                <Text className="font-bold text-slate-700 dark:text-slate-300">{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3.5 rounded-2xl bg-blue-600 dark:bg-indigo-600 items-center flex-row justify-center gap-2"
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Send size={16} color="white" />
                    <Text className="font-bold text-white ml-2">{t('send_request')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function CaseCard({ caseItem, onRequestSent }: CaseCardProps) {
  const { t } = useTranslation();
  const { theme } = useThemeLanguage();
  const isDark = theme === 'dark';
  const [showModal, setShowModal] = useState(false);

  const statusStyles = caseItem.status === 'Available'
    ? { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' }
    : { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' };

  return (
    <>
      <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-4 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none">
        {/* Top Row: Status + Sessions */}
        <View className="flex-row items-center justify-between mb-4">
          <View className={`px-3 py-1 rounded-full flex-row items-center gap-1.5 ${statusStyles.bg}`}>
            <CheckCircle2 size={12} color={caseItem.status === 'Available' ? (isDark ? '#4ade80' : '#16a34a') : (isDark ? '#60a5fa' : '#2563eb')} />
            <Text className={`text-[11px] font-black uppercase tracking-wide ${statusStyles.text}`}>
              {caseItem.status}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Calendar size={12} color={isDark ? '#64748b' : '#94a3b8'} />
            <Text className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              {t('sessions_count', { count: caseItem.totalSessions })}
            </Text>
          </View>
        </View>

        {/* Patient Info */}
        <View className="flex-row items-center mb-4">
          <View className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/40 items-center justify-center mr-3">
            <User size={22} color={isDark ? '#60a5fa' : '#2563eb'} />
          </View>
          <View className="flex-1 text-left">
            <Text className="text-base font-black text-slate-900 dark:text-white leading-5 text-left">
              {caseItem.patientName}
            </Text>
            <Text className="text-sm text-slate-500 dark:text-slate-400 text-left">
              {t('age_label', { age: caseItem.patientAge })}
            </Text>
          </View>
        </View>

        {/* Case Type */}
        <View className="flex-row items-center bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2.5 mb-4">
          <Stethoscope size={14} color={isDark ? '#818cf8' : '#4f46e5'} />
          <Text className="ml-2 text-sm font-bold text-slate-700 dark:text-slate-300 flex-1 text-left" numberOfLines={1}>
            {caseItem.caseType?.name ?? 'General Case'}
          </Text>
          <View className="flex-row items-center">
            <Clock size={12} color={isDark ? '#64748b' : '#94a3b8'} />
            <Text className="text-[11px] text-slate-400 dark:text-slate-500 ml-1">
              {t('requests_count', { count: caseItem.pendingRequests })}
            </Text>
          </View>
        </View>

        {/* Date + Action Row */}
        <View className="flex-row items-center justify-between">
          <Text className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            {t('added_on', { date: new Date(caseItem.createAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) })}
          </Text>
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            className="bg-blue-600 dark:bg-indigo-600 px-4 py-2 rounded-xl flex-row items-center gap-2"
          >
            <Send size={13} color="white" />
            <Text className="text-white text-xs font-black ml-1">{t('request_action')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showModal && (
        <SendRequestModal
          caseItem={caseItem}
          onClose={() => setShowModal(false)}
          onSuccess={() => onRequestSent?.()}
        />
      )}
    </>
  );
}
