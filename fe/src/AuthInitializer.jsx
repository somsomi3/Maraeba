import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { login } from "./store/authSlice";
import { refreshTokenApi } from "./utils/api";

function AuthInitializer({ children }) {
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        async function initializeAuth() {
            try {
                const res = await refreshTokenApi();
                const newToken = res.data.access_token;
                dispatch(login(newToken));
            } catch (err) {
                console.error("Silent refresh 실패:", err);
            } finally {
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
