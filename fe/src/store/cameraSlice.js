import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isCameraOn: false, 
  shouldRestart: false, // ✅ 화면 이동 시 자동 실행 여부
};

const cameraSlice = createSlice({
  name: "camera",
  initialState,
  reducers: {
    turnOnCamera: (state) => {
      state.isCameraOn = true;
      state.shouldRestart = true; // ✅ 카메라가 켜진 상태라면, 자동 실행 가능
    },
    turnOffCamera: (state) => {
      state.isCameraOn = false;
      state.shouldRestart = false; // ✅ 카메라를 끄면, 자동 실행도 중지
    },
  },
});

export const { turnOnCamera, turnOffCamera } = cameraSlice.actions;
export default cameraSlice.reducer;
