import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { login, logout } from "./store/authSlice"; 
import { refreshTokenApi } from "./utils/api";
import { useSelector } from "react-redux";


function AuthInitializer({ children }) {
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    useEffect(() => {
        async function initializeAuth() {
            // ✅ 이미 로그인된 경우 추가적인 로그인 시도 방지
            if (isAuthenticated) {
                setLoading(false);
                return;
            }

            try {
                console.log("🔄 자동 로그인 시도 (Silent Refresh)");
                const res = await refreshTokenApi();
                const newToken = res.data.access_token;

                console.log("✅ AccessToken 갱신 성공:", newToken);
                dispatch(login(newToken));
            } catch (err) {
                console.error("❌ Silent refresh 실패:", err);
                dispatch(logout());
            } finally {
                console.log("✅ AuthInitializer 로딩 완료");
                setLoading(false);
            }
        }

        initializeAuth();
    }, [dispatch, isAuthenticated]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return children;
}

export default AuthInitializer;
