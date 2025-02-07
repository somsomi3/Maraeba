import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    token: null,
    userId: null, // ✅ userId 추가
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            const token = action.payload;
            state.token = token;
            state.isAuthenticated = true;

            try {
                const payload = JSON.parse(atob(token.split(".")[1])); // ✅ JWT 디코딩
                state.userId = payload.sub; // ✅ userId 저장
            } catch (e) {
                console.error("❌ 토큰 파싱 오류:", e);
                state.userId = null;
            }
        },
        logout: (state) => {
            state.token = null;
            state.userId = null; // ✅ 로그아웃 시 userId도 초기화
            state.isAuthenticated = false;
        },
    },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
