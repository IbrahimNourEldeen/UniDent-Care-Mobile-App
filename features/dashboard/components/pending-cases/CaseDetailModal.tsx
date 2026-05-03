import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import {
  Activity,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Hash,
  Hospital,
  Layers,
  MapPin,
  Phone,
  Stethoscope,
  User,
  X,
  XCircle,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import {
  CaseRequest,
  doctorDashboardService,
  PatientCaseDto,
} from '@/features/dashboard/services/doctorDashboardService';
import { getInitials, formatDate, getStageLabel } from './pendingCasesHelpers';
import { InfoCard } from './InfoCard';

interface CaseDetailModalProps {
  request: CaseRequest | null;
  onClose: () => void;
  onApprove: (requestId: string) => Promise<void>;
  onReject: (requestId: string) => Promise<void>;
  isDark: boolean;
  locale: string;
  t: (k: string, opts?: any) => string;
}

export function CaseDetailModal({
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
  const diagnosis = caseDetail?.diagnosisdto;

  return (
    <Modal visible={!!request} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} onPress={onClose}>
        <Pressable style={{ marginTop: 'auto' }} onPress={(e) => e.stopPropagation()}>
          <View style={{ height: '100%' }} className={`rounded-t-[48px] border-t overflow-hidden ${isDark ? 'bg-[#020617] border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
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

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
              {caseLoading ? (
                <View className="py-24 items-center">
                  <ActivityIndicator size="large" color="#4f46e5" />
                  <Text className="text-slate-400 text-sm font-bold mt-4">{t('loading')}</Text>
                </View>
              ) : (
                <View className="px-6">
                  {/* Identity Section */}
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
                  {(request?.description || diagnosis?.notes) && (
                    <View className={`p-5 rounded-[32px] mb-6 border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                       <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                          {t('motivation_label')}
                       </Text>
                       <Text className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-6">
                          {request?.description || diagnosis?.notes}
                       </Text>
                    </View>
                  )}

                  {/* Diagnosis & Case Data Grid */}
                  <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[2.5px] mb-4 ml-1">
                     {t('case_details_label')}
                  </Text>
                  <View className="flex-row flex-wrap justify-between gap-y-3 mb-6">
                    <View className="w-[48%]">
                      <InfoCard icon={Stethoscope} label={t('case_type')} value={diagnosis?.caseType || "N/A"} isDark={isDark} colorClass="text-indigo-500" />
                    </View>
                    <View className="w-[48%]">
                      <InfoCard icon={Layers} label={t('diagnosis_stage')} value={getStageLabel(diagnosis?.stage ?? -1, t)} isDark={isDark} colorClass="text-violet-500" />
                    </View>
                    <View className="w-[48%]">
                      <InfoCard icon={Activity} label={t('process_status')} value={caseDetail?.processStatus || "N/A"} isDark={isDark} colorClass="text-blue-500" />
                    </View>
                    <View className="w-[48%]">
                      <InfoCard icon={Hash} label={t('teeth_numbers')} value={diagnosis?.teethNumbers?.join(', ') || "N/A"} isDark={isDark} colorClass="text-emerald-500" />
                    </View>
                  </View>

                  {/* Patient Info Grid */}
                  <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[2.5px] mb-4 ml-1">
                     {t('patient_info')}
                  </Text>
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

            {/* Action Buttons */}
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
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
