import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RoleType } from "@/types/roles";

export interface IUser {
  id: string;
  name?: string;
  email: string;
  role: RoleType;
}

export interface IAuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  token: string | null;
}

const getInitialAuthState = (): IAuthState => {
  try {
    const raw = localStorage.getItem("auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.token && parsed?.user) {
        return {
          user: parsed.user,
          token: parsed.token,
          isAuthenticated: true,
        };
      }
    }
  } catch (err) {
    console.error("Failed to parse auth from localStorage", err);
  }
  return {
    user: null,
    isAuthenticated: false,
    token: null,
  };
};

const initialState: IAuthState = getInitialAuthState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(
      state,
      action: PayloadAction<{
        user: IUser;
        token: string;
      }>,
    ) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      localStorage.setItem(
        "auth",
        JSON.stringify({
          user: state.user,
          token: state.token,
        }),
      );
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      localStorage.removeItem("auth");
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      const raw = localStorage.getItem("auth");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          parsed.token = action.payload;
          localStorage.setItem("auth", JSON.stringify(parsed));
        } catch {
          // ignore
        }
      }
    },
    rehydrate(state) {
      const fresh = getInitialAuthState();
      state.user = fresh.user;
      state.token = fresh.token;
      state.isAuthenticated = fresh.isAuthenticated;
    },
  },
});

export const { login, logout, setToken, rehydrate } = authSlice.actions;
export default authSlice.reducer;
