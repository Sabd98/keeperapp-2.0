import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/api";

export const fetchChecklistItems = createAsyncThunk(
  "checklistItems/fetchByChecklistId",
  async (checklistId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/checklist/${checklistId}/item`
      );
      return response.data.data || response.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch items"
      );
    }
  }
);

export const createChecklistItem = createAsyncThunk(
  "checklistItems/create",
  async ({ checklistId, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/checklist/${checklistId}/item`,
        { itemName: data.itemName }
      );

      // Return item yang konsisten dengan struktur
      return {
        checklistId,
        item: {
          id: response.data.data?.id || response.data.id || Date.now(),
          name: data.itemName,
          status: false,
        },
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create item"
      );
    }
  }
);

export const updateChecklistItemStatus = createAsyncThunk(
  "checklistItems/updateStatus",
  async ({ checklistId, itemId, status }, { rejectWithValue }) => {
    try {
      await axiosInstance.put(`/checklist/${checklistId}/item/${itemId}`, {
        status: status,
      });
      return { checklistId, itemId, status };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update status"
      );
    }
  }
);

export const updateChecklistItemName = createAsyncThunk(
  "checklistItems/updateName",
  async ({ checklistId, itemId, data }, { rejectWithValue }) => {
    try {
      await axiosInstance.put(
        `/checklist/${checklistId}/item/rename/${itemId}`,
        { itemName: data.itemName }
      );
      return { checklistId, itemId, name: data.itemName };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update name"
      );
    }
  }
);

export const deleteChecklistItem = createAsyncThunk(
  "checklistItems/delete",
  async ({ checklistId, itemId }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/checklist/${checklistId}/item/${itemId}`);
      return { checklistId, itemId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete item"
      );
    }
  }
);

const checklistItemSlice = createSlice({
  name: "checklistItems",
  initialState: {
    itemsByChecklistId: {},
    loadingItems: {},
    status: "idle",
    error: null,
  },
  reducers: {
    initializeItemsForChecklist: (state, action) => {
      const checklistId = action.payload;
      if (!state.itemsByChecklistId[checklistId]) {
        state.itemsByChecklistId[checklistId] = [];
        state.loadingItems[checklistId] = false;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Items
      .addCase(fetchChecklistItems.pending, (state, action) => {
        const checklistId = action.meta.arg;
        state.loadingItems[checklistId] = true;
        state.error = null;
      })
      .addCase(fetchChecklistItems.fulfilled, (state, action) => {
        const checklistId = action.meta.arg;
        state.loadingItems[checklistId] = false;
        state.itemsByChecklistId[checklistId] = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(fetchChecklistItems.rejected, (state, action) => {
        const checklistId = action.meta.arg;
        state.loadingItems[checklistId] = false;
        state.error = action.payload;
      })

      // Create Item
      .addCase(createChecklistItem.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createChecklistItem.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { checklistId, item } = action.payload;

        if (!state.itemsByChecklistId[checklistId]) {
          state.itemsByChecklistId[checklistId] = [];
        }

        state.itemsByChecklistId[checklistId].push(item);
      })
      .addCase(createChecklistItem.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Update Status
      .addCase(updateChecklistItemStatus.fulfilled, (state, action) => {
        const { checklistId, itemId, status } = action.payload;
        const items = state.itemsByChecklistId[checklistId] || [];
        const index = items.findIndex((item) => item.id === itemId);

        if (index !== -1) {
          state.itemsByChecklistId[checklistId][index].status = status;
        }
      })

      // Update Name
      .addCase(updateChecklistItemName.fulfilled, (state, action) => {
        const { checklistId, itemId, name } = action.payload;
        const items = state.itemsByChecklistId[checklistId] || [];
        const index = items.findIndex((item) => item.id === itemId);

        if (index !== -1) {
          state.itemsByChecklistId[checklistId][index].name = name;
        }
      })

      // Delete Item
      .addCase(deleteChecklistItem.fulfilled, (state, action) => {
        const { checklistId, itemId } = action.payload;
        if (state.itemsByChecklistId[checklistId]) {
          state.itemsByChecklistId[checklistId] = state.itemsByChecklistId[
            checklistId
          ].filter((item) => item.id !== itemId);
        }
      });
  },
});

export const { initializeItemsForChecklist } = checklistItemSlice.actions;
export default checklistItemSlice.reducer;
