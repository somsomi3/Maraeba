import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { springApi } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/authSlice";
import HomeButton from "../../components/button/HomeButton";
import ProfileImageSelector from "./ProfileImageSelector";
import bear from "../../assets/profiles/profile1.png";
import backgroundImage from "../../assets/background/mypage_Bg.webp";
import "./Profile.css";

const ProfileDelete = () => {
    const token = useSelector((state) => state.auth.token);
    const isKakaoUser = useSelector((state) => state.auth.isKakaoUser); // ✅ 카카오 로그인 여부 확인
    const [password, setPassword] = useState("");
    const [kakaoToken, setKakaoToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("사용자");
    const [provider, setProvider] = useState("LOCAL");
    const [selectedProfile, setSelectedProfile] = useState(() => {
        return localStorage.getItem("profileImage") || bear;
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await springApi.get("/users/me");
                setUsername(response.data.username);
                setProvider(response.data.provider);
                if (response.data.provider !== "LOCAL") {
                    alert("소셜 로그인 사용자는 회원 탈퇴가 불가능합니다.");
                    navigate("/profile");
                }
            } catch (error) {
                console.error("❌ 사용자 정보 불러오기 실패:", error);
            }
        };

        fetchUserData();
    }, [navigate]);

    // ✅ 회원 탈퇴 요청
    const handleDeleteAccount = async (e) => {
        e.preventDefault();

        if (!isKakaoUser && !password) {
            alert("❌ 비밀번호를 입력해주세요!");
            return;
        }

        if (isKakaoUser && !kakaoToken) {
            alert("❌ 카카오 access_token을 입력해주세요!");
            return;
        }

        try {
            setLoading(true);
            const payload = isKakaoUser
                ? { kakao_access_token: kakaoToken }
                : { password };

            await springApi.delete("/users/me", {
                data: payload, // ✅ DELETE 요청에 body 데이터 포함
                headers: { Authorization: `Bearer ${token}` },
            });

            alert("✅ 회원 탈퇴가 완료되었습니다.");
            dispatch(logout()); // ✅ 로그아웃 처리
            navigate("/login"); // ✅ 로그인 페이지 이동
        } catch (error) {
            console.error("❌ 회원 탈퇴 실패:", error);
            alert("회원 탈퇴 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (newProfile) => {
        setSelectedProfile(newProfile);
        localStorage.setItem("profileImage", newProfile);
    };

    const handleLogout = async () => {
        try {
            await springApi.post("/auth/logout");
            dispatch(logout());
            navigate("/login");
            alert("로그아웃 되었습니다.");
        } catch (error) {
            console.error("❌ 로그아웃 실패:", error);
            alert("로그아웃에 실패했습니다.");
        }
    };

    return (
        <div
            className="profile-container"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            {/* 사이드바 */}
            <div className="sidebar">
                <ProfileImageSelector
                    selectedImage={selectedProfile}
                    onSelect={handleProfileChange}
                />
                <h2>{username}</h2>
                <nav className="profile-menu">
                    <ul>
                        <li onClick={() => navigate("/profile")}>내 프로필</li>
                        <li onClick={() => navigate("/profile-info")}>
                            회원정보 수정
                        </li>
                        <li
                            onClick={() =>
                                provider === "LOCAL" &&
                                navigate("/change-password")
                            }
                            className={provider !== "LOCAL" ? "disabled" : ""}
                            style={{
                                color:
                                    provider !== "LOCAL" ? "gray" : "inherit",
                                cursor:
                                    provider !== "LOCAL"
                                        ? "not-allowed"
                                        : "pointer",
                            }}
                        >
                            비밀번호 변경
                        </li>
                        <li onClick={handleLogout}>로그아웃</li>
                        <li
                            onClick={() =>
                                provider === "LOCAL" &&
                                navigate("/profile-delete")
                            }
                            className={provider !== "LOCAL" ? "disabled" : ""}
                            style={{
                                color:
                                    provider !== "LOCAL" ? "gray" : "inherit",
                                cursor:
                                    provider !== "LOCAL"
                                        ? "not-allowed"
                                        : "pointer",
                            }}
                        >
                            회원 탈퇴
                        </li>
                    </ul>
                </nav>
            </div>

            {/* ✅ 메인 컨텐츠 */}
            <div className="profile-content">
                <h2>회원 탈퇴</h2>
                <p>탈퇴 후 계정 복구가 불가능합니다. 신중히 진행해주세요.</p>

                <form onSubmit={handleDeleteAccount}>
                    {!isKakaoUser ? (
                        <div className="info-box">
                            <label>비밀번호 확인</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    ) : (
                        <div className="info-box">
                            <label>카카오 Access Token</label>
                            <input
                                type="text"
                                value={kakaoToken}
                                onChange={(e) => setKakaoToken(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <button
                        className="delete-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "탈퇴 진행 중..." : "회원 탈퇴"}
                    </button>
                </form>
                <HomeButton />
            </div>
        </div>
    );
};

export default ProfileDelete;
