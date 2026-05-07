import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import PendingRequestCard from './PendingRequestCard';
import EvaluationCard from './EvaluationCard';
import { useCase } from '@/features/cases/context/CaseContext';
import { useThemeLanguage } from '@/store/ThemeLanguageContext';
import api from '@/utils/api';
import { useDispatch } from 'react-redux';
import { showToast } from '@/store/slices/uiSlice';


interface DoctorActionsProps {
    patient: any;
    onRefetch: () => void;
}

export default function DoctorActions({ patient, onRefetch }: DoctorActionsProps) {
    const { doctorRequests, doctorRequestsLoading, refetchDoctorRequests } = useCase();
    const { theme } = useThemeLanguage();
    const isDark = theme === 'dark';
    const dispatch = useDispatch();

    const [approveLoadingId, setApproveLoadingId] = useState<string | null>(null);
    const [rejectLoadingId, setRejectLoadingId] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const pendingRequests = doctorRequests || [];

    useEffect(() => {
        if (currentIndex >= pendingRequests.length && pendingRequests.length > 0) {
            setCurrentIndex(Math.max(0, pendingRequests.length - 1));
        }
    }, [pendingRequests.length, currentIndex]);

    const handleApprove = async (id: string) => {
        setApproveLoadingId(id);
        try {
            const res = await api.patch(`/CaseRequests/${id}/status`, { status: "Approved" });
            dispatch(showToast({ message: "Request approved successfully", type: "success" }));
            onRefetch();
            refetchDoctorRequests();
        } catch (err: any) {
            dispatch(showToast({ message: err.message || "Failed to approve request", type: "error" }));
        } finally {
            setApproveLoadingId(null);
        }
    };

    const handleReject = async (id: string) => {
        setRejectLoadingId(id);
        try {
            const res = await api.patch(`/CaseRequests/${id}/status`, { status: "Rejected" });
            dispatch(showToast({ message: "Request rejected", type: "success" }));
            onRefetch();
            refetchDoctorRequests();
        } catch (err: any) {
            dispatch(showToast({ message: err.message || "Failed to reject request", type: "error" }));
        } finally {
            setRejectLoadingId(null);
        }
    };

    const currentRequest = pendingRequests[currentIndex];

    return (
        <View>
            {(doctorRequestsLoading && pendingRequests.length === 0) ? (
                <View className="items-center justify-center py-6">
                    <ActivityIndicator size="small" color={isDark ? '#94a3b8' : '#64748b'} />
                </View>
            ) : pendingRequests.length > 0 && currentRequest && !patient.assignedStudentId ? (
                <View className="space-y-2">
                    {pendingRequests.length > 1 && (
                        <View className="flex-row items-center justify-between px-2 pt-2">
                            <Text className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                                Request {currentIndex + 1} of {pendingRequests.length}
                            </Text>
                            <View className="flex-row items-center gap-1">
                                <TouchableOpacity 
                                    onPress={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                                    disabled={currentIndex === 0}
                                    className={`p-1 rounded-md ${currentIndex === 0 ? 'opacity-30' : ''}`}
                                >
                                    <ChevronLeft size={16} color={isDark ? '#94a3b8' : '#64748b'} />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => setCurrentIndex(prev => Math.min(pendingRequests.length - 1, prev + 1))}
                                    disabled={currentIndex === pendingRequests.length - 1}
                                    className={`p-1 rounded-md ${currentIndex === pendingRequests.length - 1 ? 'opacity-30' : ''}`}
                                >
                                    <ChevronRight size={16} color={isDark ? '#94a3b8' : '#64748b'} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    <PendingRequestCard
                        requestData={currentRequest}
                        approveLoading={approveLoadingId === currentRequest.id}
                        rejectLoading={rejectLoadingId === currentRequest.id}
                        onApprove={() => handleApprove(currentRequest.id)}
                        onReject={() => handleReject(currentRequest.id)}
                    />
                </View>
            ) : null}

            {/* ── Session needs evaluation (matches web DoctorActions) ── */}
            <EvaluationCard />
        </View>
    );
}
