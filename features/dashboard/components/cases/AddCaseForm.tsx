import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Modal, FlatList, I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Search, X, ChevronDown, Check } from 'lucide-react-native';
import { doctorDashboardService, CaseTypeDto } from '../../services/doctorDashboardService';
import { createCase } from '@/features/cases/services/caseService';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface AddCaseFormProps {
  isDark: boolean;
  locale: string;
  universityId?: string;
  onSuccess: () => void;
}

export function AddCaseForm({ isDark, locale, universityId, onSuccess }: AddCaseFormProps) {
  const { t } = useTranslation();
  const isRtl = I18nManager.isRTL;
  const user = useSelector((state: RootState) => state.auth.user as any);

  // Form State
  const [description, setDescription] = useState('');
  const [selectedCaseType, setSelectedCaseType] = useState<CaseTypeDto | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals state
  const [showCaseTypeModal, setShowCaseTypeModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);

  // Search Data State
  const [caseTypes, setCaseTypes] = useState<CaseTypeDto[]>([]);
  const [caseTypesLoading, setCaseTypesLoading] = useState(false);
  const [caseTypeSearch, setCaseTypeSearch] = useState('');

  const [patients, setPatients] = useState<any[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');

  // Fetch Case Types
  useEffect(() => {
    if (showCaseTypeModal) {
      const fetchCaseTypes = async () => {
        setCaseTypesLoading(true);
        try {
          const res = await doctorDashboardService.searchCaseTypes(caseTypeSearch);
          setCaseTypes(res.items);
        } catch (e) {
          console.error(e);
        } finally {
          setCaseTypesLoading(false);
        }
      };
      const timer = setTimeout(fetchCaseTypes, 300);
      return () => clearTimeout(timer);
    }
  }, [showCaseTypeModal, caseTypeSearch]);

  // Fetch Patients
  useEffect(() => {
    if (showPatientModal) {
      const fetchPatients = async () => {
        setPatientsLoading(true);
        try {
          const res = await doctorDashboardService.searchPatients(patientSearch);
          setPatients(res.items);
        } catch (e) {
          console.error(e);
        } finally {
          setPatientsLoading(false);
        }
      };
      const timer = setTimeout(fetchPatients, 300);
      return () => clearTimeout(timer);
    }
  }, [showPatientModal, patientSearch]);

  const handleSubmit = async () => {
    if (!description || !selectedPatient || !selectedCaseType) return;
    setIsSubmitting(true);
    try {
      await createCase({
        NationalId: selectedPatient.nationalId || "",
        Description: description,
        IsPublic: true,
        UniversityId: universityId || "11111111-1111-1111-1111-111111111111",
        CreatedById: user?.publicId || "",
        CreatedByRole: user?.role || "Doctor",
        InitialDiagnosis: {
          Stage: 1,
          CaseTypeId: selectedCaseType.publicId,
          TeethNumbers: [],
        }
      });
      setDescription('');
      setSelectedCaseType(null);
      setSelectedPatient(null);
      onSuccess();
    } catch (e) {
      console.error(e);
      // Optional: Add error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = description.trim() !== '' && selectedPatient && selectedCaseType;

  return (
    <View className="px-6 py-6 pb-20">
      <View className={`p-5 rounded-[32px] border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800 shadow-none' : 'bg-white border-slate-100 shadow-slate-200/50'}`}>
        {/* Patient Selection */}
        <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">{t('patient')}</Text>
        <TouchableOpacity
          onPress={() => setShowPatientModal(true)}
          className={`flex-row items-center justify-between px-4 py-3.5 rounded-2xl border mb-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
        >
          <Text className={`text-sm font-medium ${selectedPatient ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-slate-400' : 'text-slate-400')}`}>
            {selectedPatient ? selectedPatient.name || selectedPatient.fullName || selectedPatient.patientName : t('select_patient', 'Select Patient')}
          </Text>
          <ChevronDown size={18} color={isDark ? '#64748b' : '#94a3b8'} />
        </TouchableOpacity>

        {/* Case Type Selection */}
        <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">{t('case_type')}</Text>
        <TouchableOpacity
          onPress={() => setShowCaseTypeModal(true)}
          className={`flex-row items-center justify-between px-4 py-3.5 rounded-2xl border mb-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
        >
          <Text className={`text-sm font-medium ${selectedCaseType ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-slate-400' : 'text-slate-400')}`}>
            {selectedCaseType ? selectedCaseType.name : t('select_case_type', 'Select Case Type')}
          </Text>
          <ChevronDown size={18} color={isDark ? '#64748b' : '#94a3b8'} />
        </TouchableOpacity>

        {/* Description */}
        <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">{t('description')}</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder={t('description_placeholder', 'Enter case description')}
          placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          className={`px-4 py-3.5 rounded-2xl border text-sm font-medium mb-6 min-h-[100px] ${isDark ? 'text-white bg-slate-800 border-slate-700' : 'text-slate-900 bg-slate-50 border-slate-200'}`}
          style={{ writingDirection: isRtl ? 'rtl' : 'ltr' }}
        />

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          className={`py-4 rounded-2xl flex-row items-center justify-center gap-2 ${!isFormValid ? (isDark ? 'bg-slate-800' : 'bg-slate-200') : 'bg-indigo-600'}`}
        >
          {isSubmitting ? (
            <ActivityIndicator size={16} color="white" />
          ) : (
            <CheckCircle2 size={16} color={!isFormValid ? (isDark ? '#475569' : '#94a3b8') : 'white'} />
          )}
          <Text className={`font-black text-sm uppercase ${!isFormValid ? (isDark ? 'text-slate-500' : 'text-slate-400') : 'text-white'}`}>
            {isSubmitting ? t('submitting', 'Submitting') : t('create_case', 'Create Case')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Patient Search Modal */}
      <Modal visible={showPatientModal} animationType="slide" transparent>
        <View className={`flex-1 mt-24 rounded-t-3xl shadow-xl overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          <View className={`px-5 py-4 border-b flex-row items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <Text className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('select_patient', 'Select Patient')}</Text>
            <TouchableOpacity onPress={() => setShowPatientModal(false)} className="p-2">
              <X size={20} color={isDark ? '#cbd5e1' : '#64748b'} />
            </TouchableOpacity>
          </View>
          <View className="px-5 py-3">
            <View className={`flex-row items-center px-4 h-12 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <Search size={18} color={isDark ? '#64748b' : '#94a3b8'} />
              <TextInput
                value={patientSearch}
                onChangeText={setPatientSearch}
                placeholder={t('search_patients', 'Search Patients')}
                placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                className={`flex-1 ml-2 text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}
              />
            </View>
          </View>
          {patientsLoading ? (
            <View className="py-10 items-center justify-center">
              <ActivityIndicator size="small" color={isDark ? '#818cf8' : '#4f46e5'} />
            </View>
          ) : (
            <FlatList
              data={patients}
              keyExtractor={(item, idx) => item.id || item.publicId || idx.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedPatient(item);
                    setShowPatientModal(false);
                  }}
                  className={`px-5 py-4 border-b flex-row justify-between items-center ${isDark ? 'border-slate-800' : 'border-slate-50'}`}
                >
                  <Text className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {item.name || item.fullName || item.patientName || 'Unknown'}
                  </Text>
                  {selectedPatient && (selectedPatient.id === item.id || selectedPatient.publicId === item.publicId) && (
                    <Check size={18} color="#4f46e5" />
                  )}
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </Modal>

      {/* Case Type Search Modal */}
      <Modal visible={showCaseTypeModal} animationType="slide" transparent>
        <View className={`flex-1 mt-24 rounded-t-3xl shadow-xl overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          <View className={`px-5 py-4 border-b flex-row items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <Text className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('select_case_type', 'Select Case Type')}</Text>
            <TouchableOpacity onPress={() => setShowCaseTypeModal(false)} className="p-2">
              <X size={20} color={isDark ? '#cbd5e1' : '#64748b'} />
            </TouchableOpacity>
          </View>
          <View className="px-5 py-3">
            <View className={`flex-row items-center px-4 h-12 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <Search size={18} color={isDark ? '#64748b' : '#94a3b8'} />
              <TextInput
                value={caseTypeSearch}
                onChangeText={setCaseTypeSearch}
                placeholder={t('search_case_types', 'Search Case Types')}
                placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                className={`flex-1 ml-2 text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}
              />
            </View>
          </View>
          {caseTypesLoading ? (
            <View className="py-10 items-center justify-center">
              <ActivityIndicator size="small" color={isDark ? '#818cf8' : '#4f46e5'} />
            </View>
          ) : (
            <FlatList
              data={caseTypes}
              keyExtractor={(item) => item.publicId}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCaseType(item);
                    setShowCaseTypeModal(false);
                  }}
                  className={`px-5 py-4 border-b flex-row justify-between items-center ${isDark ? 'border-slate-800' : 'border-slate-50'}`}
                >
                  <Text className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {item.name}
                  </Text>
                  {selectedCaseType?.publicId === item.publicId && (
                    <Check size={18} color="#4f46e5" />
                  )}
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </Modal>

    </View>
  );
}
