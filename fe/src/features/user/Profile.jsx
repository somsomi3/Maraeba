import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";
import { springApi, logoutApi } from "../../utils/api";
import HomeButton from "../../components/button/HomeButton";
import { useNavigate } from "react-router-dom";
import pororo from "../../assets/images/pororo.png";
import PronunciationHistoryChart from "./PronunciationHistoryChart";
import PronunciationDetailChart from "./PronunciationDetailChart";
import "./Profile.css";

const Profile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const token = useSelector((state) => state.auth.token);
    const [username, setUsername] = useState("사용자");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 🔥 탭 상태 추가 (0: 발음 학습 기록, 1: 클래스별 발음 학습 통계)
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (!token) {
                console.warn("❌ 토큰이 없습니다. 로그인 페이지로 이동");
                navigate("/login");
                return;
            }

            try {
                const response = await springApi.get("/users/me", {
                    // headers: { Authorization: `Bearer ${token}` },
                });
                setUsername(response.data.username);
            } catch (error) {
                console.error("❌ 사용자 정보를 불러오는 중 오류 발생:", error);
                if (error.response?.status === 401) {
                    dispatch(logout());
                    navigate("/login");
                } else {
                    setError("사용자 정보를 불러올 수 없습니다.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, [token, dispatch, navigate]);

    const handleLogout = async () => {
        try {
            await logoutApi();
            dispatch(logout());
            navigate("/login");
            alert("로그아웃 되었습니다.");
        } catch (error) {
            console.error("❌ 로그아웃 실패:", error);
            alert("로그아웃에 실패했습니다.");
        }
    };

    return (
        <div className="profile-container">
            {/* 사이드바 */}
            <div className="sidebar">
                <div className="profile-header">
                    <h2>마이페이지</h2>
                </div>
                <nav className="profile-menu">
                    <ul>
                        <li className="active">내 프로필</li>
                        <li onClick={() => navigate("/profile-info")}>회원정보 수정</li>
                        <li onClick={handleLogout}>로그아웃</li>
                        <li onClick={() => navigate("/profile-delete")}>회원 탈퇴</li>
                    </ul>
                </nav>
            </div>

            {/* 메인 컨텐츠 */}
            <div className="profile-content">
                <h1>마이페이지</h1>

                {/* 🔥 탭 버튼 추가 */}
                <div className="tab-container">
                    <button 
                        className={`tab-button ${activeTab === 0 ? "active" : ""}`} 
                        onClick={() => setActiveTab(0)}
                    >
                        📊 발음 학습 기록
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 1 ? "active" : ""}`} 
                        onClick={() => setActiveTab(1)}
                    >
                        📈 클래스별 발음 학습 통계
                    </button>
                </div>

                {/* 🔥 탭별 콘텐츠 변경 */}
                {activeTab === 0 && <PronunciationHistoryChart />}
                {activeTab === 1 && <PronunciationDetailChart />}
            </div>

            <HomeButton />
        </div>
    );
};

export default Profile;
