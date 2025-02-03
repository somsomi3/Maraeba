import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"; // ✅ Redux 상태 가져오기
import { logout } from "../../store/authSlice"; // ✅ Redux 액션 가져오기
import logoutbtn from "../../assets/icons/logout.png"
import "./LogoutButton.css";

const LogoutButton = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated); // ✅ 로그인 상태 확인

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login"); // ✅ 로그아웃 후 로그인 페이지로 이동
    };

    if (!isAuthenticated) return null; // ✅ 로그인하지 않았으면 버튼 숨김

    return (
        <button className="logout-button" onClick={handleLogout}>
            <img src={logoutbtn} alt="로그아웃" />
        </button>
    );
};

export default LogoutButton;
