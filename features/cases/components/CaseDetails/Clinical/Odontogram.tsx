import React, { useState, useMemo, useRef } from 'react';
import { View, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { useCase } from '@/features/cases/context/CaseContext';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { buildConditions, buildDiagnosedTeethMap } from '@/features/cases/utils/CaseDetails.utils';
import OdontogramHeader from './OdontogramParts/Odontogramheader';
import OdontogramEmptyState from './OdontogramParts/OdontogramEmptyState';
import ToothInfoPanel, { ToothPanelData } from './OdontogramParts/ToothInfoPanel';

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
    html,body{width:100%;height:100%;overflow:hidden;background:transparent;}
    #root{width:100%;max-width:480px;margin:0 auto;padding:8px;}
    .lock-overlay{
      position:absolute;inset:0;z-index:10;display:flex;flex-direction:column;
      align-items:center;justify-content:center;gap:8px;border-radius:16px;
      background:rgba(248,250,252,0.88);backdrop-filter:blur(4px);
    }
    .lock-icon{
      width:40px;height:40px;border-radius:50%;background:#e2e8f0;
      display:flex;align-items:center;justify-content:center;font-size:18px;
    }
    .lock-text{font-size:12px;font-weight:600;color:#64748b;text-align:center;}
    ${isDark ? `.Odontogram svg{background-color:transparent!important;}` : ''}
  </style>
</head>
<body>
  <div id="root" style="position:relative;"></div>
  <script type="importmap">
  {"imports":{"react":"https://esm.sh/react@18.2.0","react-dom/client":"https://esm.sh/react-dom@18.2.0/client","react-odontogram":"https://esm.sh/react-odontogram@0.5.6"}}
  </script>
  <script type="module">
    import React,{useState,useEffect} from 'react';
    import {createRoot} from 'react-dom/client';
    import {Odontogram} from 'react-odontogram';

    const postMsg=(data)=>{
      try{(window.ReactNativeWebView||window.parent).postMessage(JSON.stringify(data),'*');}catch(e){}
    };

    let teethConditions=${conditionsJson};
    const isUnassigned=${isUnassigned};

    function App(){
      const [conditions,setConditions]=useState(teethConditions);
      const [chartKey,setChartKey]=useState(0);

      useEffect(()=>{
        const handler=(e)=>{
          try{
            const d=JSON.parse(e.data);
            if(d.type==='UPDATE'){setConditions(d.conditions);setChartKey(k=>k+1);}
          }catch(_){}
        };
        document.addEventListener('message',handler);
        window.addEventListener('message',handler);
        return()=>{
          document.removeEventListener('message',handler);
          window.removeEventListener('message',handler);
        };
      },[]);

      return React.createElement(
        'div',{style:{position:'relative'}},
        isUnassigned&&React.createElement(
          'div',{className:'lock-overlay'},
          React.createElement('div',{className:'lock-icon'},'🔒'),
          React.createElement('p',{className:'lock-text'},'Chart locked — case not yet assigned')
        ),
        React.createElement(Odontogram,{
          key:chartKey,
          notation:'FDI',
          showTooltip:true,
          readOnly:false,
          teethConditions:conditions,
          showLabels:true,
          layout:'circle',
          onChange:(sel)=>{
            if(sel&&sel.length>0){
              const fdi=Number(sel[sel.length-1].notations.fdi);
              postMsg({type:'TOOTH_CLICKED',toothNumber:fdi});
            }
            setTimeout(()=>setChartKey(k=>k+1),50);
          }
        })
      );
    }

    createRoot(document.getElementById('root')).render(React.createElement(App));
  </script>
</body>
</html>`;
}

export default function Odontogram() {
    const { caseData, studentOwnerData, doctorOwnerData } = useCase();
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

    const conditions = useMemo(() => buildConditions(diagnoses), [diagnoses]);

    const diagnosedTeethMap = useMemo(
        () => buildDiagnosedTeethMap(diagnoses, assignedStudentName, assignedDoctorName),
        [diagnoses, assignedStudentName, assignedDoctorName]
    );

    const hasDiagnosisData = diagnoses.length > 0;
    const isUnassigned = status === 'Pending';

    if (!hasDiagnosisData) {
        return <OdontogramEmptyState />;
    }

    const htmlContent = buildOdontogramHtml(conditions, isDark, isUnassigned);

    const handleMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'TOOTH_CLICKED') {
                const info = diagnosedTeethMap.get(data.toothNumber) ?? null;
                setPanelData(info);
            }
        } catch (_) {}
    };

    return (
        <View className="gap-5">
            <OdontogramHeader readonly={true} />

            {/* WebView Chart */}
            <View
                style={{
                    width: '100%',
                    height: CHART_HEIGHT,
                    borderRadius: 16,
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

            {/* Tooth Info Panel */}
            {(panelData || !hasDiagnosisData) && (
                <ToothInfoPanel
                    data={panelData}
                    onClose={() => setPanelData(null)}
                />
            )}
        </View>
    );
}
