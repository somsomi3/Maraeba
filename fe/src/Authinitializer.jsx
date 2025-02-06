import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { login, logout } from "./store/authSlice"; // ✅ Redux 액션 가져오기
import { refreshTokenApi } from "./utils/api"; // ✅ Refresh Token API 가져오기

const AuthInitializer = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const refreshAccessToken = async () => {
            try {
                const { data } = await refreshTokenApi(); // 🔥 새 Access Token 요청
                dispatch(login(data.token)); // ✅ Redux에 새 토큰 저장
            } catch (error) {
                console.error("토큰 갱신 실패:", error);
                dispatch(logout()); // ✅ 토큰 갱신 실패 시 로그아웃 처리
            }
        };

        refreshAccessToken(); // 🔥 새로고침 시 토큰 갱신 시도
    }, [dispatch]);

    return null; // ✅ 렌더링하지 않는 컴포넌트
};

export default AuthInitializer;
