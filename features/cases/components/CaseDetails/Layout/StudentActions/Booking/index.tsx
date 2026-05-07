import React, { useState } from 'react';
import {
    Modal, View, Text, TouchableOpacity, KeyboardAvoidingView,
    Platform, ScrollView,
} from 'react-native';
import { X, Play } from 'lucide-react-native';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import Bookingstepper from './parts/Bookingstepper';
import BookingFooter from './parts/BookingFooter';
import { StepDate } from './parts/StepDate';
import { StepTime } from './parts/StepTime';
import { StepLocation } from './parts/StepLocation';

type Locale = 'en' | 'ar';

const translations: Record<Locale, any> = {
    en: {
        titleCreate: 'Schedule New Session',
        titleUpdate: 'Update Session',
        steps: ['Date', 'Time', 'Location'],
        stepSubs: ['Choose a date', 'Set start & end time', 'Where will it take place?'],
        next: 'Next', back: 'Back', confirm: 'Confirm Booking',
        saveChanges: 'Save Changes', cancel: 'Cancel',
        locationPlaceholder: 'e.g. Clinic A – Room 3',
        locationLabel: 'Location', startTime: 'Start time', endTime: 'End time',
        duration: 'Duration', summary: 'Booking Summary', booking: 'Booking...',
        saving: 'Saving...', dateLabel: 'Date', timeLabel: 'Time',
        errorFields: 'Please fill in all fields',
        errorTime: 'End time must be after start time',
    },
    ar: {
        titleCreate: 'حجز جلسة جديدة',
        titleUpdate: 'تحديث الجلسة',
        steps: ['التاريخ', 'الوقت', 'الموقع'],
        stepSubs: ['اختر تاريخ الجلسة', 'حدد وقت البداية والنهاية', 'أين ستُعقد الجلسة؟'],
        next: 'التالي', back: 'رجوع', confirm: 'تأكيد الحجز',
        saveChanges: 'حفظ التعديلات', cancel: 'إلغاء',
        locationPlaceholder: 'مثال: عيادة أ – غرفة 3',
        locationLabel: 'الموقع', startTime: 'وقت البداية', endTime: 'وقت النهاية',
        duration: 'المدة', summary: 'ملخص الحجز', booking: 'جاري الحجز...',
        saving: 'جاري الحفظ...', dateLabel: 'التاريخ', timeLabel: 'الوقت',
        errorFields: 'يرجى ملء جميع الحقول',
        errorTime: 'يجب أن يكون وقت النهاية بعد وقت البداية',
    },
};

interface SessionBookingDialogProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onSubmit: (data: { date: string; startTime: string; endTime: string; location: string }) => Promise<boolean | void>;
    isLoading: boolean;
    locale?: Locale;
    existingSession?: { date: string; startTime: string; endTime: string; location: string } | null;
    /** True when there is already a scheduled session (Reschedule mode) */
    hasScheduledSession?: boolean;
    /** Opens the "Start Now" confirmation modal */
    onToggleStartNowModal?: (open: boolean) => void;
}

export default function SessionBookingDialog({
    open, onOpenChange, onSubmit, isLoading, locale = 'en', existingSession = null,
    hasScheduledSession = false, onToggleStartNowModal,
}: SessionBookingDialogProps) {
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';
    const t = translations[locale] ?? translations.en;
    const isRTL = locale === 'ar';

    const [step, setStep] = useState(0);
    const [selectedDate, setSelectedDate] = useState<Date | null>(
        existingSession ? new Date(existingSession.date) : null
    );
    const [startTime, setStartTime] = useState(existingSession?.startTime ?? '');
    const [endTime, setEndTime] = useState(existingSession?.endTime ?? '');
    const [location, setLocation] = useState(existingSession?.location ?? '');
    const [error, setError] = useState('');

    const reset = () => {
        setStep(0);
        setSelectedDate(null);
        setStartTime('');
        setEndTime('');
        setLocation('');
        setError('');
    };

    const handleClose = () => {
        reset();
        onOpenChange(false);
    };

    const handleNext = async () => {
        setError('');
        if (step === 0) {
            if (!selectedDate) { setError(t.errorFields); return; }
            setStep(1);
        } else if (step === 1) {
            if (!startTime || !endTime) { setError(t.errorFields); return; }
            if (endTime <= startTime) { setError(t.errorTime); return; }
            setStep(2);
        } else {
            if (!location.trim()) { setError(t.errorFields); return; }
            // Use local date components (NOT toISOString which converts to UTC)
            // e.g. Egypt UTC+3: selecting May 7 → toISOString gives May 6!
            const d = selectedDate!;
            const dateStr = [
                d.getFullYear(),
                String(d.getMonth() + 1).padStart(2, '0'),
                String(d.getDate()).padStart(2, '0'),
            ].join('-');
            const result = await onSubmit({ date: dateStr, startTime, endTime, location });
            // Only close modal on explicit success (true) or if handler returns void (legacy)
            if (result === true || result === undefined) {
                reset();
                onOpenChange(false);
            }
        }
    };

    const title = existingSession ? t.titleUpdate : t.titleCreate;

    return (
        <Modal visible={open} transparent animationType="slide" onRequestClose={handleClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 justify-end"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <View className={`rounded-t-3xl p-6 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                    {/* Handle */}
                    <View className="items-center mb-4">
                        <View className={`w-10 h-1 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                    </View>

                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-5">
                        <Text className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            {title}
                        </Text>
                        <TouchableOpacity onPress={handleClose} activeOpacity={0.7}
                            className={`w-8 h-8 rounded-xl items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <X size={16} color={isDark ? '#94a3b8' : '#64748b'} />
                        </TouchableOpacity>
                    </View>

                    {/* Stepper */}
                    <Bookingstepper currentStep={step} steps={t.steps} stepSubs={t.stepSubs} />

                    {/* Step Content */}
                    <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 340 }}>
                        {step === 0 && (
                            <View>
                                {/* Start Now pill — only in Reschedule (update) mode, mirrors web */}
                                {hasScheduledSession && (
                                    <View className={`flex-row items-center justify-between mb-3 px-1`}>
                                        <Text className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {isRTL ? 'اختر التاريخ' : 'Select Date'}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => {
                                                onOpenChange(false);
                                                onToggleStartNowModal?.(true);
                                            }}
                                            activeOpacity={0.8}
                                            className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border ${
                                                isDark
                                                    ? 'bg-indigo-900/30 border-indigo-700/50'
                                                    : 'bg-indigo-50 border-indigo-200'
                                            }`}
                                        >
                                            <Play size={10} color={isDark ? '#818cf8' : '#4f46e5'} fill={isDark ? '#818cf8' : '#4f46e5'} />
                                            <Text className={`text-[11px] font-bold uppercase tracking-wider ${
                                                isDark ? 'text-indigo-400' : 'text-indigo-600'
                                            }`}>
                                                {isRTL ? 'ابدأ الآن' : 'Start Now'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                                <View className={hasScheduledSession ? `rounded-xl border ${isDark ? 'border-slate-700/50 bg-slate-800/30' : 'border-slate-100 bg-slate-50/50'} p-1` : ''}>
                                    <StepDate
                                        selectedDate={selectedDate}
                                        onDateChange={setSelectedDate}
                                        isRTL={isRTL}
                                        dateLabel={t.dateLabel}
                                    />
                                </View>
                            </View>
                        )}
                        {step === 1 && (
                            <StepTime
                                startTime={startTime}
                                endTime={endTime}
                                onStartChange={setStartTime}
                                onEndChange={setEndTime}
                                isLoading={isLoading}
                                isRTL={isRTL}
                                startTimeLabel={t.startTime}
                                endTimeLabel={t.endTime}
                                durationLabel={t.duration}
                                errorTime={t.errorTime}
                            />
                        )}
                        {step === 2 && (
                            <StepLocation
                                location={location}
                                onLocationChange={setLocation}
                                selectedDate={selectedDate}
                                startTime={startTime}
                                endTime={endTime}
                                error={error}
                                isLoading={isLoading}
                                isRTL={isRTL}
                                locationLabel={t.locationLabel}
                                locationPlaceholder={t.locationPlaceholder}
                                dateLabel={t.dateLabel}
                                timeLabel={t.timeLabel}
                                summary={t.summary}
                            />
                        )}
                        {error && step !== 2 && (
                            <View className="mt-3 rounded-xl bg-red-500/10 px-3 py-2">
                                <Text className="text-[12px] text-red-500">{error}</Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* Footer */}
                    <BookingFooter
                        step={step}
                        totalSteps={3}
                        isLastStep={step === 2}
                        isLoading={isLoading}
                        isRTL={isRTL}
                        confirmLabel={existingSession ? t.saveChanges : t.confirm}
                        nextLabel={t.next}
                        backLabel={t.back}
                        bookingLabel={existingSession ? t.saving : t.booking}
                        cancelLabel={t.cancel}
                        onNext={handleNext}
                        onBack={() => { setError(''); setStep(s => s - 1); }}
                        onCancel={handleClose}
                    />
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
