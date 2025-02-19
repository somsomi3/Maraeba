import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";
import { springApi, logoutApi } from "../../utils/api";
import HomeButton from "../../components/button/HomeButton";
import { useNavigate } from "react-router-dom";
import ProfileImageSelector from "./ProfileImageSelector";
import PronunciationHistoryChart from "./PronunciationHistoryChart";
import PronunciationDetailChart from "./PronunciationDetailChart";
import "./Profile.css";
import bear from "../../assets/profiles/profile1.png";
import backgroundImage from"../../assets/background/mypage_Bg.webp";

const Profile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const token = useSelector((state) => state.auth.token);
    const [username, setUsername] = useState("사용자");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 🔥 탭 상태 추가 (0: 발음 학습 기록, 1: 클래스별 발음 학습 통계)
    const [activeTab, setActiveTab] = useState(0);

    const [selectedProfile, setSelectedProfile] = useState(() => {
        return localStorage.getItem("profileImage") || bear;
    });
    useEffect(() => {

        const fetchUserInfo = async () => {
            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await springApi.get("/users/me", {
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

    const handleProfileChange = (newProfile) => {
        setSelectedProfile(newProfile);
        localStorage.setItem("profileImage", newProfile); // ✅ 선택한 프로필 저장
    };

    return (
        <div className="profile-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
            {/* 사이드바 */}
            <div className="sidebar">
                <ProfileImageSelector
                    selectedImage={selectedProfile}
                    onSelect={handleProfileChange}
                />
                <h2>{username}</h2>
                <nav className="profile-menu">
                    <ul>
                        <li className="active">내 프로필</li>
                        <li onClick={() => navigate("/profile-info")}>
                            회원정보 수정
                        </li>
                        <li onClick={() => navigate("/change-password")}>비밀번호 변경</li>
                        <li onClick={handleLogout}>로그아웃</li>
                        <li onClick={() => navigate("/profile-delete")}>
                            회원 탈퇴
                        </li>
                        
                    </ul>
                </nav>
            </div>

            {/* 메인 컨텐츠 */}
            <div className="mypage-profile-content">
                {/* <h1>마이페이지</h1> */}

                {/* 🔥 탭 버튼 추가 */}
                <div className="tab-container">
                    <button
                        className={`tab-button ${
                            activeTab === 0 ? "active" : ""
                        }`}
                        onClick={() => setActiveTab(0)}
                    >
                        📊 발음 학습 기록
                    </button>
                    <button
                        className={`tab-button ${
                            activeTab === 1 ? "active" : ""
                        }`}
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
