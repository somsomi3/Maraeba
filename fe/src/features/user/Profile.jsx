import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/authSlice"; // ✅ Redux logout 액션 추가
import { springApi, logoutApi } from "../../utils/api";
import HomeButton from "../../components/button/HomeButton";
import { useNavigate } from "react-router-dom"; // ✅ 로그인 페이지 리디렉션
import pororo from "../../assets/images/pororo.png"
import PronunciationHistoryChart from "./PronunciationHistoryChart";
import PronunciationDetailChart from "./PronunciationDetailChart";
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

    const handleLogout = async () => {
        try {
            await logoutApi(); // 로그아웃 API 호출
            dispatch(logout()); // Redux에서 사용자 정보 삭제
            navigate("/login"); // 로그인 페이지로 이동
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
                {/* <div className="profile-header">
                    <img
                        src={pororo}
                        alt="프로필"
                        className="profile-avatar"
                    />
                    <h2 className="childname">
                        {loading ? "로딩 중..." : error ? "오류 발생" : username}
                    </h2>
                </div> */}
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

                {/* ✅ 발음 학습 기록 */}
                <h2>📊 발음 학습 기록</h2>
                <PronunciationHistoryChart />

                {/* ✅ 클래스별 발음 학습 통계 (제대로 배치) */}
                <h2>📈 클래스별 발음 학습 통계</h2>
                <PronunciationDetailChart />
            </div>

            <HomeButton />
        </div>
    );
};

export default Profile;
