import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import {
  Search,
  UserPlus,
  ChevronRight,
  BadgePlus,
  ClipboardList,
  ImageIcon,
  X,
  Trash2,
  CheckCircle2,
  Info,
  AlertTriangle,
} from 'lucide-react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { WebView } from 'react-native-webview';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { doctorDashboardService, CaseTypeDto } from '@/features/dashboard/services/doctorDashboardService';
import { useRouter } from 'expo-router';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';
import apiV2 from '@/utils/apiV2';
import StatusModal from '@/components/StatusModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_HEIGHT = Math.min(SCREEN_WIDTH, 480);

const cityMap: Record<string, number> = {
  Cairo: 0, Alexandria: 1, Giza: 2, Qalyubia: 3, PortSaid: 4, Suez: 5, Gharbia: 6, Dakahlia: 7,
  Ismailia: 8, Asyut: 9, Fayoum: 10, Minya: 11, Aswan: 12, Luxor: 13, Damietta: 14,
  BeniSuef: 15, Qena: 16, Sohag: 17, Hurghada: 18, SharmElSheikh: 19
};
const cityList = Object.keys(cityMap);

type Step = 'lookup' | 'patient-form' | 'patient-found' | 'add-case';

export default function ClinicalDoctorAddCaseScreen() {
  const router = useRouter();
  const { user } = useSelector((s: RootState) => s.auth);
  const { theme, language } = useThemeLanguage();
  const isDark = theme === 'dark';
  
  const createdById = (user as any)?.publicId || "";
  const universityId = (user as any)?.universityId || "11111111-1111-1111-1111-111111111111";
  const userRole = (user as any)?.role || "ClinicalDoctor";

  const [step, setStep] = useState<Step>('lookup');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [foundPatient, setFoundPatient] = useState<any>(null);

  const [patientForm, setPatientForm] = useState({
    fullName: '', nationalId: '', phoneNumber: '', birthDate: '', gender: 0, city: 0
  });
  const [patientSubmitting, setPatientSubmitting] = useState(false);

  const [caseDescription, setCaseDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [imageFiles, setImageFiles] = useState<any[]>([]);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [toothNotes, setToothNotes] = useState('');
  const [selectedCaseType, setSelectedCaseType] = useState<CaseTypeDto | null>(null);
  const [caseSubmitting, setCaseSubmitting] = useState(false);
  const [odontogramKey, setOdontogramKey] = useState(0);
  const [odontogramLoading, setOdontogramLoading] = useState(true);

  const [statusModal, setStatusModal] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ visible: false, type: 'info', title: '', message: '' });

  const [showCityModal, setShowCityModal] = useState(false);
  const [showCaseTypeModal, setShowCaseTypeModal] = useState(false);
  const [caseTypes, setCaseTypes] = useState<CaseTypeDto[]>([]);
  const [caseTypeSearch, setCaseTypeSearch] = useState('');
  const [caseTypesLoading, setCaseTypesLoading] = useState(false);
  const [showToothModal, setShowToothModal] = useState(false);

  useEffect(() => {
    if (showCaseTypeModal) {
      setCaseTypesLoading(true);
      doctorDashboardService.searchCaseTypes(caseTypeSearch)
        .then(res => setCaseTypes(res.items))
        .catch(console.error)
        .finally(() => setCaseTypesLoading(false));
    }
  }, [showCaseTypeModal, caseTypeSearch]);

  const showStatus = (type: 'success' | 'error' | 'info', title: string, message: string, onConfirm?: () => void) => {
    setStatusModal({ visible: true, type, title, message, onConfirm });
  };

  const closeStatus = () => {
    const onConfirm = statusModal.onConfirm;
    setStatusModal(prev => ({ ...prev, visible: false }));
    if (onConfirm) onConfirm();
  };

  const lookupPatient = async (query: string) => {
    if (!query.trim() || query.trim().length < 14) {
      showStatus('error', 'Invalid Input', 'National ID must be 14 characters');
      return;
    }
    setSearchLoading(true);
    try {
      const res = await apiV2.get("/patients", { params: { NationalId: query.trim() } });
      const items = res.data?.data?.items;
      if (res.data?.success && items && items.length > 0) {
        setFoundPatient(items[0]);
        setPatientForm(prev => ({ ...prev, nationalId: query.trim() }));
        setStep('patient-found');
      } else {
        setFoundPatient(null);
        setPatientForm(prev => ({ ...prev, nationalId: query.trim() }));
        setStep('patient-form');
      }
    } catch (err: any) {
      setFoundPatient(null);
      setPatientForm(prev => ({ ...prev, nationalId: query.trim() }));
      setStep('patient-form');
    } finally {
      setSearchLoading(false);
    }
  };

  const onCreatePatient = async () => {
    if (!patientForm.fullName || !patientForm.nationalId || !patientForm.phoneNumber || !patientForm.birthDate) {
      showStatus('error', 'Missing Data', 'Please fill all required fields');
      return;
    }
    setPatientSubmitting(true);
    const randomPassword = Math.random().toString(36).slice(-8) + "!1A";
    try {
      const res = await apiV2.post("/patients", {
        ...patientForm,
        password: randomPassword,
        birthDate: new Date(patientForm.birthDate).toISOString(),
      });
      if (res.data?.success) {
        showStatus('success', 'Perfect!', 'Patient created successfully!', () => {
          setFoundPatient({ ...patientForm, id: res.data.data.id || '', nationalId: patientForm.nationalId });
          setStep('add-case');
        });
      } else {
        showStatus('error', 'Failed', res.data?.message || 'Failed to create patient');
      }
    } catch (err: any) {
      showStatus('error', 'Error', err.response?.data?.message || 'Failed to create patient');
    } finally {
      setPatientSubmitting(false);
    }
  };

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageFiles(prev => [...prev, ...(result.assets || [])]);
    }
  };

  const onCreateCase = async () => {
    if (!caseDescription) {
      showStatus('error', 'Missing Data', 'Description is required');
      return;
    }
    const nid = foundPatient?.nationalId || patientForm.nationalId;
    setCaseSubmitting(true);
    const formData = new FormData();
    formData.append("NationalId", nid);
    formData.append("Description", caseDescription);
    formData.append("IsPublic", String(isPublic));
    formData.append("UniversityId", universityId);
    formData.append("CreatedById", createdById);
    formData.append("CreatedByRole", userRole);
    formData.append("InitialDiagnosis.Stage", "1");
    if (selectedCaseType) formData.append("InitialDiagnosis.CaseTypeId", selectedCaseType.publicId);
    if (toothNotes) formData.append("InitialDiagnosis.Notes", toothNotes);
    if (selectedTooth) formData.append("InitialDiagnosis.TeethNumbers[0]", String(selectedTooth));

    imageFiles.forEach((file) => {
      const uriParts = file.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      formData.append("Images", {
        uri: file.uri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      } as any);
    });

    try {
      const res = await apiV2.post("/Cases", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success) {
        showStatus('success', 'Done!', 'Case created successfully!', () => {
          router.replace('/(screens)/clinical-doctor');
        });
      } else {
        showStatus('error', 'Failed', res.data?.message || 'Failed to create case');
      }
    } catch (err: any) {
      showStatus('error', 'Error', err.response?.data?.message || 'Failed to create case');
    } finally {
      setCaseSubmitting(false);
    }
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'ERROR') {
        console.error('Odontogram WebView Error:', data.message);
      }
      if (data.type === 'TOOTH_CLICKED') {
        setSelectedTooth(data.toothNumber);
        setShowToothModal(true);
      }
    } catch (_) {}
  };

  const buildOdontogramHtml = () => `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
  <link rel="stylesheet" href="https://esm.sh/react-odontogram@0.5.6/style.css"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    html,body{width:100%;height:100%;overflow:hidden;background-color:${isDark ? '#0f172a' : '#f8fafc'};}
    #root{width:100%;height:100%;display:flex;align-items:center;justify-content:center;}
    .Odontogram{width:100%;height:auto;max-height:100%;}
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    window.onerror = function(msg, url, line, col, error) {
      const data = { type: 'ERROR', message: msg + " at " + line + ":" + col };
      window.ReactNativeWebView.postMessage(JSON.stringify(data));
      return false;
    };

    import React from 'https://esm.sh/react@18.2.0';
    import ReactDOM from 'https://esm.sh/react-dom@18.2.0/client';
    import { Odontogram } from 'https://esm.sh/react-odontogram@0.5.6?deps=react@18.2.0,react-dom@18.2.0';

    const postMsg=(data)=>{
      try{(window.ReactNativeWebView||window.parent).postMessage(JSON.stringify(data),'*');}catch(e){}
    };

    function App(){
      const [key,setKey]=React.useState(0);
      return React.createElement(Odontogram,{
        key:key,
        notation:'FDI',
        showTooltip:false,
        readOnly:false,
        teethConditions:[],
        showLabels:true,
        layout:'circle',
        onChange:(sel)=>{
          if(sel && sel.length > 0){
            const lastSel = sel[sel.length - 1];
            const fdi = lastSel.notations ? lastSel.notations.fdi : null;
            if (fdi) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type:'TOOTH_CLICKED', 
                toothNumber: Number(fdi)
              }));
            }
          }
        }
      });
    }

    try {
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(App));
    } catch(e) {
      window.onerror(e.message);
    }
  </script>
</body>
</html>`;

  const bgColor = isDark ? 'bg-slate-950' : 'bg-slate-50';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm';
  const inputBg = isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900';
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const subTextColor = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <View className={`flex-1 ${bgColor}`}>
      <View className="pt-14 pb-4 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 shadow-sm">
        <View className="flex-row items-center gap-4">
          <View className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <BadgePlus size={24} color={isDark ? '#818cf8' : '#4f46e5'} />
          </View>
          <View>
            <Text className={`text-2xl font-black ${textColor}`}>{step === 'add-case' ? 'Add New Case' : 'Patient Lookup'}</Text>
            <Text className={`text-xs ${subTextColor} mt-1`}>{step === 'add-case' ? 'Fill in the case details' : 'Search for a patient by National ID'}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
        {step === 'lookup' && (
          <View className={`p-6 rounded-[32px] border ${cardBg}`}>
            <View className="flex-row items-center gap-3 mb-6">
              <Search size={20} color={isDark ? '#818cf8' : '#4f46e5'} />
              <Text className={`text-lg font-bold ${textColor}`}>Search Patient</Text>
            </View>
            <TextInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Enter 14-digit National ID" placeholderTextColor={isDark ? '#475569' : '#94a3b8'} keyboardType="numeric" maxLength={14} className={`px-4 py-4 rounded-2xl border text-base font-medium mb-4 ${inputBg}`} />
            <TouchableOpacity onPress={() => lookupPatient(searchQuery)} disabled={searchLoading || searchQuery.length < 14} className={`py-4 rounded-2xl flex-row items-center justify-center gap-2 ${searchQuery.length < 14 ? 'bg-slate-300 dark:bg-slate-800' : 'bg-indigo-600'}`}>
              {searchLoading ? <ActivityIndicator color="white" /> : <Search size={20} color="white" />}
              <Text className="text-white font-bold text-base">Search Patient</Text>
            </TouchableOpacity>
            <View className="flex-row items-center gap-4 my-6">
              <View className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              <Text className={`text-xs font-bold uppercase ${subTextColor}`}>OR</Text>
              <View className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </View>
            <TouchableOpacity onPress={() => { setPatientForm(p => ({...p, nationalId: searchQuery})); setStep('patient-form'); }} className="py-4 rounded-2xl border-2 border-indigo-600 flex-row items-center justify-center gap-2">
              <UserPlus size={20} color="#4f46e5" />
              <Text className="text-indigo-600 font-bold text-base">Add New Patient Directly</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'patient-form' && (
          <View className={`p-6 rounded-[32px] border ${cardBg}`}>
            <View className="flex-row items-center gap-3 mb-6">
              <UserPlus size={20} color={isDark ? '#818cf8' : '#4f46e5'} />
              <Text className={`text-lg font-bold ${textColor}`}>New Patient Registration</Text>
            </View>
            <Text className={`text-xs font-bold uppercase mb-2 ${subTextColor}`}>Full Name</Text>
            <TextInput value={patientForm.fullName} onChangeText={t => setPatientForm(p => ({...p, fullName: t}))} className={`px-4 py-3 rounded-2xl border mb-4 ${inputBg}`} />
            <Text className={`text-xs font-bold uppercase mb-2 ${subTextColor}`}>National ID</Text>
            <TextInput value={patientForm.nationalId} onChangeText={t => setPatientForm(p => ({...p, nationalId: t}))} keyboardType="numeric" maxLength={14} className={`px-4 py-3 rounded-2xl border mb-4 ${inputBg}`} />
            <Text className={`text-xs font-bold uppercase mb-2 ${subTextColor}`}>Phone Number</Text>
            <TextInput value={patientForm.phoneNumber} onChangeText={t => setPatientForm(p => ({...p, phoneNumber: t}))} keyboardType="phone-pad" className={`px-4 py-3 rounded-2xl border mb-4 ${inputBg}`} />
            <Text className={`text-xs font-bold uppercase mb-2 ${subTextColor}`}>Birth Date (YYYY-MM-DD)</Text>
            <TextInput value={patientForm.birthDate} onChangeText={t => setPatientForm(p => ({...p, birthDate: t}))} placeholder="2000-01-01" placeholderTextColor={isDark ? '#475569' : '#94a3b8'} className={`px-4 py-3 rounded-2xl border mb-4 ${inputBg}`} />
            <Text className={`text-xs font-bold uppercase mb-2 ${subTextColor}`}>Gender</Text>
            <View className="flex-row gap-3 mb-4">
              {[0, 1].map(g => (
                <TouchableOpacity key={g} onPress={() => setPatientForm(p => ({...p, gender: g}))} className={`flex-1 py-3 rounded-xl border items-center ${patientForm.gender === g ? 'bg-indigo-600 border-indigo-600' : inputBg}`}>
                  <Text className={`font-bold ${patientForm.gender === g ? 'text-white' : textColor}`}>{g === 0 ? 'Male' : 'Female'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text className={`text-xs font-bold uppercase mb-2 ${subTextColor}`}>City</Text>
            <TouchableOpacity onPress={() => setShowCityModal(true)} className={`px-4 py-3 rounded-2xl border mb-6 ${inputBg}`}>
              <Text className={`font-medium ${textColor}`}>{cityList.find(c => cityMap[c] === patientForm.city) || 'Select City'}</Text>
            </TouchableOpacity>
            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => setStep('lookup')} className="flex-1 py-4 rounded-2xl border-2 border-slate-300 items-center justify-center"><Text className="font-bold text-slate-500">Back</Text></TouchableOpacity>
              <TouchableOpacity onPress={onCreatePatient} disabled={patientSubmitting} className="flex-[2] py-4 rounded-2xl bg-indigo-600 items-center justify-center flex-row gap-2">{patientSubmitting && <ActivityIndicator color="white" />}<Text className="font-bold text-white">Create Patient</Text></TouchableOpacity>
            </View>
          </View>
        )}

        {step === 'patient-found' && foundPatient && (
          <View className={`p-6 rounded-[32px] border ${cardBg}`}>
            <View className="items-center mb-6"><View className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4"><CheckCircle2 size={40} color="#10b981" /></View><Text className={`text-2xl font-black ${textColor}`}>Patient Found!</Text></View>
            <View className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 mb-6"><Text className="text-sm font-bold text-indigo-900 dark:text-indigo-200 mb-1">{foundPatient.fullName || foundPatient.name}</Text><Text className="text-xs font-medium text-indigo-700 dark:text-indigo-300">ID: {foundPatient.nationalId}</Text></View>
            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => { setFoundPatient(null); setStep('lookup'); }} className="flex-1 py-4 rounded-2xl border-2 border-slate-300 items-center justify-center"><Text className="font-bold text-slate-500">Search Again</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setStep('add-case')} className="flex-[2] py-4 rounded-2xl bg-indigo-600 items-center justify-center flex-row gap-2"><Text className="font-bold text-white">Continue to Add Case</Text></TouchableOpacity>
            </View>
          </View>
        )}

        {step === 'add-case' && (
          <View className="gap-y-6">
            <View className={`p-4 rounded-[24px] border flex-row items-center justify-between ${cardBg}`}>
              <View><Text className={`text-xs font-bold uppercase ${subTextColor}`}>Selected Patient</Text><Text className={`text-sm font-black ${textColor}`}>{foundPatient?.fullName || patientForm.fullName}</Text></View>
              <TouchableOpacity onPress={() => setStep('lookup')}><Text className="text-indigo-500 font-bold text-xs">Change</Text></TouchableOpacity>
            </View>
            <View className={`p-6 rounded-[32px] border ${cardBg}`}>
              <View className="flex-row items-center gap-3 mb-6"><ClipboardList size={20} color={isDark ? '#818cf8' : '#4f46e5'} /><Text className={`text-lg font-bold ${textColor}`}>Case Details</Text></View>
              <Text className={`text-xs font-bold uppercase mb-2 ${subTextColor}`}>Description</Text>
              <TextInput value={caseDescription} onChangeText={setCaseDescription} multiline numberOfLines={4} placeholder="Chief complaint..." placeholderTextColor={isDark ? '#475569' : '#94a3b8'} className={`px-4 py-4 rounded-2xl border mb-6 min-h-[100px] ${inputBg}`} style={{ textAlignVertical: 'top' }} />
              <TouchableOpacity onPress={() => setIsPublic(!isPublic)} className={`flex-row items-center justify-between p-4 rounded-2xl border mb-6 ${isPublic ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : inputBg}`}>
                <View><Text className={`font-bold ${isPublic ? 'text-emerald-700 dark:text-emerald-400' : textColor}`}>{isPublic ? 'Public Case' : 'Private Case'}</Text></View>
                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isPublic ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>{isPublic && <View className="w-2 h-2 bg-white rounded-full" />}</View>
              </TouchableOpacity>
              <Text className={`text-xs font-bold uppercase mb-2 ${subTextColor}`}>Clinical Images</Text>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {imageFiles.map((file, idx) => (
                  <View key={idx} className="relative">
                    <Image source={{ uri: file.uri }} className="w-20 h-20 rounded-xl" />
                    <TouchableOpacity onPress={() => setImageFiles(p => p.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"><X size={12} color="white" /></TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity onPress={pickImages} className={`w-20 h-20 rounded-xl border-2 border-dashed items-center justify-center ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-50'}`}><ImageIcon size={24} color={isDark ? '#64748b' : '#94a3b8'} /></TouchableOpacity>
              </View>
            </View>
            <View className={`p-6 rounded-[32px] border ${cardBg}`}>
              <View className="flex-row items-center gap-3 mb-6"><BadgePlus size={20} color={isDark ? '#818cf8' : '#4f46e5'} /><Text className={`text-lg font-bold ${textColor}`}>Initial Diagnosis</Text></View>
              <View style={{ width: '100%', height: CHART_HEIGHT, backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: isDark ? '#1e293b' : '#f1f5f9' }}>
                {odontogramLoading && (<View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#0f172a' : '#f8fafc' }}><ActivityIndicator size="large" color="#6366f1" /></View>)}
                <WebView 
                  key={odontogramKey} 
                  source={{ html: buildOdontogramHtml() }}
                  originWhitelist={['*']}
                  scrollEnabled={false}
                  style={{ flex: 1, backgroundColor: isDark ? '#0f172a' : '#f8fafc' }}
                  javaScriptEnabled
                  domStorageEnabled
                  mixedContentMode="always"
                  allowsInlineMediaPlayback
                  onMessage={handleMessage} 
                  onLoadEnd={() => setOdontogramLoading(false)}
                />
              </View>
              {selectedTooth && (
                <View className="mt-4 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40">
                  <View className="flex-row justify-between items-center mb-2"><Text className="font-bold text-indigo-900 dark:text-indigo-200">Tooth #{selectedTooth}</Text><TouchableOpacity onPress={() => { setSelectedTooth(null); setSelectedCaseType(null); setToothNotes(''); }}><Trash2 size={16} color="#ef4444" /></TouchableOpacity></View>
                  <Text className="text-xs text-indigo-700 dark:text-indigo-300 mb-1">{selectedCaseType ? selectedCaseType.name : 'No case type selected'}</Text>
                  {toothNotes ? <Text className="text-xs text-indigo-500">{toothNotes}</Text> : null}
                </View>
              )}
            </View>
            <TouchableOpacity onPress={onCreateCase} disabled={caseSubmitting} className="mt-6 py-4 rounded-2xl bg-indigo-600 items-center justify-center flex-row gap-2 shadow-xl shadow-indigo-500/20">{caseSubmitting ? <ActivityIndicator color="white" /> : <BadgePlus size={20} color="white" />}<Text className="font-black text-white text-base">Create Case</Text></TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal visible={showCityModal} animationType="slide" transparent>
        <View className={`flex-1 mt-24 rounded-t-3xl shadow-xl overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          <View className="p-4 border-b border-slate-200 dark:border-slate-800 flex-row justify-between items-center"><Text className={`text-lg font-bold ${textColor}`}>Select City</Text><TouchableOpacity onPress={() => setShowCityModal(false)}><X size={24} color={isDark ? 'white' : 'black'} /></TouchableOpacity></View>
          <ScrollView>{cityList.map(c => (<TouchableOpacity key={c} onPress={() => { setPatientForm(p => ({...p, city: cityMap[c]})); setShowCityModal(false); }} className="p-4 border-b border-slate-100 dark:border-slate-800"><Text className={textColor}>{c}</Text></TouchableOpacity>))}</ScrollView>
        </View>
      </Modal>

      <Modal visible={showToothModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className={`rounded-t-3xl p-6 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            <View className="flex-row justify-between items-center mb-6"><Text className={`text-xl font-black ${textColor}`}>Tooth #{selectedTooth}</Text><TouchableOpacity onPress={() => setShowToothModal(false)}><X size={24} color={isDark ? 'white' : 'black'} /></TouchableOpacity></View>
            <Text className={`text-xs font-bold uppercase mb-2 ${subTextColor}`}>Case Type</Text>
            <TouchableOpacity onPress={() => setShowCaseTypeModal(true)} className={`px-4 py-3 rounded-2xl border mb-4 flex-row items-center justify-between ${inputBg}`}><Text className={textColor}>{selectedCaseType ? selectedCaseType.name : 'Select Case Type'}</Text></TouchableOpacity>
            <Text className={`text-xs font-bold uppercase mb-2 ${subTextColor}`}>Notes</Text>
            <TextInput value={toothNotes} onChangeText={setToothNotes} className={`px-4 py-3 rounded-2xl border mb-6 ${inputBg}`} placeholder="Additional notes..." placeholderTextColor={isDark ? '#475569' : '#94a3b8'} />
            <TouchableOpacity onPress={() => setShowToothModal(false)} className="py-4 rounded-2xl bg-indigo-600 items-center justify-center"><Text className="font-bold text-white">Save to Tooth</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showCaseTypeModal} animationType="slide" transparent>
        <View className={`flex-1 mt-24 rounded-t-3xl shadow-xl overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          <View className="p-4 border-b border-slate-200 dark:border-slate-800 flex-row justify-between items-center"><Text className={`text-lg font-bold ${textColor}`}>Select Case Type</Text><TouchableOpacity onPress={() => setShowCaseTypeModal(false)}><X size={24} color={isDark ? 'white' : 'black'} /></TouchableOpacity></View>
          <View className="p-4"><TextInput value={caseTypeSearch} onChangeText={setCaseTypeSearch} placeholder="Search Case Types..." placeholderTextColor={isDark ? '#475569' : '#94a3b8'} className={`px-4 py-3 rounded-2xl border ${inputBg}`} /></View>
          {caseTypesLoading ? <ActivityIndicator className="mt-4" /> : (<ScrollView>{caseTypes.map(c => (<TouchableOpacity key={c.publicId} onPress={() => { setSelectedCaseType(c); setShowCaseTypeModal(false); }} className="p-4 border-b border-slate-100 dark:border-slate-800"><Text className={textColor}>{c.name}</Text></TouchableOpacity>))}</ScrollView>)}
        </View>
      </Modal>

      <StatusModal 
        {...statusModal} 
        isDark={isDark} 
        onClose={closeStatus} 
      />
    </View>
  );
}
