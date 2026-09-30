import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportApi, reportPostApi } from '../../services/reportApi';

// 🔥 GET REPORTS
export const getReports = createAsyncThunk(
  'report/getReports',
  async (_, { rejectWithValue }) => {
    try {
      const res = await reportApi();
      return res;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  },
);

// Create Report
export const createReport = createAsyncThunk(
  'report/createReport',
  async (
    data: {
      report_id: string;
      description?: string;
      synopses_id?: string;
      reported_user_id?: string;
      chat_id?: string;
      message_id?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await reportPostApi(data);
      return res;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  },
);

const reportSlice = createSlice({
  name: 'report',
  initialState: {
    reports: [] as any[],
    loading: false,
    error: null as string | null,
    createLoading: false, // 🔥 add this
    success: false, // 🔥 add this
  },
  reducers: {
    resetReportState: state => {
      state.createLoading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder

      // Get All Report Messages
      // 🔄 PENDING
      .addCase(getReports.pending, state => {
        state.loading = true;
        state.error = null;
      })

      // ✅ SUCCESS
      .addCase(getReports.fulfilled, (state, action: any) => {
        state.loading = false;
        state.reports = action.payload?.data || action.payload;
      })

      // ❌ ERROR
      .addCase(getReports.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔥 CREATE REPORT
      .addCase(createReport.pending, state => {
        state.createLoading = true;
        state.success = false;
      })

      .addCase(createReport.fulfilled, (state, action: any) => {
        state.createLoading = false;
        state.success = true;
      })

      .addCase(createReport.rejected, (state, action: any) => {
        state.createLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetReportState } = reportSlice.actions;
export default reportSlice.reducer;
