import React, { useRef, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import { ToothData } from '../../../types/caseTypes';

interface WebOdontogramProps {
    initialTeeth: ToothData[];
    readonly?: boolean;
    status?: string;
}

export default function WebOdontogram({ initialTeeth, readonly = false, status }: WebOdontogramProps) {
    const { theme } = useThemeLanguage();
    const isDark = theme === "dark";
    const webViewRef = useRef<WebView>(null);

    const injectedHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: { extend: {} }
    }
  </script>

  <!-- React Odontogram Styles -->
  <style>
    @import url('https://esm.sh/react-odontogram@0.5.5/style.css');
    
    body {
        margin: 0;
        padding: 16px;
        font-family: -apple-system, system-ui, sans-serif;
        background-color: transparent;
    }
    .patient-details-scrollbar::-webkit-scrollbar { width: 6px; }
    .patient-details-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
    
    /* Global Styles for Selected Teeth Outlines (from user's code) */
    .selected-tooth {
        stroke-dasharray: 4, 3 !important;
        stroke-width: 1.5px !important;
    }
  </style>

  <!-- Import Maps for ES Modules -->
  <script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@18",
      "react-dom/client": "https://esm.sh/react-dom@18/client",
      "react-odontogram": "https://esm.sh/react-odontogram@0.5.5?bundle&deps=react@18,react-dom@18",
      "lucide-react": "https://esm.sh/lucide-react@0.370.0?bundle&deps=react@18"
    }
  }
  </script>

  <!-- Babel Standalone to compile JSX -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body class="${isDark ? 'dark bg-slate-950' : 'bg-slate-50'}">
  <div id="root">
    <div style="display:flex; justify-content:center; padding: 40px; color: #4f46e5;">Loading Web Chart...</div>
  </div>

  <script type="text/babel" data-type="module">
    import React, { useState, useEffect } from 'react';
    import { createRoot } from 'react-dom/client';
    import ReactOdontogram from 'react-odontogram';
    import { Info } from 'lucide-react';

    function getToothStatusColor(status) {
        switch (status) {
            case "healthy": return { fill: "${isDark ? '#1e293b' : '#f8fafc'}", stroke: "${isDark ? '#334155' : '#cbd5e1'}", label: "Healthy" };
            case "needs-treatment": return { fill: "#fef2f2", stroke: "#ef4444", label: "Needs Treatment" };
            case "in-progress": return { fill: "#fefce8", stroke: "#eab308", label: "In Progress" };
            case "treated": return { fill: "#f0fdf4", stroke: "#22c55e", label: "Treated" };
            default: return { fill: "${isDark ? '#1e293b' : '#f8fafc'}", stroke: "${isDark ? '#334155' : '#cbd5e1'}", label: "Healthy" };
        }
    }

    function buildConditions(teeth) {
        const groups = {};
        for (const t of teeth) {
            const colors = getToothStatusColor(t.status);
            const key = t.status;
            if (!groups[key]) {
                groups[key] = { teeth: [], outlineColor: colors.stroke, fillColor: colors.fill, label: colors.label };
            }
            groups[key].teeth.push("teeth-" + t.number);
        }
        return Object.values(groups);
    }

    function OdontogramApp({ initialTeeth, readonly, status }) {
        const [selected, setSelected] = useState([]);
        const [localTeeth, setLocalTeeth] = useState(initialTeeth);

        const conditions = buildConditions(localTeeth);
        const teethMap = new Map(localTeeth.map((t) => [Number(t.number), t]));

        const handleUpdateTooth = (num, updates) => {
            setLocalTeeth((prev) => {
                const hasTooth = prev.some((t) => Number(t.number) === num);
                const nextState = hasTooth 
                    ? prev.map((t) => Number(t.number) === num ? { ...t, ...updates } : t)
                    : [...prev, { number: num, status: "needs-treatment", ...updates }];
                
                // Post update back to Native if it needed it
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'UPDATE_TEETH', payload: nextState }));
                return nextState;
            });
        };

        const isDiagnosisActive = status === "diagnosis" && !readonly;
        const isUnassigned = status === "unassigned" || status === "available";

        // Global styles hack for selected teeth (From user's code)
        useEffect(() => {
            if(selected.length > 0) {
                const styleId = "selected-styles";
                let style = document.getElementById(styleId);
                if(!style) {
                    style = document.createElement("style");
                    style.id = styleId;
                    document.head.appendChild(style);
                }
                style.innerHTML = selected.map(s => 
                    \`g[id="\${s.notations.fdi}"] path, g[id="\${s.notations.fdi}"] polygon, g[id="tooth-\${s.notations.fdi}"] path\`
                ).join(", ") + " { stroke-dasharray: 4, 3 !important; stroke-width: 1.5px !important; }";
            } else {
                const style = document.getElementById("selected-styles");
                if(style) style.remove();
            }
        }, [selected]);

        return (
            <div className={\`grid grid-cols-1 \${isDiagnosisActive ? "lg:grid-cols-[1fr_380px]" : ""} gap-6 lg:gap-8\`}>
                {/* Left Column: Chart Area */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                <Info size={18} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                                    {readonly ? "Diagnosis Chart" : "Interactive Odontogram"}
                                </h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    {readonly ? "View-only mode" : "Click any tooth for details"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Chart Container */}
                    <div className={\`relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 max-w-[450px] mx-auto overflow-x-auto transition-all \${isUnassigned ? "pointer-events-none opacity-60 grayscale" : ""}\`}>
                        <ReactOdontogram
                            notation="FDI"
                            showTooltip
                            teethConditions={conditions}
                            onChange={(sel) => setSelected(sel)}
                            showLabels
                            layout="circle"
                        />
                    </div>
                </div>

                {/* Right Column: Interactive Diagnosis Form List */}
                {isDiagnosisActive && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col min-h-[400px]">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Diagnosis Plan</h3>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500">Selected teeth: {selected.length}</p>
                            </div>
                            {selected.length > 0 && (
                                <button onClick={() => setSelected([])} className="text-xs text-indigo-500 font-medium">Clear All</button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto patient-details-scrollbar pr-1 space-y-4">
                            {selected.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-3">
                                        <Info size={16} className="text-indigo-400" />
                                    </div>
                                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No teeth selected</h4>
                                    <p className="text-xs text-slate-400 mt-1">Click on the chart to select teeth.</p>
                                </div>
                            ) : (
                                selected.map((selTooth) => {
                                    const fdiNum = Number(selTooth.notations.fdi);
                                    const t = teethMap.get(fdiNum) || { number: fdiNum, status: "healthy" };

                                    return (
                                        <div key={fdiNum} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl p-3 shadow-sm text-left">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Tooth #{fdiNum}</span>
                                                <button
                                                    onClick={() => setSelected(prev => prev.filter(p => Number(p.notations.fdi) !== fdiNum))}
                                                    className="text-[10px] text-red-500 font-medium"
                                                >
                                                    Remove
                                                </button>
                                            </div>

                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Status</label>
                                                    <select
                                                        className="w-full text-xs text-slate-800 dark:text-slate-200 border rounded-lg px-2 py-2 bg-white dark:bg-slate-900 dark:border-slate-700"
                                                        value={t.status}
                                                        onChange={(e) => handleUpdateTooth(fdiNum, { status: e.target.value })}
                                                    >
                                                        <option value="healthy">Healthy</option>
                                                        <option value="needs-treatment">Needs Treatment</option>
                                                        <option value="in-progress">In Progress</option>
                                                        <option value="treated">Treated</option>
                                                    </select>
                                                </div>

                                                {t.status !== 'healthy' && (
                                                    <>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Treatment Type</label>
                                                            <input
                                                                type="text"
                                                                placeholder="e.g. Root Canal..."
                                                                className="w-full text-xs border rounded-lg px-2 py-2 bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                                                value={t.treatmentType || ""}
                                                                onChange={(e) => handleUpdateTooth(fdiNum, { treatmentType: e.target.value })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Clinical Notes</label>
                                                            <textarea
                                                                placeholder="Add specific details..."
                                                                rows="2"
                                                                className="w-full text-xs border rounded-lg px-2 py-1 bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white resize-none"
                                                                value={t.notes || ""}
                                                                onChange={(e) => handleUpdateTooth(fdiNum, { notes: e.target.value })}
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const initialTeeth = ${JSON.stringify(initialTeeth)};
    const readonly = ${readonly ? 'true' : 'false'};
    const status = "${status || ''}";

    const root = createRoot(document.getElementById('root'));
    root.render(<OdontogramApp initialTeeth={initialTeeth} readonly={readonly} status={status} />);
  </script>
</body>
</html>
`;

    return (
        <View className="flex-1 min-h-[650px] w-full rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950">
            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: injectedHtml }}
                style={{ flex: 1, backgroundColor: 'transparent' }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => (
                    <View className="absolute inset-0 items-center justify-center bg-slate-50 dark:bg-slate-950">
                        <ActivityIndicator size="large" color="#4f46e5" />
                    </View>
                )}
                onMessage={(event) => {
                    try {
                        const data = JSON.parse(event.nativeEvent.data);
                        if (data.type === 'UPDATE_TEETH') {
                            console.log('Teeth Updated from Web:', data.payload);
                            // We can push to an API here if needed!
                        }
                    } catch (e) { }
                }}
            />
        </View>
    );
}
