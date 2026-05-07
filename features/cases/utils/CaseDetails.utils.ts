export type CaseStatus = "Pending" | "UnderReview" | "InProgress" | "Completed" | "Cancelled" | string;
export type ToothStatus = "healthy" | "needs-treatment" | "in-progress" | "treated";

export function formatTimestamp(ts: string) {
    const d = new Date(ts);
    return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
    };
}

type TabDef = { key: string; label: string };

export function getTabsForStatus(status: CaseStatus): TabDef[] {
    const s = status?.toLowerCase();
    switch (s) {
        case "pending":
            return [
                { key: "odontogram", label: "Odontogram" },
                { key: "medical", label: "Medical Info" },
                { key: "gallery", label: "Gallery" },
            ];
        case "underreview":
            return [
                { key: "odontogram", label: "Odontogram" },
                { key: "medical", label: "Medical Info" },
                { key: "gallery", label: "Gallery" },
            ];
        case "inprogress":
            return [
                { key: "odontogram", label: "Odontogram" },
                { key: "medical", label: "Medical Info" },
                { key: "gallery", label: "Gallery" },
                { key: "beforeAfter", label: "Before/After" },
                { key: "timeline", label: "Timeline" },
            ];
        case "completed":
            return [
                { key: "odontogram", label: "Odontogram" },
                { key: "medical", label: "Medical Info" },
                { key: "gallery", label: "Gallery" },
                { key: "beforeAfter", label: "Before/After" },
                { key: "timeline", label: "Timeline" },
            ];
        default:
            return [
                { key: "odontogram", label: "Odontogram" },
                { key: "medical", label: "Medical Info" },
                { key: "gallery", label: "Gallery" },
            ];
    }
}

export function getPatientStatusConfig(status: CaseStatus | string) {
    const s = status?.toLowerCase();
    switch (s) {
        case 'pending':
            return {
                label: 'Unassigned',
                bg: 'bg-slate-100',
                text: 'text-slate-600',
                dot: 'bg-slate-400',
                border: 'border-slate-200',
            };
        case 'underreview':
            return {
                label: 'Diagnosis',
                bg: 'bg-blue-50',
                text: 'text-blue-600',
                dot: 'bg-blue-400',
                border: 'border-blue-200',
            };
        case 'inprogress':
            return {
                label: 'In Progress',
                bg: 'bg-amber-50',
                text: 'text-amber-600',
                dot: 'bg-amber-400',
                border: 'border-amber-200',
            };
        case 'completed':
            return {
                label: 'Completed',
                bg: 'bg-emerald-50',
                text: 'text-emerald-600',
                dot: 'bg-emerald-400',
                border: 'border-emerald-200',
            };
        default:
            return {
                label: status || 'Unknown',
                bg: 'bg-slate-100',
                text: 'text-slate-600',
                dot: 'bg-slate-400',
                border: 'border-slate-200',
            };
    }
}

export function getToothStatusColor(status: ToothStatus) {
    switch (status) {
        case 'healthy': return { fill: '#e2e8f0', stroke: '#94a3b8', label: 'Healthy' };
        case 'needs-treatment': return { fill: '#fecaca', stroke: '#ef4444', label: 'Needs Treatment' };
        case 'in-progress': return { fill: '#fef08a', stroke: '#eab308', label: 'In Progress' };
        case 'treated': return { fill: '#bbf7d0', stroke: '#22c55e', label: 'Treated' };
    }
}

// ── Odontogram Utilities (mirrors web odontogram.utils.ts) ─────────────────

export interface ToothConditionGroup {
    teeth: string[];
    outlineColor: string;
    fillColor: string;
    label: string;
}

export interface ToothData {
    number: number;
    status: ToothStatus;
    treatmentType?: string;
    caseTypeId?: string;
    notes?: string;
}

export type DiagnosisStage = 'BasicClinic' | 'AI' | '' | 0 | 1;

export interface ToothPanelData {
    id?: string;
    toothNumber: number;
    caseType: string;
    caseTypeId?: string;
    diagnosisStage: DiagnosisStage;
    notes: string;
    assignedStudentName?: string | null;
    assignedDoctorName?: string | null;
}

export function buildConditions(diagnoses: any[]): ToothConditionGroup[] {
    if (!diagnoses || !Array.isArray(diagnoses)) return [];

    const teeth: ToothData[] = diagnoses.flatMap((d: any) =>
        (d.teethNumbers ?? []).map((num: number) => ({
            number: num,
            status: 'needs-treatment' as ToothStatus,
            treatmentType: d.caseTypeName || '',
            notes: d.notes || '',
            caseTypeId: d.caseTypeId,
        }))
    );

    const groups: Record<string, ToothConditionGroup> = {};
    for (const t of teeth) {
        if (t.status === 'healthy') continue;
        const colors = getToothStatusColor(t.status) ?? { stroke: '#ef4444', fill: '#fecaca', label: 'Needs Treatment' };
        if (!groups[t.status]) {
            groups[t.status] = {
                teeth: [],
                outlineColor: colors.stroke,
                fillColor: colors.fill,
                label: colors.label,
            };
        }
        groups[t.status].teeth.push(`teeth-${t.number}`);
    }
    return Object.values(groups);
}

export function buildDiagnosedTeethMap(
    diagnoses: any[] | null | undefined,
    assignedStudentName?: string | null,
    assignedDoctorName?: string | null,
): Map<number, ToothPanelData> {
    const map = new Map<number, ToothPanelData>();
    if (!diagnoses || !Array.isArray(diagnoses)) return map;
    for (const diagnosis of diagnoses) {
        for (const num of diagnosis.teethNumbers ?? []) {
            map.set(num, {
                id: diagnosis.id,
                toothNumber: num,
                caseType: diagnosis.caseTypeName || '',
                caseTypeId: diagnosis.caseTypeId,
                diagnosisStage: diagnosis.stage as DiagnosisStage,
                notes: diagnosis.notes || '',
                assignedStudentName: assignedStudentName ?? null,
                assignedDoctorName: assignedDoctorName ?? null,
            });
        }
    }
    return map;
}
