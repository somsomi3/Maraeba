import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import LogoutButton from "../button/LogoutButton"; // ✅ 로그아웃 버튼 추가

const ProtectedLayout = () => {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    return isAuthenticated ? (
        <>
            <LogoutButton /> {/* ✅ 모든 페이지에서 로그아웃 버튼 표시 */}
            <Outlet />
        </>
    ) : (
        <Navigate to="/login" replace />
    );
};

export default ProtectedLayout;
