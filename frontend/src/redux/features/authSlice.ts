// src/redux/slices/authSlice.ts
import { seller, Address } from "@/components/types/waste";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  address: Address | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
  address: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
    },
    setUser(state, action: PayloadAction<{ address: Address; user: User }>) {
      state.address = action.payload.address;
      state.user = action.payload.user;
    },
  },
});

export const { setToken, setUser } = authSlice.actions;
export default authSlice.reducer;
