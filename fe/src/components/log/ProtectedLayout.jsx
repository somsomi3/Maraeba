import { Outlet } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LogoutButton from "../button/LogoutButton"; // ✅ 로그아웃 버튼 추가

const ProtectedLayout = () => {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    return isAuthenticated ? (
        <>
            <Outlet />
        </>
    ) : (
        <Navigate to="/login" replace />
    );
};

export default ProtectedLayout;
