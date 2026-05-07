import React, { useState, useMemo, useRef } from 'react';
import { View, Dimensions, Modal, TextInput, TouchableOpacity, Text, ScrollView, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { X, ClipboardList, BadgePlus, Check, ChevronRight } from 'lucide-react-native';
import { useCase } from '@/features/cases/context/CaseContext';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { buildConditions, buildDiagnosedTeethMap } from '@/features/cases/utils/CaseDetails.utils';
import OdontogramHeader from './OdontogramParts/Odontogramheader';
import OdontogramEmptyState from './OdontogramParts/OdontogramEmptyState';
import ToothInfoPanel, { ToothPanelData } from './OdontogramParts/ToothInfoPanel';
import { useQuery } from '@tanstack/react-query';
import { doctorDashboardService } from '@/features/dashboard/services/doctorDashboardService';
import apiV2 from '@/utils/apiV2';
import StatusModal from '@/components/StatusModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_HEIGHT = Math.min(SCREEN_WIDTH, 480);

function buildOdontogramHtml(
    conditions: any[],
    isDark: boolean,
    isUnassigned: boolean,
): string {
    const conditionsJson = JSON.stringify(conditions);

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
  <link rel="stylesheet" href="https://esm.sh/react-odontogram@0.5.6/style.css"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    html,body{width:100%;height:100%;overflow:hidden;background-color:${isDark ? '#0f172a' : '#f8fafc'};}
    #root{width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:relative;}
    .lock-overlay{
      position:absolute;inset:0;z-index:10;display:flex;flex-direction:column;
      align-items:center;justify-content:center;gap:8px;border-radius:16px;
      background:${isDark ? 'rgba(15,23,42,0.88)' : 'rgba(248,250,252,0.88)'};backdrop-filter:blur(4px);
    }
    .lock-icon{
      width:40px;height:40px;border-radius:50%;background:${isDark ? '#1e293b' : '#e2e8f0'};
      display:flex;align-items:center;justify-content:center;font-size:18px;
    }
    .lock-text{font-size:12px;font-weight:600;color:${isDark ? '#94a3b8' : '#64748b'};text-align:center;}
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

    let initialConditions=${conditionsJson};
    const isUnassigned=${isUnassigned};

    function App(){
      return React.createElement(
        'div',{style:{position:'relative',width:'100%',height:'100%',display:'flex',justifyContent:'center',alignItems:'center'}},
        isUnassigned&&React.createElement(
          'div',{className:'lock-overlay'},
          React.createElement('div',{className:'lock-icon'},'🔒'),
          React.createElement('p',{className:'lock-text'},'Chart locked — case not yet assigned')
        ),
        React.createElement(Odontogram,{
          notation:'FDI',
          showTooltip:false,
          readOnly:false,
          teethConditions:initialConditions,
          showLabels:true,
          layout:'circle',
          onChange:(sel)=>{
            if(sel&&sel.length>0){
              const fdi=Number(sel[sel.length-1].notations.fdi);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type:'TOOTH_CLICKED', 
                toothNumber: fdi
              }));
            }
          }
        })
      );
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
}

export default function Odontogram() {
    const { caseData, studentOwnerData, doctorOwnerData, refetch } = useCase();
    const role = useSelector((state: RootState) => state.auth.role);
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';
    const webViewRef = useRef<WebView>(null);

    const patient: any = caseData;
    const diagnoses: any[] = patient?.diagnoses ?? [];
    const status = patient?.status;

    const assignedStudentName = studentOwnerData?.data?.fullName ?? null;
    const assignedDoctorName = doctorOwnerData?.data?.fullName ?? null;

    const [panelData, setPanelData] = useState<ToothPanelData | null>(null);
    const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [toothNotes, setToothNotes] = useState('');
    const [selectedCaseType, setSelectedCaseType] = useState<any>(null);
    const [showCaseTypeModal, setShowCaseTypeModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusModal, setStatusModal] = useState<any>({ visible: false, type: 'success', title: '', message: '' });

    const conditions = useMemo(() => buildConditions(diagnoses), [diagnoses]);

    const diagnosedTeethMap = useMemo(
        () => buildDiagnosedTeethMap(diagnoses, assignedStudentName, assignedDoctorName),
        [diagnoses, assignedStudentName, assignedDoctorName]
    );

    const { data: caseTypes } = useQuery({
        queryKey: ['case-types'],
        queryFn: () => doctorDashboardService.getCaseTypes(),
    });

    const hasDiagnosisData = diagnoses.length > 0;
    const isUnassigned = status === 'Pending' && role !== 'ClinicalDoctor' && !hasDiagnosisData;

    if (!hasDiagnosisData && role !== 'ClinicalDoctor') {
        return <OdontogramEmptyState />;
    }

    const htmlContent = buildOdontogramHtml(conditions, isDark, isUnassigned);

    const handleMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'TOOTH_CLICKED') {
                if (role === 'ClinicalDoctor') {
                    const existing = diagnosedTeethMap.get(data.toothNumber);
                    setSelectedTooth(data.toothNumber);
                    setToothNotes(existing?.notes || '');
                    setSelectedCaseType(existing ? { name: existing.caseType, publicId: existing.caseTypeId } : null);
                    setShowEditModal(true);
                } else {
                    const info = diagnosedTeethMap.get(data.toothNumber) ?? null;
                    setPanelData(info);
                }
            }
        } catch (_) {}
    };

    const handleSaveDiagnosis = async () => {
        if (!selectedTooth || !selectedCaseType) return;
        setIsSubmitting(true);
        const existing = diagnosedTeethMap.get(selectedTooth);
        
        try {
            if (existing?.id) {
                // Update
                await apiV2.put(`/Diagnoses/${existing.id}`, {
                    id: existing.id,
                    stage: 1,
                    caseTypeId: selectedCaseType.publicId || selectedCaseType.id,
                    notes: toothNotes,
                    teethNumbers: [selectedTooth]
                });
            } else {
                // Create
                await apiV2.post('/Diagnoses', {
                    patientCaseId: patient.id,
                    stage: 1,
                    caseTypeId: selectedCaseType.publicId || selectedCaseType.id,
                    notes: toothNotes,
                    teethNumbers: [selectedTooth],
                    role: 'ClinicalDoctor'
                });
            }
            setShowEditModal(false);
            setStatusModal({ visible: true, type: 'success', title: 'Success', message: 'Diagnosis updated successfully!' });
            setTimeout(() => {
              setStatusModal((p: any) => ({ ...p, visible: false }));
              refetch();
            }, 1500);
        } catch (err) {
            setStatusModal({ visible: true, type: 'error', title: 'Error', message: 'Failed to save diagnosis' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteDiagnosis = async () => {
        const existing = diagnosedTeethMap.get(selectedTooth!);
        if (!existing?.id) return;
        setIsSubmitting(true);
        try {
            await apiV2.delete(`/Diagnoses/${existing.id}`);
            setShowEditModal(false);
            setStatusModal({ visible: true, type: 'success', title: 'Deleted', message: 'Diagnosis removed' });
            setTimeout(() => {
              setStatusModal((p: any) => ({ ...p, visible: false }));
              refetch();
            }, 1500);
        } catch (err) {
            setStatusModal({ visible: true, type: 'error', title: 'Error', message: 'Failed to delete' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const bgColor = isDark ? 'bg-slate-950' : 'bg-slate-50';
    const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm';
    const inputBg = isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900';
    const textColor = isDark ? 'text-white' : 'text-slate-900';
    const subTextColor = isDark ? 'text-slate-400' : 'text-slate-500';

    return (
        <View className="gap-5">
            <OdontogramHeader readonly={role !== 'ClinicalDoctor'} />

            {/* WebView Chart */}
            <View
                style={{
                    width: '100%',
                    height: CHART_HEIGHT,
                    borderRadius: 24,
                    overflow: 'hidden',
                    backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                    borderWidth: 1,
                    borderColor: isDark ? '#1e293b' : '#f1f5f9',
                }}>
                <WebView
                    ref={webViewRef}
                    source={{ html: htmlContent }}
                    onMessage={handleMessage}
                    originWhitelist={['*']}
                    scrollEnabled={false}
                    style={{ flex: 1, backgroundColor: 'transparent' }}
                    javaScriptEnabled
                    domStorageEnabled
                    mixedContentMode="always"
                    allowsInlineMediaPlayback
                />
            </View>

            {/* Edit Modal (Clinical Doctor Only) */}
            <Modal visible={showEditModal} animationType="fade" transparent onRequestClose={() => setShowEditModal(false)}>
              <View className="flex-1 bg-black/60 justify-end">
                <TouchableOpacity className="flex-1" activeOpacity={1} onPress={() => setShowEditModal(false)} />
                <View className={`rounded-t-[40px] p-8 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                  <View className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full self-center mb-8" />
                  
                  <View className="flex-row justify-between items-center mb-8">
                    <View className="flex-row items-center gap-4">
                      <View className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <ClipboardList size={24} color="#6366f1" />
                      </View>
                      <Text className={`text-2xl font-black ${textColor}`}>Tooth #{selectedTooth}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowEditModal(false)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center">
                      <X size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                    </TouchableOpacity>
                  </View>

                  <Text className={`text-xs font-bold uppercase mb-3 tracking-widest ${subTextColor}`}>Diagnosis / Case Type</Text>
                  <TouchableOpacity 
                    onPress={() => setShowCaseTypeModal(true)} 
                    className={`px-5 py-4 rounded-[20px] border flex-row items-center justify-between mb-6 ${inputBg}`}
                  >
                    <Text className={`font-bold ${selectedCaseType ? textColor : subTextColor}`}>
                      {selectedCaseType ? selectedCaseType.name : 'Select diagnosis type...'}
                    </Text>
                    <ChevronRight size={20} color={isDark ? '#475569' : '#cbd5e1'} />
                  </TouchableOpacity>

                  <Text className={`text-xs font-bold uppercase mb-3 tracking-widest ${subTextColor}`}>Clinical Notes</Text>
                  <TextInput 
                    value={toothNotes} 
                    onChangeText={setToothNotes} 
                    multiline 
                    numberOfLines={3}
                    placeholder="Enter observations..." 
                    placeholderTextColor={isDark ? '#475569' : '#94a3b8'} 
                    className={`px-5 py-4 rounded-[20px] border mb-8 min-h-[100px] ${inputBg}`} 
                    style={{ textAlignVertical: 'top' }}
                  />

                  <View className="flex-row gap-4">
                    {diagnosedTeethMap.has(selectedTooth!) && (
                      <TouchableOpacity 
                        onPress={handleDeleteDiagnosis} 
                        disabled={isSubmitting}
                        className="flex-1 py-4 rounded-[20px] bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 items-center justify-center"
                      >
                        <Text className="font-bold text-red-500">Delete</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                      onPress={handleSaveDiagnosis} 
                      disabled={isSubmitting || !selectedCaseType}
                      className={`flex-[2] py-4 rounded-[20px] flex-row items-center justify-center gap-2 ${isSubmitting ? 'bg-slate-400' : 'bg-indigo-600'}`}
                    >
                      {isSubmitting ? <ActivityIndicator size="small" color="white" /> : <Check size={20} color="white" />}
                      <Text className="font-bold text-white text-lg">Save Diagnosis</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            {/* Case Type Selector Modal */}
            <Modal visible={showCaseTypeModal} animationType="slide" transparent>
              <View className="flex-1 bg-black/60 justify-end">
                <View className={`h-[70%] rounded-t-[40px] p-8 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                  <View className="flex-row justify-between items-center mb-8">
                    <Text className={`text-2xl font-black ${textColor}`}>Select Case Type</Text>
                    <TouchableOpacity onPress={() => setShowCaseTypeModal(false)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center">
                      <X size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                    </TouchableOpacity>
                  </View>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View className="gap-y-3">
                      {caseTypes?.map((ct: any) => (
                        <TouchableOpacity 
                          key={ct.publicId || ct.id} 
                          onPress={() => { setSelectedCaseType(ct); setShowCaseTypeModal(false); }}
                          className={`p-5 rounded-2xl border flex-row items-center justify-between ${selectedCaseType?.publicId === ct.publicId ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'border-slate-100 dark:border-slate-800'}`}
                        >
                          <Text className={`font-bold ${selectedCaseType?.publicId === ct.publicId ? 'text-indigo-600 dark:text-indigo-400' : textColor}`}>{ct.name}</Text>
                          {selectedCaseType?.publicId === ct.publicId && <Check size={18} color="#6366f1" />}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>
            </Modal>

            {/* Tooth Info Panel (Other Roles) */}
            {(panelData || !hasDiagnosisData) && role !== 'ClinicalDoctor' && (
                <ToothInfoPanel
                    data={panelData}
                    onClose={() => setPanelData(null)}
                />
            )}

            <StatusModal {...statusModal} onClose={() => setStatusModal((p: any) => ({ ...p, visible: false }))} />
        </View>
    );
}
