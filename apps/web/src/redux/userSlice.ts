import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PlatformUser } from "@/types/contractManagement";
import {
  fetchUsers,
  updateUserStatus,
  createUser,
  updateUserRole,
} from "./userThunk";
export interface IUserState {
  users: PlatformUser[];
  loading: boolean;
  error: string | null;
  updateLoading: boolean;
}
const initialState: IUserState = {
  users: [],
  loading: false,
  error: null,
  updateLoading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUsers(state, action: PayloadAction<PlatformUser[]>) {
      state.users = action.payload;
    },
    clearUserError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchUsers
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch users";
      });
    // updateUserStatus
    builder
      .addCase(updateUserStatus.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.updateLoading = false;
        if (!action.payload?.id) return;
        const target = state.users.find((u) => u.id === action.payload.id);
        if (target) {
          if (action.payload.isActive !== undefined)
            target.isActive = action.payload.isActive;
          if (action.payload.role !== undefined)
            target.role = action.payload.role;
        }
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload ?? "Failed to update user status";
      });

    // updateUserRole
    builder
      .addCase(updateUserRole.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.updateLoading = false;
        if (!action.payload?.id) return;
        const target = state.users.find((u) => u.id === action.payload.id);
        if (target) {
          if (action.payload.role !== undefined)
            target.role = action.payload.role;
          if (action.payload.isActive !== undefined)
            target.isActive = action.payload.isActive;
          if (action.payload.name !== undefined)
            target.name = action.payload.name;
          if (action.payload.email !== undefined)
            target.email = action.payload.email;
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload ?? "Failed to update user role";
      });

    // createUser
    builder
      .addCase(createUser.pending, (state) => {
        state.updateLoading = true;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.users = [action.payload, ...state.users];
      })
      .addCase(createUser.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload ?? "Failed to create user";
      });
  },
});
export const { setUsers, clearUserError } = userSlice.actions;
export default userSlice.reducer;
