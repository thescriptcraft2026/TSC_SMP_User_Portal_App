import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  applyOpportunityApi,
  createOpportunityApi,
  deleteOpporunityApi,
  getAllMyopportunityApi,
  getAllOpportunityApi,
  getOpportunityDetailsById,
  getOpportunityMySubmissionsApi,
  getOpportunityRolesApi,
  getOpportunitySubmissionsApi,
  opportunityBookMarkApi,
  updateOpportunityApi,
  updateOpportunityStatusApi,
} from '../../services/opportunityApi';

interface OpportunityState {
  opportunitys: any;
  selectedOpportunity: any;
  roles: any;
  loading: boolean;
  createLoading: boolean;
  applyLoading: boolean;
  error: string | null;
  page: any;
  hasMore: any;
  bookmarkLoading: boolean;
  bookmarkedIds: string[];
  deleteLoading: boolean;
  statusLoading: boolean;

  submissions: any;
  submissionsPage: any;
  submissionsHasMore: boolean;
  submissionsLoading: boolean;
  detailsLoading: boolean;

  mySubmissions: any;
  mySubmissionsPage: number;
  mySubmissionsHasMore: boolean;
  mySubmissionsLoading: boolean;
}

// Get All Opportunitys
export const getOpportunitys = createAsyncThunk(
  'opportunity/getOpportunitys',
  async (
    {
      page = 1,
      source = 'all',
      search,
      categoryId,
    }: { page?: number; source?: string; search?: string; categoryId?: any },
    { rejectWithValue },
  ) => {
    try {
      const res = await getAllOpportunityApi(page, source, search, categoryId);
      return { ...res, page };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors?.[0]?.message ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message,
      );
    }
  },
);

// Get opportunity details by id
export const getOpportunityDetailsByIdThunk = createAsyncThunk(
  'opportunity/getOpportunityDetailsById',
  async (opp_id: any, { rejectWithValue }) => {
    try {
      const res = await getOpportunityDetailsById(opp_id);
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors?.[0]?.message ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message,
      );
    }
  },
);

// Get All roles of opportunitys
export const getAllOpportunityRoles = createAsyncThunk(
  'opportunity/getAllOpportunityRoles',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getOpportunityRolesApi();
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors?.[0]?.message ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message,
      );
    }
  },
);

// Create Opportunity
export const createOpportunity = createAsyncThunk(
  'opportunity/createOpportunity',
  async (formData: any, { rejectWithValue }) => {
    try {
      const res = await createOpportunityApi(formData);
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors?.[0]?.message ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message,
      );
    }
  },
);

// Update Opportunity
export const updateOpportunity = createAsyncThunk(
  'opportunity/updateOpportunity',
  async ({ opp_id, formData }: any, { rejectWithValue }) => {
    try {
      const res = await updateOpportunityApi(opp_id, formData);
      console.log('update form data', res?.data);
      if (!res?.success) {
        return rejectWithValue(res?.message);
      }

      return res;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  },
);

// Apply Opportunity
export const applyOpportunity = createAsyncThunk(
  'opportunity/applyOpportunity',
  async (
    { formData, opp_id }: { formData: any; opp_id: any },
    { rejectWithValue },
  ) => {
    try {
      const res = await applyOpportunityApi(formData, opp_id);
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors?.[0]?.message ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message,
      );
    }
  },
);

// BookMark Opportunity
export const toggleContestBookmark = createAsyncThunk(
  'opportunity/opportunityBookmark',
  async (
    {
      oppourtunity_id,
      type,
    }: { oppourtunity_id: any; type: 'create' | 'delete' },
    { rejectWithValue },
  ) => {
    try {
      const res = await opportunityBookMarkApi(oppourtunity_id, type);

      // ✅ SAFE CHECK
      if (!res) {
        throw new Error('Empty response');
      }

      return {
        oppourtunity_id,
        type,
      };
    } catch (error: any) {
      console.log('THUNK ERROR FULL:', error); // 👈 ADD THIS
      return rejectWithValue(
        error?.response?.data?.errors?.[0]?.message ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message,
      );
    }
  },
);

// Delete Opportunity
export const deleteOpportunity = createAsyncThunk(
  'opportunity/deleteOpportunity',
  async (opp_id: string, { rejectWithValue }) => {
    try {
      const res = await deleteOpporunityApi(opp_id);

      // ✅ optional safety check
      if (!res?.success) {
        return rejectWithValue(res?.message || 'Delete failed');
      }

      return opp_id; // return id for reducer
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  },
);

// Get All My Opportunitys
export const getMyOpportunities = createAsyncThunk(
  'opportunity/getMyOpportunities',
  async (
    { page = 1, username }: { page: number; username: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await getAllMyopportunityApi(page, username);
      return { ...res, page };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors?.[0]?.message ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message,
      );
    }
  },
);

// Update Status
export const updateOpportunityStatus = createAsyncThunk(
  'opportunity/updateOpportunityStatus',
  async (
    { opp_id, status }: { opp_id: string; status: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await updateOpportunityStatusApi(opp_id, status);

      if (!res?.success) {
        return rejectWithValue(res?.message || 'Status update failed');
      }

      return {
        opp_id,
        status,
      };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  },
);

// View All Submissions of my opportunity by id
export const getOpportunitySubmissions = createAsyncThunk(
  'submissions/getOpportunitySubmissions',
  async (
    { page = 1, opportunity_id }: { page: number; opportunity_id: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await getOpportunitySubmissionsApi(page, opportunity_id);

      return { ...res, page };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  },
);

// View My Submitted Opportunities
export const getOpportunityMySubmissions = createAsyncThunk(
  'submissions/getOpportunityMySubmissions',
  async ({ page = 1 }: { page: number }, { rejectWithValue }) => {
    try {
      const res = await getOpportunityMySubmissionsApi(page);

      return { ...res, page };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors?.[0]?.message ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message,
      );
    }
  },
);

const initialState: OpportunityState = {
  opportunitys: [],
  selectedOpportunity: null,
  roles: [],
  loading: false,
  createLoading: false,
  applyLoading: false,
  error: null,
  page: 1,
  hasMore: true,
  bookmarkLoading: false,
  bookmarkedIds: [],
  deleteLoading: false,
  statusLoading: false,

  // 🔥 ADD THIS
  submissions: [],
  submissionsPage: 1,
  submissionsHasMore: true,
  submissionsLoading: false,
  detailsLoading: false,

  mySubmissions: [],
  mySubmissionsPage: 1,
  mySubmissionsHasMore: true,
  mySubmissionsLoading: false,
};

const opportunitySlice = createSlice({
  name: 'opportunity',
  initialState,
  reducers: {
    // ✅ instant UI update
    toggleBookmarkLocal: (state, action) => {
      const id = action.payload;

      if (!id) return; // ✅ IMPORTANT

      if (state.bookmarkedIds.includes(id)) {
        state.bookmarkedIds = state.bookmarkedIds.filter(i => i !== id);
      } else {
        state.bookmarkedIds.push(id);
      }
    },
    updateOpportunityStatusLocal: (state, action) => {
      const { opp_id, status } = action.payload;

      // ✅ update list
      state.opportunitys = state.opportunitys.map((item: any) =>
        item.opp_id === opp_id ? { ...item, status } : item,
      );

      // ✅ update details screen
      if (state.selectedOpportunity?.opp_id === opp_id) {
        state.selectedOpportunity.status = status;
      }
    },

    updateOpportunityReportedLocal: (state, action) => {
      const oppId = action.payload;

      // Update details screen
      if (state.selectedOpportunity?.id === oppId) {
        state.selectedOpportunity.isReported = 1;
      }

      // Update list screen
      state.opportunitys = state.opportunitys.map((item: any) =>
        item.id === oppId
          ? {
            ...item,
            isReported: 1,
          }
          : item,
      );
    },
  },

  extraReducers: builder => {
    builder

      // Get All Opportunitys
      .addCase(getOpportunitys.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOpportunitys.fulfilled, (state, action: any) => {
        state.loading = false;

        const newOpportunitys = action.payload?.data || [];
        const page = action.payload.page;

        if (page === 1) {
          state.opportunitys = newOpportunitys;
          // ✅ SET INITIAL BOOKMARKS
          state.bookmarkedIds = newOpportunitys
            .filter((o: any) => o.isWishlisted === 1)
            .map((o: any) => o.id);
        } else {
          state.opportunitys = [...state.opportunitys, ...newOpportunitys];
          const newBookmarked = newOpportunitys
            .filter((o: any) => o.isWishlisted === 1)
            .map((o: any) => o.id);

          state.bookmarkedIds = [
            ...new Set([...state.bookmarkedIds, ...newBookmarked]),
          ];
        }

        const totalPages = action.payload?.pagination?.total_pages || 1;
        state.page = page;
        state.hasMore = page < totalPages;
      })
      .addCase(getOpportunitys.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getOpportunityDetailsByIdThunk.pending, state => {
        state.loading = true;
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(getOpportunityDetailsByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.detailsLoading = false;
        state.selectedOpportunity = action.payload;

        // ✅ ADD THIS BLOCK
        const opp = action.payload;

        if (opp?.isWishlisted === 1) {
          if (!state.bookmarkedIds.includes(opp.id)) {
            state.bookmarkedIds.push(opp.id);
          }
        } else {
          state.bookmarkedIds = state.bookmarkedIds.filter(id => id !== opp.id);
        }
      })
      .addCase(
        getOpportunityDetailsByIdThunk.rejected,
        (state, action: any) => {
          state.loading = false;
          state.detailsLoading = false;
          // drop stale data so a failed/deleted opportunity never shows the previous one
          state.selectedOpportunity = null;
          state.error = action.payload;
        },
      )
      .addCase(getAllOpportunityRoles.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOpportunityRoles.fulfilled, (state, action: any) => {
        state.loading = false;
        state.roles = action.payload?.data || action.payload || [];
      })
      .addCase(getAllOpportunityRoles.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createOpportunity.pending, state => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createOpportunity.fulfilled, (state, action: any) => {
        state.createLoading = false;

        // optional: push new item at top
        if (action.payload?.data) {
          state.opportunitys = [action.payload.data, ...state.opportunitys];
        }
      })
      .addCase(createOpportunity.rejected, (state, action: any) => {
        state.createLoading = false;
        state.error = action.payload;
      })

      // Update Opporuntiy
      .addCase(updateOpportunity.fulfilled, (state, action: any) => {
        console.log('update payload', action.payload);
        state.loading = false;

        const updated = action.payload?.data;

        if (!updated) return;

        // ✅ Update list
        state.opportunitys = state.opportunitys.map((item: any) =>
          item.id === updated.id ? updated : item,
        );

        // ✅ Update selected
        if (state.selectedOpportunity?.id === updated.id) {
          state.selectedOpportunity = updated;
        }
      })

      // Apply Opprunity
      .addCase(applyOpportunity.pending, state => {
        state.applyLoading = true;
        state.error = null;
      })
      .addCase(applyOpportunity.fulfilled, (state, action: any) => {
        state.applyLoading = false;
      })
      .addCase(applyOpportunity.rejected, (state, action: any) => {
        state.applyLoading = false;
        state.error = action.payload;
      })

      // Bookmark
      .addCase(toggleContestBookmark.pending, state => {
        // state.loading = true;
      })
      .addCase(toggleContestBookmark.fulfilled, (state, action: any) => {
        // state.loading = false;

        const { oppourtunity_id, type } = action.meta.arg;

        if (type === 'create') {
          if (!state.bookmarkedIds.includes(oppourtunity_id)) {
            state.bookmarkedIds.push(oppourtunity_id);
          }
        } else {
          state.bookmarkedIds = state.bookmarkedIds.filter(
            id => id !== oppourtunity_id,
          );
        }
      })
      .addCase(toggleContestBookmark.rejected, (state, action) => {
        // state.loading = false;
        console.log('Bookmark Error:', action.payload);
      })

      // Delete
      .addCase(deleteOpportunity.pending, state => {
        state.deleteLoading = true;
        state.error = null;
      })

      .addCase(deleteOpportunity.fulfilled, (state, action) => {
        state.deleteLoading = false;

        const deletedId = action.payload;

        // ✅ remove from list
        state.opportunitys = state.opportunitys.filter(
          (item: any) => item.id !== deletedId,
        );

        // ✅ clear selected if same
        if (state.selectedOpportunity?.id === deletedId) {
          state.selectedOpportunity = null;
        }

        // ✅ ALSO remove from bookmarks (you missed this)
        state.bookmarkedIds = state.bookmarkedIds.filter(
          id => id !== deletedId,
        );
      })

      .addCase(deleteOpportunity.rejected, (state, action: any) => {
        state.deleteLoading = false;
        state.error = action.payload;
      })

      // Get All My Opportunitys
      .addCase(getMyOpportunities.pending, state => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getMyOpportunities.fulfilled, (state, action: any) => {
        state.loading = false;

        const newData = action.payload?.data || [];
        const page = action.meta.arg.page;

        if (page === 1) {
          state.opportunitys = newData;
        } else {
          state.opportunitys = [...state.opportunitys, ...newData];
        }

        const totalPages = action.payload?.pagination?.total_pages || 1;
        state.page = page;
        state.hasMore = page < totalPages;
      })

      .addCase(getMyOpportunities.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Status
      .addCase(updateOpportunityStatus.pending, state => {
        state.statusLoading = true;
      })

      .addCase(updateOpportunityStatus.fulfilled, (state, action: any) => {
        state.statusLoading = false;

        const { opp_id, status } = action.payload;

        // ✅ Update list instantly
        state.opportunitys = state.opportunitys.map((item: any) =>
          item.opp_id === opp_id ? { ...item, status } : item,
        );

        // ✅ Update selected opportunity
        if (state.selectedOpportunity?.opp_id === opp_id) {
          state.selectedOpportunity.status = status;
        }
      })

      .addCase(updateOpportunityStatus.rejected, (state, action: any) => {
        state.statusLoading = false;
        state.error = action.payload;
      })

      // View all submissions of my opportunity by id
      .addCase(getOpportunitySubmissions.pending, state => {
        state.submissionsLoading = true;
      })

      .addCase(getOpportunitySubmissions.fulfilled, (state, action: any) => {
        state.submissionsLoading = false;

        const newData = action.payload?.data || [];
        const page = action.payload.page;

        if (page === 1) {
          state.submissions = newData;
        } else {
          state.submissions = [...state.submissions, ...newData];
        }

        const totalPages = action.payload?.pagination?.total_pages || 1;

        state.submissionsPage = page;
        state.submissionsHasMore = page < totalPages;
      })

      .addCase(getOpportunitySubmissions.rejected, (state, action: any) => {
        state.submissionsLoading = false;
        state.error = action.payload;
      })

      // View my submitted opportunities
      .addCase(getOpportunityMySubmissions.pending, state => {
        state.mySubmissionsLoading = true;
      })

      .addCase(getOpportunityMySubmissions.fulfilled, (state, action: any) => {
        state.mySubmissionsLoading = false;

        const newData = action.payload?.data || [];
        const page = action.payload.page;

        if (page === 1) {
          state.mySubmissions = newData;
        } else {
          state.mySubmissions = [...state.mySubmissions, ...newData];
        }

        const totalPages = action.payload?.pagination?.total_pages || 1;

        state.mySubmissionsPage = page;
        state.mySubmissionsHasMore = page < totalPages;
      })

      .addCase(getOpportunityMySubmissions.rejected, (state, action: any) => {
        state.mySubmissionsLoading = false;
        state.error = action.payload;
      });
  },
});

export const { toggleBookmarkLocal, updateOpportunityStatusLocal,  updateOpportunityReportedLocal, } =
  opportunitySlice.actions;
export default opportunitySlice.reducer;
