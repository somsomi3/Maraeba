import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"; // ✅ Redux 상태 가져오기
import { logout } from "../../store/authSlice"; // ✅ Redux 액션 가져오기
import { logoutApi } from "../../utils/api"; // ✅ 로그아웃 API 변경
import logoutbtn from "../../assets/icons/logout.png";
import "./LogoutButton.css";

const LogoutButton = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated); // ✅ 로그인 상태 확인

    const handleLogout = async () => {
        try {
            // ✅ 로그아웃 API 요청 (withCredentials: true 적용, Access Token 자동 추가)
            const { data } = await logoutApi();

            dispatch(logout());
            navigate("/login"); // ✅ 로그아웃 후 로그인 페이지로 이동
            alert(data.response?.data?.message || "로그아웃 했습니다.");
        } catch (error) {
            console.error("로그아웃 실패:", error);
            alert(error.response?.data?.message || "로그아웃에 실패했습니다.");
        }
    };

    if (!isAuthenticated) return null; // ✅ 로그인하지 않았으면 버튼 숨김

    return (
        <button className="logout-button" onClick={handleLogout}>
            <img src={logoutbtn} alt="로그아웃" />
        </button>
    );
};

export default LogoutButton;
