import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice"; // ✅ authSlice 추가

const store = configureStore({
    reducer: {
        auth: authReducer,
    },
});

export default store;
