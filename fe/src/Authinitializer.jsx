import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { login, logout } from "./store/authSlice"; 
import { refreshTokenApi } from "./utils/api";

function AuthInitializer({ children }) {
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        async function initializeAuth() {
            if (window.location.pathname === "/login") {
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

                // ✅ `navigate()` 대신 `window.location.href` 사용
                window.location.href = "/login";
            } finally {
                console.log("✅ AuthInitializer 로딩 완료");
                setLoading(false);
            }
        }

        initializeAuth();
    }, [dispatch]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return children;
}

export default AuthInitializer;
