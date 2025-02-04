import axios from "axios";

// 🔥 Flask API 인스턴스 (일반 API 요청)
const flaskApi = axios.create({
    baseURL: import.meta.env.VITE_FLASK_API_URL,
    headers: { "Content-Type": "application/json" },
});

// 🔥 Spring API 인스턴스 (일반 API 요청)
const springApi = axios.create({
    baseURL: import.meta.env.VITE_SPRING_API_URL,
    headers: { "Content-Type": "application/json" },
});

// 🔥 로그인 API (Refresh Token을 쿠키에 저장)
export const loginApi = (credentials) =>
    axios.post(`${import.meta.env.VITE_SPRING_API_URL}/auth/login`, credentials, {
        withCredentials: true, // ✅ Refresh Token을 쿠키에 저장
    });

// 🔥 토큰 재발급 API (쿠키에서 자동으로 Refresh Token 전송)
export const refreshTokenApi = () =>
    axios.post(`${import.meta.env.VITE_SPRING_API_URL}/auth/token`, {}, {
        withCredentials: true, // ✅ Refresh Token을 쿠키에서 자동 전송
    });

// 🔥 로그아웃 API (쿠키에서 Refresh Token 삭제)
export const logoutApi = () =>
    axios.post(`${import.meta.env.VITE_SPRING_API_URL}/auth/logout`, {}, {
        withCredentials: true, // ✅ Refresh Token 삭제 (서버에서 쿠키 제거)
    });

// ✅ 요청 인터셉터 (Access Token 자동 추가)
const addAuthToken = (config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

springApi.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
flaskApi.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));

// ✅ 응답 인터셉터 (토큰 재발급)
const handleResponseError = async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
            // 🔥 토큰 재발급 요청 (쿠키에서 Refresh Token 전송)
            const res = await refreshTokenApi();
            const newAccessToken = res.data.token;

            localStorage.setItem("token", newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            return axios(originalRequest);
        } catch (refreshError) {
            console.error("토큰 재발급 실패:", refreshError);
            localStorage.removeItem("token");
            window.location.href = "/login";
            return Promise.reject(refreshError);
        }
    }

    return Promise.reject(error);
};

springApi.interceptors.response.use((response) => response, handleResponseError);
flaskApi.interceptors.response.use((response) => response, handleResponseError);

export { flaskApi, springApi };
