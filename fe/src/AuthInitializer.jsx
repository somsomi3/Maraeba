import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "./store/authSlice"; 
import { refreshTokenApi } from "./utils/api";

function AuthInitializer({ children }) {
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    useEffect(() => {
        async function initializeAuth() {
            try {
                console.log("🔄 자동 로그인 시도 (Silent Refresh)");

                // ✅ 새로고침 시 AccessToken 갱신
                const res = await refreshTokenApi();
                const newToken = res.data.access_token;

                dispatch(login(newToken));
            } catch (err) {
                console.error("❌ Silent refresh 실패:", err);
                // ✅ 새로고침 실패 시 강제 로그아웃
                dispatch(logout());
            } finally {
                console.log("✅ AuthInitializer 로딩 완료");
                setLoading(false);
            }
        }

        // ✅ 로그아웃한 상태가 아니라면 실행
        if (!isAuthenticated) {
            initializeAuth();
        } else {
            setLoading(false);
        }
    }, [dispatch, isAuthenticated]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return children;
}

export default AuthInitializer;
