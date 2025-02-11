import "./App.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Login } from "./features/auth";

function App() {
    const navigate = useNavigate();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    useEffect(() => {
        if (isAuthenticated) {
            console.log("✅ 로그인 상태 감지 → /main으로 이동");
            navigate("/main"); // ✅ 로그인 상태라면 자동 이동
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="app-container">
            <Login />
        </div>
    );
}

export default App;
