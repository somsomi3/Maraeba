import axios from "axios";
import store from "../store/store"; // api.js가 utils 폴더에 있으므로 상대경로 조정
import { login, logout } from "../store/authSlice";

// 🔥 Flask API 인스턴스
const flaskApi = axios.create({
    baseURL: import.meta.env.VITE_FLASK_API_URL,
    headers: { "Content-Type": "application/json" },
});

// 🔥 Spring API 인스턴스
const springApi = axios.create({
    baseURL: import.meta.env.VITE_SPRING_API_URL,
    headers: { "Content-Type": "application/json" },
});

// 로그인 API (리프레시 토큰은 쿠키에 저장)
export const loginApi = (credentials) =>
    axios.post(
        `${import.meta.env.VITE_SPRING_API_URL}/auth/login`,
        credentials,
        {
            withCredentials: true,
        }
    );

// 토큰 재발급 API (쿠키에서 자동으로 Refresh Token 전송)
export const refreshTokenApi = () =>
    axios.post(
        `${import.meta.env.VITE_SPRING_API_URL}/auth/token`,
        {},
        {
            withCredentials: true,
        }
    );

// 로그아웃 API (쿠키에서 Refresh Token 삭제)
export const logoutApi = () =>
    springApi.post(
        "/auth/logout",
        {},
        {
            withCredentials: true,
        }
    );

// 요청 인터셉터: Redux 스토어에서 토큰 가져오기
const addAuthToken = (config) => {
    const token = store.getState().auth.token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

springApi.interceptors.request.use(addAuthToken, (error) =>
    Promise.reject(error)
);
flaskApi.interceptors.request.use(addAuthToken, (error) =>
    Promise.reject(error)
);

// 응답 인터셉터: 토큰 재발급 시 Redux 업데이트
const handleResponseError = async (error) => {
    const originalRequest = error.config;

    if (
        error.response &&
        error.response.status === 401 &&
        !originalRequest._retry
    ) {
        originalRequest._retry = true;

        try {
            const res = await refreshTokenApi();
            const newAccessToken = res.data.token;

            // Redux 스토어에 새 토큰 저장
            store.dispatch(login(newAccessToken));
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            return axios(originalRequest);
        } catch (refreshError) {
            console.error("토큰 재발급 실패:", refreshError);
            store.dispatch(logout());
            window.location.href = "/login";
            return Promise.reject(refreshError);
        }
    }

    return Promise.reject(error);
};

springApi.interceptors.response.use(
    (response) => response,
    handleResponseError
);
flaskApi.interceptors.response.use((response) => response, handleResponseError);

export { flaskApi, springApi };
