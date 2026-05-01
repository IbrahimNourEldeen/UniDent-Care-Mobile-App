import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DoctorProfileState {
  publicId: string;
  fullName: string;
  email: string;
  specialty: string;
  universityId: string;
  totalStudents: number;
  pendingRequests: number;
  approvedRequests: number;
  createAt: string;
}

interface DoctorState {
  profile: DoctorProfileState | null;
  ongoingCasesCount: number;
  completedCasesCount: number;
  lastFetchedAt: string | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: DoctorState = {
  profile: null,
  ongoingCasesCount: 0,
  completedCasesCount: 0,
  lastFetchedAt: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const doctorSlice = createSlice({
  name: 'doctor',
  initialState,
  reducers: {
    setDoctorProfile: (state, action: PayloadAction<DoctorProfileState>) => {
      state.profile = action.payload;
      state.lastFetchedAt = new Date().toISOString();
    },
    setOngoingCasesCount: (state, action: PayloadAction<number>) => {
      state.ongoingCasesCount = action.payload;
    },
    setCompletedCasesCount: (state, action: PayloadAction<number>) => {
      state.completedCasesCount = action.payload;
    },
    updateDoctorProfileField: (
      state,
      action: PayloadAction<Partial<DoctorProfileState>>
    ) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    clearDoctorData: (state) => {
      state.profile = null;
      state.ongoingCasesCount = 0;
      state.completedCasesCount = 0;
      state.lastFetchedAt = null;
    },
  },
});

export const {
  setDoctorProfile,
  setOngoingCasesCount,
  setCompletedCasesCount,
  updateDoctorProfileField,
  clearDoctorData,
} = doctorSlice.actions;

export default doctorSlice.reducer;
