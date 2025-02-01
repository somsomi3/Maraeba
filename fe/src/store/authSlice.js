import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    token: localStorage.getItem("token") || null,
    isAuthenticated: !!localStorage.getItem("token"),
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            state.token = action.payload;
            state.isAuthenticated = true;
            localStorage.setItem("token", action.payload);
        },
        logout: (state) => {
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem("token"); // ✅ 토큰 삭제
            localStorage.removeItem("refreshToken"); // ✅ 리프레시 토큰 삭제 
        },
    },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
