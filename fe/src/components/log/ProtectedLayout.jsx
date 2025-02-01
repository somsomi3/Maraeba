import { Outlet } from "react-router-dom";
// import { Navigate } from "react-router-dom";
// import { useSelector } from "react-redux";
import LogoutButton from "../button/LogoutButton"; // ✅ 로그아웃 버튼 추가

const ProtectedLayout = () => {
    // const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    return (
        <>
            <LogoutButton /> {/* ✅ 모든 페이지에서 로그아웃 버튼 표시 */}
            <Outlet />
        </>
    );

    // ✅ 로그인하지 않으면 `/login`으로 이동하는 기능을 잠시 비활성화 (주석 처리)
    // return isAuthenticated ? (
    //     <>
    //         <LogoutButton /> {/* ✅ 모든 페이지에서 로그아웃 버튼 표시 */}
    //         <Outlet />
    //     </>
    // ) : (
    //     <Navigate to="/login" replace />
    // );
};

export default ProtectedLayout;
