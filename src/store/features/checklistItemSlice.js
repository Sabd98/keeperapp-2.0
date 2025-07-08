import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/api";

export const fetchChecklistItems = createAsyncThunk(
  "checklistItems/fetchByChecklistId",
  async (checklistId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/checklist/${checklistId}/item`
      );

      // Debug: Tampilkan struktur respons lengkap
      console.log("Fetch checklist items response:", response.data);

      // Pastikan kita selalu mengembalikan array
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response.data.data)) {
        return response.data.data; // Jika data ada di properti data
      } else if (Array.isArray(response.data.items)) {
        return response.data.items; // Jika data ada di properti items
      } else {
        console.error("Unexpected response structure:", response.data);
        return []; // Kembalikan array kosong
      }
    } catch (error) {
      console.error("Fetch checklist items error:", error);
      return rejectWithValue(error.response?.data);
    }
  }
);

export const createChecklistItem = createAsyncThunk(
  "checklistItems/create",
  async ({ checklistId, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/checklist/${checklistId}/item`,
        data
      );

      // Pastikan kita mengembalikan item yang lengkap
      return {
        id: response.data.id || Date.now(), // ID sementara jika belum ada
        name: data.itemName,
        status: false, // Default status
      };
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateChecklistItemStatus = createAsyncThunk(
  "checklistItems/updateStatus",
  async ({ checklistId, itemId, status }) => {
    await axiosInstance.put(`/checklist/${checklistId}/item/${itemId}`, {
      status,
    });
    return { itemId, status };
  }
);

export const updateChecklistItemName = createAsyncThunk(
  "checklistItems/updateName",
  async ({ checklistId, itemId, data }, { rejectWithValue }) => {
    try {
      await axiosInstance.put(
        `/checklist/${checklistId}/item/rename/${itemId}`,
        data
      );

      // Kembalikan data yang diperlukan untuk update
      return {
        itemId,
        name: data.itemName,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const deleteChecklistItem = createAsyncThunk(
  "checklistItems/delete",
  async ({ checklistId, itemId }) => {
    await axiosInstance.delete(`/checklist/${checklistId}/item/${itemId}`);
    return itemId;
  }
);

const checklistItemSlice = createSlice({
  name: "checklistItems",
  initialState: {
    items: [],
    status: "idle",
    error: null,
    itemsByChecklistId: {}, 
    loadingItems: {}, 
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchChecklistItems.pending, (state,action) => {
        const checklistId = action.meta.arg;
        state.loadingItems[checklistId] = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchChecklistItems.fulfilled, (state, action) => {
        const checklistId = action.meta.arg;
        state.itemsByChecklistId[checklistId] = action.payload;
        state.loadingItems[checklistId] = false;
        state.status = "succeeded";

        // Pastikan payload adalah array
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchChecklistItems.rejected, (state, action) => {
        const checklistId = action.meta.arg;
        state.loadingItems[checklistId] = false;
        state.status = "failed";
        state.error = action.payload;
        state.items = []; 
      })
      .addCase(createChecklistItem.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateChecklistItemStatus.fulfilled, (state, action) => {
        const item = state.items.find((i) => i.id === action.payload.itemId);
        if (item) {
          item.status = action.payload.status;
        }
      })
      .addCase(updateChecklistItemName.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (i) => i.id === action.payload.itemId
        );
        if (index !== -1) {
          state.items[index].name = action.payload.name;
        }
      })
      .addCase(deleteChecklistItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export default checklistItemSlice.reducer;
