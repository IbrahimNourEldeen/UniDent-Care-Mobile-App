import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import { User, Briefcase, Calendar, Clock, X, ChevronRight, CheckCircle2, Send, Stethoscope, AlertCircle, MessageSquare } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import { CaseItem } from '@/features/cases/types/caseTypes';
import api from '@/utils/api';
import { DoctorPicker } from '@/components/auth/DoctorPicker';
import { DoctorListDto } from '@/features/dashboard/services/doctorDashboardService';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface CaseCardProps {
  caseItem: CaseItem;
  onRequestSent?: () => void;
}

export function SendRequestModal({
  caseItem,
  onClose,
  onSuccess,
}: {
  caseItem: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const { theme } = useThemeLanguage();
  const isDark = theme === 'dark';
  const student = useAppSelector((state: RootState) => state.auth.user);
  const [description, setDescription] = useState('');
  const [doctorUsername, setDoctorUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const minLength = 20;
    if (!description.trim() || description.trim().length < minLength) {
      
      setError(t('error_student_motiv'));
      return;
    }
    if (!doctorUsername) {
      setError(t('error_doctor_required'));
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
        doctorUsername: doctorUsername,
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
      <Pressable className="flex-1 bg-black/60 justify-end" onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()} className={`rounded-t-[40px] ${isDark ? 'bg-slate-900' : 'bg-white'} p-6 pb-12`}>
            {/* Handle */}
            <View className={`w-12 h-1.5 self-center rounded-full mb-8 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
            
            <View className="mb-6 flex-row items-center gap-4">
                <View className={`w-14 h-14 rounded-2xl items-center justify-center ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-50'}`}>
                    <MessageSquare size={28} color={isDark ? '#818cf8' : '#4f46e5'} />
                </View>
                <View className="flex-1">
                    <Text className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {t('request_case_title')}
                    </Text>
                    <Text className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Tell the patient why you are the best fit
                    </Text>
                </View>
            </View>

            <View className={`mb-6 p-4 rounded-3xl border ${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <View className="flex-row items-center gap-3">
                    <View className={`px-3 py-1 rounded-lg ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-600'}`}>
                        <Text className="text-[10px] font-black text-white uppercase tracking-tighter">Case Reference</Text>
                    </View>
                    <Text className={`flex-1 text-sm font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`} numberOfLines={1}>{caseItem.patientName}</Text>
                </View>
            </View>

            <DoctorPicker 
                value={doctorUsername} 
                onSelect={(d: DoctorListDto) => {
                    setDoctorUsername(d.username);
                    setError('');
                }}
                error={error.includes('doctor') ? error : undefined}
            />

            <View className="mb-6">
                <Text className={`text-xs font-black uppercase tracking-widest mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                   Your Motivation
                </Text>
                <TextInput
                  className={`border rounded-[28px] p-5 text-sm min-h-[140px] text-left leading-5 ${isDark ? 'bg-slate-950/60 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                  placeholder={t('motivation_placeholder')}
                  placeholderTextColor={isDark ? '#475569' : '#cbd5e1'}
                  value={description}
                  onChangeText={(val) => { setDescription(val); setError(''); }}
                  multiline
                  textAlignVertical="top"
                  selectionColor="#4f46e5"
                />
                {error ? (
                  <View className="flex-row items-center gap-1.5 mt-3 px-2">
                    <AlertCircle size={14} color="#f87171" />
                    <Text className="text-red-400 text-xs font-bold">{error}</Text>
                  </View>
                ) : null}
            </View>

            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                className={`flex-1 py-4 rounded-[20px] items-center border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}
              >
                <Text className={`font-black text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={submitting}
                activeOpacity={0.8}
                className={`flex-[1.5] py-4 rounded-[20px] bg-indigo-600 items-center flex-row justify-center gap-2 shadow-lg shadow-indigo-600/30`}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Send size={16} color="white" strokeWidth={2.5} />
                    <Text className="font-black text-white text-sm">{t('send_request')}</Text>
                  </>
                )}
              </TouchableOpacity>
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
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const statusStyles = caseItem.status === 'Available'
    ? { bg: isDark ? 'bg-emerald-500/20' : 'bg-emerald-50 border border-emerald-100', text: isDark ? 'text-emerald-400' : 'text-emerald-700', dot: '#10b981' }
    : { bg: isDark ? 'bg-blue-500/20' : 'bg-blue-50 border border-blue-100', text: isDark ? 'text-blue-400' : 'text-blue-700', dot: '#3b82f6' };

  const initials = caseItem.patientName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <TouchableOpacity
        onPress={() => router.push(`/case-details/${caseItem.id}`)}
        activeOpacity={0.85}
        className={`rounded-[32px] p-6 mb-5 border shadow-xl ${isDark ? 'bg-slate-900 border-slate-800 shadow-black/50' : 'bg-white border-slate-100 shadow-indigo-900/5'}`}
      >
        {/* Header: Status + Sessions */}
        <View className="flex-row items-center justify-between mb-5">
          <View className={`px-4 py-1.5 rounded-full flex-row items-center gap-2 ${statusStyles.bg}`}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusStyles.dot }} />
            <Text className={`text-[10px] font-black uppercase tracking-widest ${statusStyles.text}`}>
              {caseItem.status}
            </Text>
          </View>
          <View className={`px-3 py-1.5 rounded-xl flex-row items-center gap-2 ${isDark ? 'bg-slate-800' : 'bg-slate-50 border border-slate-100'}`}>
            <Calendar size={12} color={isDark ? '#6366f1' : '#4f46e5'} />
            <Text className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('sessions_count', { count: caseItem.totalSessions })}
            </Text>
          </View>
        </View>

        {/* Patient Hero */}
        <View className="flex-row items-center mb-6">
          <View className={`w-14 h-14 rounded-[22px] items-center justify-center ${isDark ? 'bg-indigo-600/20' : 'bg-indigo-50 border border-indigo-100'}`}>
            <Text className={`text-lg font-black ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{initials}</Text>
          </View>
          <View className="flex-1 ml-4 items-start">
            <Text className={`text-lg font-black tracking-tight leading-6 ${isDark ? 'text-white' : 'text-slate-900'}`} numberOfLines={1}>
              {caseItem.patientName}
            </Text>
            <View className="flex-row items-center gap-2 mt-1">
                <View className={`px-2 py-0.5 rounded-md ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <Text className={`text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t('age_label', { age: caseItem.patientAge })}</Text>
                </View>
                <View className="w-1 h-1 rounded-full bg-slate-400 opacity-30" />
                <Text className={`text-xs font-medium ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  {(caseItem as any).diagnoses?.[0]?.caseType || 
                   (caseItem as any).diagnoses?.[0]?.caseTypeName || 
                   (caseItem as any).diagnosisdto?.[0]?.caseType || 
                   (caseItem as any).diagnosisdto?.[0]?.caseTypeName || 
                   caseItem.caseType?.name || 
                   'General'}
                </Text>
            </View>
          </View>
        </View>

        {/* Infobar */}
        <View className={`flex-row items-center p-4 rounded-[24px] mb-6 ${isDark ? 'bg-slate-800/50' : 'bg-slate-50 border border-slate-100/50'}`}>
            <View className="flex-1 border-r border-slate-200/20 dark:border-slate-700 items-center">
                <Text className={`text-[9px] font-black uppercase tracking-tight mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Requests</Text>
                <View className="flex-row items-center gap-1.5">
                    <Clock size={12} color={isDark ? '#4ade80' : '#10b981'} />
                    <Text className={`text-sm font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{caseItem.pendingRequests}</Text>
                </View>
            </View>
            <View className="flex-1 items-center">
                <Text className={`text-[9px] font-black uppercase tracking-tight mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Posted On</Text>
                <Text className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {new Date(caseItem.createAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                </Text>
            </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3">

          <TouchableOpacity
            onPress={() => setShowModal(true)}
            activeOpacity={0.8}
            className="flex-1 bg-indigo-600 py-3.5 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <Send size={14} color="white" strokeWidth={2.5} />
            <Text className="text-white text-xs font-black">{t('request_action')}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

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

