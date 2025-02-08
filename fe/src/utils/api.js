import axios from "axios";
import store from "../store/store";
import { login, logout } from "../store/authSlice";
import { jwtDecode } from "jwt-decode"; // ✅ JWT 디코딩 라이브러리 추가

// 🔥 Flask API 인스턴스
const flaskApi = axios.create({
    baseURL: import.meta.env.VITE_FLASK_API_URL,
    headers: { "Content-Type": "application/json" },

});

// 🔥 Spring API 인스턴스
const springApi = axios.create({
    baseURL: import.meta.env.VITE_SPRING_API_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

// ✅ 로그인 API (RefreshToken은 쿠키에 저장됨)
export const loginApi = (credentials) =>
    axios.post(
        `${import.meta.env.VITE_SPRING_API_URL}/auth/login`,
        credentials,
        { withCredentials: true }
    );

// ✅ 토큰 재발급 API (쿠키에서 RefreshToken 전송)
export const refreshTokenApi = () =>
    axios.post(
        `${import.meta.env.VITE_SPRING_API_URL}/auth/token`,
        {},
        { withCredentials: true }
    );

// ✅ 로그아웃 API (RefreshToken 삭제)
export const logoutApi = () =>
    springApi.post("/auth/logout", {}, { withCredentials: true });

const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const { exp } = jwtDecode(token);
        return Date.now() >= exp * 1000; // 현재 시간이 만료 시간보다 크면 만료된 것
    } catch (e) {
        return true;
    }
};

// ✅ 요청 인터셉터: Redux에서 토큰 가져와 헤더에 자동 추가
const addAuthToken = async (config) => {
    // ✅ 인증이 필요 없는 요청이면 `Authorization` 헤더 추가 X
    const publicEndpoints = ["/auth/register", "/auth/check-user-id", "/auth/kakao/callback", "/auth/find-id", "/auth/forgot-password"];
    if (publicEndpoints.some(endpoint => config.url.includes(endpoint))) {
        return config;
    }

    let token = store.getState().auth.token;
    
    if (!token || isTokenExpired(token)) {
        try {
            const res = await refreshTokenApi();
            token = res.data.access_token;
            store.dispatch(login(token));
        } catch (error) {
            store.dispatch(logout());
            window.location.href = "/login";
            return Promise.reject(error);
        }
    }

    config.headers.Authorization = `Bearer ${token}`;
    return config;
};

springApi.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
flaskApi.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));

// ✅ 응답 인터셉터: 401 발생 시 토큰 재발급 후 재요청
const handleResponseError = async (error) => {
    const originalRequest = error.config;

    // ✅ 카카오 로그인 콜백 요청이면 401 에러 무시 (토큰 갱신 X)
    if (originalRequest.url.includes("/auth/kakao/callback")) {
        return Promise.reject(error);
    }

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
            console.warn("🔄 AccessToken 만료됨. RefreshToken으로 재발급 시도...");
            const res = await refreshTokenApi();
            const newAccessToken = res.data.access_token;

            console.log("✅ 새로운 AccessToken 발급 완료:", newAccessToken);
            store.dispatch(login(newAccessToken)); // ✅ Redux에 새 토큰 저장
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            return axios(originalRequest); // ✅ 원래 요청 다시 실행
        } catch (refreshError) {
            console.error("❌ RefreshToken 만료됨. 로그아웃 처리 중...");
            store.dispatch(logout());
            window.location.href = "/login"; // ✅ 로그인 페이지로 이동
            return Promise.reject(refreshError);
        }
    }

    return Promise.reject(error);
};

// ✅ 응답 인터셉터 등록
springApi.interceptors.response.use(
    (response) => response,
    handleResponseError
);
flaskApi.interceptors.response.use(
    (response) => response,
    handleResponseError
);

export { flaskApi, springApi };
