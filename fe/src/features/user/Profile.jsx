import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/authSlice"; // ✅ Redux logout 액션 추가
import { springApi } from "../../utils/api";
import HomeButton from "../../components/button/HomeButton";
import { useNavigate } from "react-router-dom"; // ✅ 로그인 페이지 리디렉션
import pororo from "../../assets/images/pororo.png"
import PronunciationHistoryChart from "./PronunciationHistoryChart";
import "./Profile.css";

const Profile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const token = useSelector((state) => state.auth.token); // ✅ Redux에서 토큰 가져오기
    const [username, setUsername] = useState("사용자");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (!token) {
                console.warn("❌ 토큰이 없습니다. 로그인 페이지로 이동");
                navigate("/login");
                return;
            }

            try {
                const response = await springApi.get("/users/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsername(response.data.username);
            } catch (error) {
                console.error("❌ 사용자 정보를 불러오는 중 오류 발생:", error);

                if (error.response?.status === 401) {
                    console.warn("⏳ 토큰이 만료됨. 로그아웃 처리 후 로그인 페이지로 이동");
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
    }, [token, dispatch, navigate]); // ✅ token이 변경될 때마다 실행

    return (
        <div className="profile-container">
            {/* 사이드바 */}
            <div className="sidebar">
                <div className="profile-header">
                    <img
                        src={pororo}
                        alt="프로필"
                        className="profile-avatar"
                    />
                    <h2 className="childname">
                        {loading ? "로딩 중..." : error ? "오류 발생" : username}
                    </h2>
                </div>
                <nav className="profile-menu">
                    <ul>
                        <li className="active">내 프로필</li>
                        <li onClick={() => navigate("/profile-info")}>회원정보 수정</li>
                        <li>도움말</li>
                    </ul>
                </nav>
            </div>

            {/* 메인 컨텐츠 */}
            <div className="profile-content">
                <div className="level-container">
                    <h1>마이페이지</h1>
                    {/* <div className="progress-bar">
                        <div className="progress" style={{ width: "30%" }}></div>
                        <span className="progress-text">다음 레벨까지 70%</span>
                    </div> */}
                </div>

                {/* <div className="profile-stats">
                    <div className="stat-box red">
                        <div className="stat-icon">🎁</div>
                        <p>모은 보물</p>
                        <h2>0개</h2>
                    </div>
                    <div className="stat-box blue">
                        <div className="stat-icon">📅</div>
                        <p>우리가 친구가 된 날</p>
                        <h2>0일</h2>
                    </div>
                    <div className="stat-box green">
                        <div className="stat-icon">⏳</div>
                        <p>즐겁게 놀았던 시간</p>
                        <h2>0시간 0분</h2>
                    </div>
                </div> */}

                <h2>📊 발음 학습 기록</h2>
                <PronunciationHistoryChart />

                {/* <h2>받은 칭찬 ✨</h2>
                <div className="badges-list">
                    <div className="badge-item glow">
                        <img src="/assets/badge1.png" alt="탐험가 배지" />
                        <div className="badge-tooltip">첫 발견! 🗺️</div>
                    </div>
                    <div className="badge-item glow">
                        <img src="/assets/badge2.png" alt="모험가 배지" />
                        <div className="badge-tooltip">10번 도전! 🚀</div>
                    </div>
                    <div className="badge-item glow">
                        <img src="/assets/badge3.png" alt="독서왕 배지" />
                        <div className="badge-tooltip">책 50권 읽음! 📚</div>
                    </div>
                    <div className="badge-item glow">
                        <img src="/assets/badge4.png" alt="꾸준함 배지" />
                        <div className="badge-tooltip">30일 연속 학습! 💪</div>
                    </div>
                </div> */}
            </div>

            
            <HomeButton />
        </div>
    );
};

export default Profile;
