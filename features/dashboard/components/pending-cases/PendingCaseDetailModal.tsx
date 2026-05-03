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
  PlusCircle,
  Search,
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
  TextInput,
  Platform,
} from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

import { getCaseById } from '@/features/cases/services/caseService';
import {
  PatientCaseDto,
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

function TeethRow({ nums, teethNums, isDark, onToothPress }: { nums: number[]; teethNums: number[]; isDark: boolean; onToothPress?: (n: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4 }}>
      {nums.map((n) => {
        const affected = teethNums.includes(n);
        const c = toothColor(affected ? 'needs-treatment' : 'healthy');
        return (
          <TouchableOpacity 
            key={n} 
            onPress={() => onToothPress?.(n)}
            disabled={!onToothPress}
            style={{ alignItems: 'center', gap: 2, width: 28 }}
          >
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
          </TouchableOpacity>
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
  caseItem: PatientCaseDto | null;
  visible: boolean;
  onClose: () => void;
}

export function PendingCaseDetailModal({ caseItem, visible, onClose }: Props) {
  const { t } = useTranslation();
  const { theme, language } = useThemeLanguage();
  const isDark = theme === 'dark';
  const isRtl = language === 'ar';
  const locale = isRtl ? 'ar-EG' : 'en-GB';
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const userId = (user as any)?.publicId || (user as any)?.id;

  const [isAddingDiagnosis, setIsAddingDiagnosis] = useState(false);
  const [selectedCaseTypeId, setSelectedCaseTypeId] = useState<string>('');
  const [caseTypeSearch, setCaseTypeSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newDiagNotes, setNewDiagNotes] = useState('');
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch full case data from /api/Cases/{id}
  const { data: caseData, isLoading: caseLoading } = useQuery({
    queryKey: ['case-detail-for-pending', caseItem?.id],
    queryFn: async () => {
      const res = await getCaseById(caseItem!.id);
      if (res.success && res.data) return res.data;
      return null;
    },
    enabled: !!caseItem?.id && visible,
    staleTime: 30_000,
  });

  // Fetch diagnoses data from /api/Diagnoses/case/{id}
  const { data: diagnosesData, isLoading: diagnosesLoading } = useQuery({
    queryKey: ['case-diagnoses', caseItem?.id],
    queryFn: async () => {
      const res = await doctorDashboardService.getDiagnosesForCase(caseItem!.id);
      return res;
    },
    enabled: !!caseItem?.id && visible,
    staleTime: 30_000,
  });

  // Fetch available case types
  const { data: caseTypes } = useQuery({
    queryKey: ['available-case-types'],
    queryFn: () => doctorDashboardService.getCaseTypes(1, 100),
    enabled: isAddingDiagnosis,
  });

  const filteredCaseTypes = caseTypes?.filter(ct => 
    ct.name.toLowerCase().includes(caseTypeSearch.toLowerCase())
  ) || [];

  const selectedCaseType = caseTypes?.find(ct => ct.publicId === selectedCaseTypeId);

  const handleAddDiagnosis = async () => {
    if (!selectedCaseTypeId) {
      dispatch(showToast({ 
        message: t('please_select_case_type', 'Please select a case type'), 
        type: 'error' 
      }));
      return;
    }

    try {
      setIsSubmitting(true);
      await doctorDashboardService.createDiagnosis({
        patientCaseId: caseItem!.id,
        stage: 0, // Initial
        caseTypeId: selectedCaseTypeId,
        notes: newDiagNotes,
        createdById: userId,
        role: 'Doctor',
        teethNumbers: selectedTeeth,
      });

      await queryClient.invalidateQueries({ queryKey: ['case-diagnoses', caseItem?.id] });
      await queryClient.invalidateQueries({ queryKey: ['doctor-pending-cases'] });
      
      setIsAddingDiagnosis(false);
      setNewDiagNotes('');
      setSelectedCaseTypeId('');
      setSelectedTeeth([]);
      dispatch(showToast({ 
        message: t('diagnosis_added_successfully', 'Diagnosis added successfully'), 
        type: 'success' 
      }));
    } catch (error: any) {
      dispatch(showToast({ 
        message: error?.message || t('failed_to_add_diagnosis', 'Failed to add diagnosis'), 
        type: 'error' 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTooth = (n: number) => {
    setSelectedTeeth(prev => 
      prev.includes(n) ? prev.filter(t => t !== n) : [...prev, n]
    );
  };

  if (!caseItem) return null;

  const formattedDate = new Date(caseItem.createAt).toLocaleDateString(locale, {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  // Teeth and Diagnosis data
  const diag = diagnosesData?.items?.[0] || caseData?.diagnoses?.[0] || caseData?.diagnosisdto || (caseData as any)?.diagnosisDto || (caseData as any)?.diagnosis;
  const allTeethNums: number[] = diag?.teethNumbers ?? [];
  const caseTypeName = (diag as any)?.caseTypeName || diag?.caseType || caseData?.caseType?.name || (caseItem as any)?.caseName || (caseItem as any)?.title || '—';
  const diagNotes = diag?.notes || (diag as any)?.description || (diag as any)?.notesText || caseData?.description || (caseItem as any)?.description || '';
  const universityName = caseItem.universityName || caseData?.universityName || '—';
  const isDataLoading = caseLoading || diagnosesLoading;



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
                {t('case_details', 'Case Details')}
              </Text>
              <View style={{ width: 36 }} />
            </View>

            {/* Patient initials + name */}
            <View style={{ flexDirection: isRtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'white', fontWeight: '900', fontSize: 14 }}>
                  {(caseItem.patientName ?? 'P').split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase()}
                </Text>
              </View>
              <View style={{ alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
                <Text style={{ color: 'white', fontWeight: '900', fontSize: 15 }} numberOfLines={1}>{caseItem.patientName}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '600' }}>{formattedDate}</Text>
              </View>
            </View>
          </LinearGradient>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
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
                  <InfoRow icon={User} label={t('patient', 'Patient')} value={caseItem.patientName} isDark={isDark} color="#6366f1" />
                  <InfoRow icon={Phone} label={t('phone', 'Phone')} value={caseItem?.phone || caseData?.phone} isDark={isDark} color="#10b981" />
                  <InfoRow icon={MapPin} label={t('city', 'City')} value={caseItem?.city || caseData?.city} isDark={isDark} color="#f43f5e" />
                  <InfoRow icon={User} label={t('age', 'Age')} value={caseItem.patientAge ? `${caseItem.patientAge} ${t('years_old', 'years old')}` : null} isDark={isDark} color="#f59e0b" />
                  <InfoRow icon={Calendar} label={t('date', 'Date')} value={formattedDate} isDark={isDark} color="#3b82f6" />
                </View>

                {/* ── General Info ── */}
                <View style={{ marginBottom: 16, padding: 16, borderRadius: 24, backgroundColor: isDark ? '#1e293b' : '#ffffff', borderWidth: 1, borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                  <SectionHeader title={t('general_info', 'General Information')} isDark={isDark} />
                  <InfoRow icon={MapPin} label={t('university', 'University')} value={universityName} isDark={isDark} color="#10b981" />
                  <InfoRow icon={GraduationCap} label={t('assigned_student', 'Assigned Student')} value={(caseItem as any)?.assignedStudentName || caseData?.assignedStudentId ? t('assigned', 'Assigned') : t('not_assigned', 'Not Assigned')} isDark={isDark} color="#8b5cf6" />
                </View>

                {/* ── Diagnosis Section ── */}
                <View style={{ marginBottom: 16, padding: 16, borderRadius: 24, backgroundColor: isDark ? '#1e293b' : '#ffffff', borderWidth: 1, borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                  <SectionHeader title={t('diagnosis', 'Diagnosis')} isDark={isDark} />
                  
                  {diag ? (
                    <>
                      <InfoRow icon={Stethoscope} label={t('case_type', 'Case Type')} value={caseTypeName} isDark={isDark} color="#6366f1" />
                      {diagNotes ? (
                        <View style={{ marginTop: 8, padding: 12, borderRadius: 16, backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderWidth: 1, borderColor: isDark ? '#1e293b' : '#e2e8f0' }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#64748b' : '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
                            {t('notes', 'Notes')}
                          </Text>
                          <Text style={{ fontSize: 13, color: isDark ? '#cbd5e1' : '#475569', lineHeight: 20 }}>
                            {diagNotes}
                          </Text>
                        </View>
                      ) : null}
                    </>
                  ) : !isAddingDiagnosis ? (
                    <TouchableOpacity 
                      onPress={() => setIsAddingDiagnosis(true)}
                      style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: 8, 
                        paddingVertical: 12, 
                        borderRadius: 16, 
                        backgroundColor: '#6366f1',
                        marginTop: 4
                      }}
                    >
                      <PlusCircle size={18} color="white" />
                      <Text style={{ color: 'white', fontWeight: '800', fontSize: 14 }}>
                        {t('add_diagnosis', 'Add Diagnosis')}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={{ gap: 12 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#64748b' : '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                        {t('select_case_type', 'Select Case Type')}
                      </Text>
                      
                      {/* Searchable Dropdown */}
                      <View style={{ zIndex: 10 }}>
                        <TouchableOpacity
                          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                          style={{
                            height: 54,
                            paddingHorizontal: 16,
                            borderRadius: 16,
                            backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                            borderWidth: 1,
                            borderColor: isDark ? '#334155' : '#e2e8f0',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <Text style={{ color: selectedCaseType ? (isDark ? '#f1f5f9' : '#1e293b') : (isDark ? '#475569' : '#94a3b8'), fontWeight: '600' }}>
                            {selectedCaseType ? selectedCaseType.name : t('select_case_type_placeholder', 'Search or select case type...')}
                          </Text>
                          <MaterialCommunityIcons 
                            name={isDropdownOpen ? "chevron-up" : "chevron-down"} 
                            size={20} 
                            color={isDark ? '#64748b' : '#94a3b8'} 
                          />
                        </TouchableOpacity>

                        {isDropdownOpen && (
                          <View 
                            style={{ 
                              marginTop: 8,
                              borderRadius: 16,
                              backgroundColor: isDark ? '#1e293b' : '#ffffff',
                              borderWidth: 1,
                              borderColor: isDark ? '#334155' : '#e2e8f0',
                              maxHeight: 250,
                              overflow: 'hidden',
                              ...Platform.select({
                                ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
                                android: { elevation: 8 }
                              })
                            }}
                          >
                            <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: isDark ? '#334155' : '#f1f5f9', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <Search size={16} color={isDark ? '#64748b' : '#94a3b8'} />
                              <TextInput
                                placeholder={t('search_case_types', 'Search...')}
                                placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                                value={caseTypeSearch}
                                onChangeText={setCaseTypeSearch}
                                style={{ flex: 1, height: 36, color: isDark ? '#f1f5f9' : '#1e293b', fontWeight: '600', fontSize: 13 }}
                              />
                            </View>
                            <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                              {filteredCaseTypes.length > 0 ? (
                                filteredCaseTypes.map((ct) => (
                                  <TouchableOpacity
                                    key={ct.publicId}
                                    onPress={() => {
                                      setSelectedCaseTypeId(ct.publicId);
                                      setIsDropdownOpen(false);
                                      setCaseTypeSearch('');
                                    }}
                                    style={{
                                      padding: 14,
                                      borderBottomWidth: 1,
                                      borderBottomColor: isDark ? '#334155' : '#f1f5f9',
                                      backgroundColor: selectedCaseTypeId === ct.publicId ? '#6366f120' : 'transparent'
                                    }}
                                  >
                                    <Text style={{ fontSize: 13, fontWeight: '600', color: selectedCaseTypeId === ct.publicId ? '#6366f1' : (isDark ? '#cbd5e1' : '#475569') }}>
                                      {ct.name}
                                    </Text>
                                  </TouchableOpacity>
                                ))
                              ) : (
                                <View style={{ padding: 20, alignItems: 'center' }}>
                                  <Text style={{ color: isDark ? '#475569' : '#94a3b8', fontSize: 12 }}>{t('no_results', 'No results found')}</Text>
                                </View>
                              )}
                            </ScrollView>
                          </View>
                        )}
                      </View>

                      <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#64748b' : '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 4 }}>
                        {t('notes', 'Notes')}
                      </Text>
                      <TextInput
                        multiline
                        placeholder={t('enter_notes_placeholder', 'Enter diagnostic notes...')}
                        placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                        value={newDiagNotes}
                        onChangeText={setNewDiagNotes}
                        style={{
                          minHeight: 80,
                          padding: 12,
                          borderRadius: 16,
                          backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                          borderWidth: 1,
                          borderColor: isDark ? '#334155' : '#e2e8f0',
                          color: isDark ? '#f1f5f9' : '#1e293b',
                          textAlignVertical: 'top',
                        }}
                      />

                      <TouchableOpacity 
                        onPress={handleAddDiagnosis}
                        disabled={isSubmitting}
                        style={{ 
                          height: 50, 
                          borderRadius: 16, 
                          backgroundColor: '#10b981', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          marginTop: 8,
                          opacity: isSubmitting ? 0.6 : 1
                        }}
                      >
                        {isSubmitting ? <ActivityIndicator color="white" /> : (
                          <Text style={{ color: 'white', fontWeight: '900', fontSize: 15 }}>{t('save_diagnosis', 'Save Diagnosis')}</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => setIsAddingDiagnosis(false)}
                        style={{ alignItems: 'center' }}
                      >
                        <Text style={{ color: isDark ? '#64748b' : '#94a3b8', fontWeight: '700', fontSize: 13 }}>{t('cancel')}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* ── Dental Chart ── */}
                {(diag || isAddingDiagnosis) && (
                  <View style={{ marginBottom: 16, padding: 16, borderRadius: 24, backgroundColor: isDark ? '#1e293b' : '#ffffff', borderWidth: 1, borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                    <SectionHeader title={t('dental_chart', 'Dental Chart')} isDark={isDark} />
                    
                    {isAddingDiagnosis && (
                      <Text style={{ fontSize: 12, color: isDark ? '#64748b' : '#94a3b8', marginBottom: 12, fontWeight: '600' }}>
                        {t('tap_teeth_to_select', 'Tap teeth on the chart to select affected areas.')}
                      </Text>
                    )}

                    {/* Affected teeth badges */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                      {(isAddingDiagnosis ? selectedTeeth : allTeethNums).map(n => (
                        <TouchableOpacity 
                          key={n} 
                          onPress={() => isAddingDiagnosis && toggleTooth(n)}
                          style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: isDark ? '#450a0a' : '#fee2e2', borderWidth: 1, borderColor: '#ef4444' }}
                        >
                          <Text style={{ fontSize: 11, fontWeight: '800', color: '#ef4444' }}>#{n}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Chart */}
                    <View style={{ backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: isDark ? '#1e293b' : '#e2e8f0' }}>
                      <Text style={{ textAlign: 'center', fontSize: 10, fontWeight: '700', color: isDark ? '#475569' : '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                        Upper (Maxillary)
                      </Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                          <TeethRow nums={TOP_R} teethNums={isAddingDiagnosis ? selectedTeeth : allTeethNums} isDark={isDark} onToothPress={isAddingDiagnosis ? toggleTooth : undefined} />
                        </View>
                        <View style={{ width: 1, backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }} />
                        <View style={{ flex: 1, alignItems: 'flex-start' }}>
                          <TeethRow nums={TOP_L} teethNums={isAddingDiagnosis ? selectedTeeth : allTeethNums} isDark={isDark} onToothPress={isAddingDiagnosis ? toggleTooth : undefined} />
                        </View>
                      </View>

                      <View style={{ height: 1, backgroundColor: isDark ? '#1e293b' : '#e2e8f0', marginVertical: 10 }} />

                      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                          <TeethRow nums={BTM_R} teethNums={isAddingDiagnosis ? selectedTeeth : allTeethNums} isDark={isDark} onToothPress={isAddingDiagnosis ? toggleTooth : undefined} />
                        </View>
                        <View style={{ width: 1, backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }} />
                        <View style={{ flex: 1, alignItems: 'flex-start' }}>
                          <TeethRow nums={BTM_L} teethNums={isAddingDiagnosis ? selectedTeeth : allTeethNums} isDark={isDark} onToothPress={isAddingDiagnosis ? toggleTooth : undefined} />
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


        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
