import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  FileText,
  GraduationCap,
  MapPin,
  Phone,
  Stethoscope,
  User,
  X,
  XCircle,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  I18nManager,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

import { getCaseById } from '@/features/cases/services/caseService';
import {
  CaseRequest,
  doctorDashboardService,
} from '@/features/dashboard/services/doctorDashboardService';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { useAppSelector } from '@/store/hooks';
import { useDispatch } from 'react-redux';
import { showToast } from '@/store/slices/uiSlice';

const { height: SCREEN_H } = Dimensions.get('window');

// ─── Tooth chart colours ──────────────────────────────────────────────────────
function toothColor(status: string) {
  switch (status) {
    case 'needs-treatment': return { fill: '#fef2f2', stroke: '#ef4444' };
    case 'in-progress':     return { fill: '#fefce8', stroke: '#eab308' };
    case 'treated':         return { fill: '#f0fdf4', stroke: '#22c55e' };
    default:                return { fill: '#f8fafc', stroke: '#cbd5e1' };
  }
}

const TOP_R = [18, 17, 16, 15, 14, 13, 12, 11];
const TOP_L = [21, 22, 23, 24, 25, 26, 27, 28];
const BTM_R = [48, 47, 46, 45, 44, 43, 42, 41];
const BTM_L = [31, 32, 33, 34, 35, 36, 37, 38];

function TeethRow({ nums, teethNums, isDark }: { nums: number[]; teethNums: number[]; isDark: boolean }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4 }}>
      {nums.map((n) => {
        const affected = teethNums.includes(n);
        const c = toothColor(affected ? 'needs-treatment' : 'healthy');
        return (
          <View key={n} style={{ alignItems: 'center', gap: 2, width: 28 }}>
            <View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
              <MaterialCommunityIcons
                name="tooth"
                size={26}
                color={isDark && !affected ? '#1e293b' : c.fill}
                style={{ position: 'absolute' }}
              />
              <MaterialCommunityIcons
                name="tooth-outline"
                size={26}
                color={isDark && !affected ? '#475569' : c.stroke}
                style={{ position: 'absolute' }}
              />
            </View>
            <Text style={{ fontSize: 9, fontWeight: '600', color: isDark ? '#64748b' : '#94a3b8' }}>{n}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, isDark, color = '#4f46e5' }: any) {
  const isRtl = I18nManager.isRTL;
  return (
    <View style={{ flexDirection: isRtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: isDark ? '#1e293b' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={14} color={color} />
      </View>
      <View style={{ flex: 1, alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
        <Text style={{ fontSize: 9, fontWeight: '700', color: isDark ? '#64748b' : '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</Text>
        <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#f1f5f9' : '#1e293b', marginTop: 1 }}>{value || '—'}</Text>
      </View>
    </View>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, isDark }: { title: string; isDark: boolean }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: '900', color: isDark ? '#64748b' : '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 14, marginTop: 8 }}>
      {title}
    </Text>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
interface Props {
  request: CaseRequest | null;
  visible: boolean;
  onClose: () => void;
  onActionDone: () => void;
  isUnderReview: boolean;
}

export function RequestDetailModal({ request, visible, onClose, onActionDone, isUnderReview }: Props) {
  const { t } = useTranslation();
  const { theme, language } = useThemeLanguage();
  const isDark = theme === 'dark';
  const isRtl = language === 'ar';
  const locale = isRtl ? 'ar-EG' : 'en-GB';
  const { user } = useAppSelector((s) => s.auth);
  const doctorId = (user as any)?.publicId ?? (user as any)?.id;
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);

  // Fetch full case data from /api/Cases/{patientCasePublicId}
  const { data: caseData, isLoading: caseLoading } = useQuery({
    queryKey: ['case-detail-for-request', request?.patientCasePublicId],
    queryFn: async () => {
      const res = await getCaseById(request!.patientCasePublicId);
      if (res.success && res.data) return res.data;
      return null;
    },
    enabled: !!request?.patientCasePublicId && visible,
    staleTime: 30_000,
  });

  // Fetch diagnoses data from /api/Diagnoses/case/{patientCaseId}
  const { data: diagnosesData, isLoading: diagnosesLoading } = useQuery({
    queryKey: ['case-diagnoses', request?.patientCasePublicId],
    queryFn: async () => {
      const res = await doctorDashboardService.getDiagnosesForCase(request!.patientCasePublicId);
      return res;
    },
    enabled: !!request?.patientCasePublicId && visible,
    staleTime: 30_000,
  });

  if (!request) return null;

  const formattedDate = new Date(request.createAt).toLocaleDateString(locale, {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  // Teeth and Diagnosis data
  const diag = diagnosesData?.items?.[0] || caseData?.diagnosisdto;
  const allTeethNums: number[] = diag?.teethNumbers ?? [];
  const caseTypeName = (diag as any)?.caseTypeName || diag?.caseType || caseData?.caseType?.name || request.caseName || '—';
  const diagNotes = diag?.notes || ''; // Do NOT fall back to description here to avoid duplication
  const universityName = request.university || caseData?.universityName || '—';
  const isDataLoading = caseLoading || diagnosesLoading;

  const handleApprove = async () => {
    try {
      setApproving(true);
      await doctorDashboardService.approveRequest(request.id, doctorId);
      await queryClient.invalidateQueries({ queryKey: ['doctor'] });
      await queryClient.invalidateQueries({ queryKey: ['doctor-pending-cases'] });
      onActionDone();
      onClose();
      dispatch(showToast({ message: t('request_approved', 'Request approved successfully'), type: 'success' }));
    } catch (e: any) {
      dispatch(showToast({ message: e?.message ?? t('action_failed', 'Action failed'), type: 'error' }));
    } finally {
      setApproving(false);
      setConfirmAction(null);
    }
  };

  const handleReject = async () => {
    try {
      setRejecting(true);
      await doctorDashboardService.rejectRequest(request.id, doctorId);
      await queryClient.invalidateQueries({ queryKey: ['doctor'] });
      await queryClient.invalidateQueries({ queryKey: ['doctor-pending-cases'] });
      onActionDone();
      onClose();
      dispatch(showToast({ message: t('request_rejected', 'Request rejected successfully'), type: 'success' }));
    } catch (e: any) {
      dispatch(showToast({ message: e?.message ?? t('action_failed', 'Action failed'), type: 'error' }));
    } finally {
      setRejecting(false);
      setConfirmAction(null);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View entering={FadeIn.duration(200)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' }}>
        <Animated.View
          entering={SlideInDown.duration(350).springify().damping(18)}
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            maxHeight: SCREEN_H * 0.93,
            backgroundColor: isDark ? '#0f172a' : '#f8fafc',
            borderTopLeftRadius: 40, borderTopRightRadius: 40,
            overflow: 'hidden',
          }}
        >
          {/* Gradient accent top */}
          <LinearGradient
            colors={isDark ? ['#1e1b4b', '#0f172a'] : ['#6366f1', '#3b82f6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ height: 100, padding: 20, paddingTop: 18, justifyContent: 'space-between' }}
          >
            {/* Handle + close */}
            <View style={{ flexDirection: isRtl ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={onClose}
                style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}
              >
                {isRtl ? <ChevronLeft size={18} color="white" /> : <X size={18} color="white" />}
              </TouchableOpacity>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '900' }}>
                {t('request_details', 'Request Details')}
              </Text>
              <View style={{ width: 36 }} />
            </View>

            {/* Student initials + name */}
            <View style={{ flexDirection: isRtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'white', fontWeight: '900', fontSize: 14 }}>
                  {(request.studentName ?? 'S').split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase()}
                </Text>
              </View>
              <View style={{ alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
                <Text style={{ color: 'white', fontWeight: '900', fontSize: 15 }} numberOfLines={1}>{request.studentName}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '600' }}>{formattedDate}</Text>
              </View>
            </View>
          </LinearGradient>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: isUnderReview ? 140 : 40 }}
          >
            {isDataLoading ? (
              <View style={{ paddingVertical: 60, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={{ color: isDark ? '#64748b' : '#94a3b8', marginTop: 12, fontWeight: '600' }}>
                  {t('loading', 'Loading...')}
                </Text>
              </View>
            ) : (
              <>
                {/* ── Patient Info ── */}
                <View style={{ marginBottom: 16, padding: 16, borderRadius: 24, backgroundColor: isDark ? '#1e293b' : '#ffffff', borderWidth: 1, borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                  <SectionHeader title={t('patient_info', 'Patient Information')} isDark={isDark} />
                  <InfoRow icon={User} label={t('patient', 'Patient')} value={request.patientName} isDark={isDark} color="#6366f1" />
                  <InfoRow icon={Phone} label={t('phone', 'Phone')} value={caseData?.phone} isDark={isDark} color="#10b981" />
                  <InfoRow icon={MapPin} label={t('city', 'City')} value={caseData?.city} isDark={isDark} color="#f43f5e" />
                  <InfoRow icon={User} label={t('age', 'Age')} value={caseData?.patientAge ? `${caseData.patientAge} ${t('years_old', 'years old')}` : null} isDark={isDark} color="#f59e0b" />
                  <InfoRow icon={Calendar} label={t('date', 'Date')} value={formattedDate} isDark={isDark} color="#3b82f6" />
                </View>

                {/* ── Student Info ── */}
                <View style={{ marginBottom: 16, padding: 16, borderRadius: 24, backgroundColor: isDark ? '#1e293b' : '#ffffff', borderWidth: 1, borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                  <SectionHeader title={t('student_info', 'Student Information')} isDark={isDark} />
                  <InfoRow icon={GraduationCap} label={t('student', 'Student')} value={request.studentName} isDark={isDark} color="#8b5cf6" />
                  <InfoRow icon={BookOpen} label={t('level', 'Level')} value={request.level ? `Level ${request.level}` : null} isDark={isDark} color="#6366f1" />
                  <InfoRow icon={MapPin} label={t('university', 'University')} value={universityName} isDark={isDark} color="#10b981" />
                </View>

                {/* ── Diagnosis ── */}
                <View style={{ marginBottom: 16, padding: 16, borderRadius: 24, backgroundColor: isDark ? '#1e293b' : '#ffffff', borderWidth: 1, borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                  <SectionHeader title={t('diagnosis', 'Diagnosis')} isDark={isDark} />
                  <InfoRow icon={Stethoscope} label={t('case_type', 'Case Type')} value={caseTypeName} isDark={isDark} color="#6366f1" />
                  {diagNotes ? (
                    <View style={{ padding: 12, borderRadius: 16, backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderWidth: 1, borderColor: isDark ? '#1e293b' : '#e2e8f0', marginTop: 4 }}>
                      <InfoRow icon={FileText} label={t('notes', 'Notes')} value={diagNotes} isDark={isDark} color="#64748b" />
                    </View>
                  ) : null}
                  {request.description ? (
                    <View style={{ marginTop: 8, padding: 12, borderRadius: 16, backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderWidth: 1, borderColor: isDark ? '#1e293b' : '#e2e8f0' }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#64748b' : '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
                        {t('request_description', 'Request Description')}
                      </Text>
                      <Text style={{ fontSize: 13, color: isDark ? '#cbd5e1' : '#475569', lineHeight: 20 }}>
                        {request.description}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* ── Dental Chart ── */}
                {allTeethNums.length > 0 && (
                  <View style={{ marginBottom: 16, padding: 16, borderRadius: 24, backgroundColor: isDark ? '#1e293b' : '#ffffff', borderWidth: 1, borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                    <SectionHeader title={t('dental_chart', 'Dental Chart')} isDark={isDark} />

                    {/* Affected teeth badges */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                      {allTeethNums.map(n => (
                        <View key={n} style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: isDark ? '#450a0a' : '#fee2e2', borderWidth: 1, borderColor: '#ef4444' }}>
                          <Text style={{ fontSize: 11, fontWeight: '800', color: '#ef4444' }}>#{n}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Chart */}
                    <View style={{ backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: isDark ? '#1e293b' : '#e2e8f0' }}>
                      <Text style={{ textAlign: 'center', fontSize: 10, fontWeight: '700', color: isDark ? '#475569' : '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                        Upper (Maxillary)
                      </Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                          <TeethRow nums={TOP_R} teethNums={allTeethNums} isDark={isDark} />
                        </View>
                        <View style={{ width: 1, backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }} />
                        <View style={{ flex: 1, alignItems: 'flex-start' }}>
                          <TeethRow nums={TOP_L} teethNums={allTeethNums} isDark={isDark} />
                        </View>
                      </View>

                      <View style={{ height: 1, backgroundColor: isDark ? '#1e293b' : '#e2e8f0', marginVertical: 10 }} />

                      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                          <TeethRow nums={BTM_R} teethNums={allTeethNums} isDark={isDark} />
                        </View>
                        <View style={{ width: 1, backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }} />
                        <View style={{ flex: 1, alignItems: 'flex-start' }}>
                          <TeethRow nums={BTM_L} teethNums={allTeethNums} isDark={isDark} />
                        </View>
                      </View>
                      <Text style={{ textAlign: 'center', fontSize: 10, fontWeight: '700', color: isDark ? '#475569' : '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
                        Lower (Mandibular)
                      </Text>

                      {/* Legend */}
                      <View style={{ flexDirection: 'row', gap: 16, justifyContent: 'center', marginTop: 14 }}>
                        {[
                          { label: 'Healthy', color: '#94a3b8', bg: isDark ? '#1e293b' : '#f8fafc' },
                          { label: 'Needs Treatment', color: '#ef4444', bg: '#fef2f2' },
                        ].map(item => (
                          <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: item.bg, borderWidth: 1, borderColor: item.color }} />
                            <Text style={{ fontSize: 10, fontWeight: '600', color: isDark ? '#64748b' : '#94a3b8' }}>{item.label}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                )}

                {/* ── Images ── */}
                {(caseData?.imageUrls ?? []).length > 0 && (
                  <View style={{ marginBottom: 16, padding: 16, borderRadius: 24, backgroundColor: isDark ? '#1e293b' : '#ffffff', borderWidth: 1, borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                    <SectionHeader title={t('images', 'Clinical Images')} isDark={isDark} />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                      {(caseData!.imageUrls ?? []).map((url: string, i: number) => (
                        <Image
                          key={i}
                          source={{ uri: url }}
                          style={{ width: 140, height: 140, borderRadius: 18 }}
                          resizeMode="cover"
                        />
                      ))}
                    </ScrollView>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* ── Approve / Reject Buttons ── */}
          {isUnderReview && (
            <View
              style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                paddingHorizontal: 20, paddingBottom: 36, paddingTop: 16,
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                borderTopWidth: 1, borderTopColor: isDark ? '#1e293b' : '#e2e8f0',
                flexDirection: isRtl ? 'row-reverse' : 'row',
                gap: 12,
              }}
            >
              {/* Reject */}
              {/* Reject */}
              <TouchableOpacity
                onPress={() => setConfirmAction('reject')}
                disabled={rejecting || approving}
                style={{
                  flex: 1,
                  height: 54,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 8,
                  backgroundColor: isDark ? '#450a0a' : '#fee2e2',
                  borderWidth: 1,
                  borderColor: '#ef4444',
                  opacity: rejecting || approving ? 0.6 : 1,
                }}
              >
                {rejecting ? (
                  <ActivityIndicator size="small" color="#ef4444" />
                ) : (
                  <>
                    <XCircle size={18} color="#ef4444" />
                    <Text style={{ color: '#ef4444', fontWeight: '900', fontSize: 14 }}>
                      {t('reject', 'Reject')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Approve */}
              <TouchableOpacity
                onPress={() => setConfirmAction('approve')}
                disabled={approving || rejecting}
                style={{
                  flex: 1.6,
                  height: 54,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 8,
                  opacity: approving || rejecting ? 0.6 : 1,
                  overflow: 'hidden',
                }}
              >
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    borderRadius: 18,
                  }}
                />
                {approving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <CheckCircle2 size={18} color="white" />
                    <Text style={{ color: 'white', fontWeight: '900', fontSize: 14 }}>
                      {t('approve', 'Approve')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </Animated.View>

      {/* ── Confirmation Modal ── */}
      <Modal visible={!!confirmAction} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Animated.View 
            entering={FadeIn.duration(200)}
            style={{ 
              width: '100%', 
              backgroundColor: isDark ? '#1e293b' : '#ffffff', 
              borderRadius: 32, 
              padding: 24, 
              alignItems: 'center',
              borderWidth: 1,
              borderColor: isDark ? '#334155' : '#e2e8f0'
            }}
          >
            <View style={{ 
              width: 64, height: 64, borderRadius: 22, 
              backgroundColor: confirmAction === 'approve' ? (isDark ? '#064e3b' : '#d1fae5') : (isDark ? '#450a0a' : '#fee2e2'),
              alignItems: 'center', justifyContent: 'center', marginBottom: 16
            }}>
              {confirmAction === 'approve' ? (
                <CheckCircle2 size={32} color="#10b981" />
              ) : (
                <XCircle size={32} color="#ef4444" />
              )}
            </View>

            <Text style={{ fontSize: 20, fontWeight: '900', color: isDark ? '#f1f5f9' : '#1e293b', marginBottom: 8, textAlign: 'center' }}>
              {confirmAction === 'approve' ? t('approve_request', 'Approve Request') : t('reject_request', 'Reject Request')}
            </Text>
            
            <Text style={{ fontSize: 14, color: isDark ? '#94a3b8' : '#64748b', textAlign: 'center', marginBottom: 24, lineHeight: 20, fontWeight: '600' }}>
              {confirmAction === 'approve' 
                ? t('approve_request_confirm', 'Are you sure you want to approve this request?') 
                : t('reject_request_confirm', 'Are you sure you want to reject this request?')}
            </Text>

            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity 
                onPress={() => setConfirmAction(null)}
                style={{ flex: 1, height: 50, borderRadius: 16, backgroundColor: isDark ? '#0f172a' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontWeight: '800', color: isDark ? '#94a3b8' : '#64748b' }}>{t('cancel')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={confirmAction === 'approve' ? handleApprove : handleReject}
                disabled={approving || rejecting}
                style={{ 
                  flex: 1, height: 50, borderRadius: 16, 
                  backgroundColor: confirmAction === 'approve' ? '#10b981' : '#ef4444', 
                  alignItems: 'center', justifyContent: 'center' 
                }}
              >
                {approving || rejecting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{ fontWeight: '900', color: 'white' }}>
                    {confirmAction === 'approve' ? t('confirm_approve', 'Approve') : t('confirm_reject', 'Reject')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </Modal>
  );
}
