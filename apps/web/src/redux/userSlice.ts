import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PlatformUser } from "@/types/contractManagement";
import { fetchUsers, updateUserDetails, createUser } from "./userThunk";
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
    // updateUserDetails
    builder
      .addCase(updateUserDetails.pending, (state) => {
        state.updateLoading = true;
      })
      .addCase(updateUserDetails.fulfilled, (state, action) => {
        state.updateLoading = false;
        const { id, role, isActive, name, email } = action.payload;
        state.users = state.users.map((u) => {
          if (u.id === id) {
            return {
              ...u,
              ...(role !== undefined && { role }),
              ...(isActive !== undefined && { isActive }),
              ...(name !== undefined && { name }),
              ...(email !== undefined && { email }),
            };
          }
          return u;
        });
      })
      .addCase(updateUserDetails.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload ?? "Failed to update user";
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
