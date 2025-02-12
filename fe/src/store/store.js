import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice"; // ✅ authSlice 추가
import browserReducer from './browserSlice'


const store = configureStore({
    reducer: {
        auth: authReducer,
        browser: browserReducer,
    },
});

export default store;
