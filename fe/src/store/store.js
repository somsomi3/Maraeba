import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice"; // ✅ authSlice 추가
import browserReducer from './browserSlice'
import cameraReudcer from './cameraSlice'

const store = configureStore({
    reducer: {
        auth: authReducer,
        browser: browserReducer,
        camera: cameraReudcer,
    },
});

export default store;
