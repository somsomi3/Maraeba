import { createSlice } from "@reduxjs/toolkit";

const savedBrowserInfo = JSON.parse(localStorage.getItem("browserInfo")) || {
    browser: "unknown",
    audioType: "webm",
};

const browserSlice = createSlice({
    name: "browser",
    initialState: savedBrowserInfo,
    reducers: {
        setBrowserInfo: (state, action) => {
            state.browser = action.payload.browser;
            state.audioType = action.payload.audioType;
            
            localStorage.setItem("browserInfo", JSON.stringify(state)); 
        },
    },
});

export const { setBrowserInfo } = browserSlice.actions;
export default browserSlice.reducer;
