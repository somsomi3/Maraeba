import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { springApi, logoutApi } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/authSlice";
import HomeButton from "../../components/button/HomeButton";
import "./Profile.css";
import backgroundImage from "../../assets/background/mypage_Bg.webp";
import defaultProfile from "../../assets/profiles/profile1.png";

const ChangePassword = () => {
    const token = useSelector((state) => state.auth.token);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [profileImage, setProfileImage] = useState(() => {
        return localStorage.getItem("profileImage") || defaultProfile;
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await springApi.get("/users/me");
                setUsername(response.data.username); // ✅ username 저장
                if (response.data.provider !== "LOCAL") {
                    alert("소셜 로그인 사용자는 비밀번호 변경이 불가능합니다.");
                    navigate("/profile");
                }
            } catch (error) {
                console.error("❌ 사용자 정보 불러오기 실패:", error);
            }
        };

        fetchUserData();
    }, [navigate]);

    // ✅ 비밀번호 변경 요청
    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            alert("❌ 새 비밀번호가 일치하지 않습니다!");
            return;
        }

        try {
            setLoading(true);
            await springApi.put("/users/me/password", {
                current_password: currentPassword,
                new_password: newPassword,
            });

            alert(
                "✅ 비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요."
            );
            dispatch(logout()); // ✅ 로그아웃 처리
            navigate("/login"); // ✅ 로그인 페이지 이동
        } catch (error) {
            alert("비밀번호 변경 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logoutApi();
            dispatch(logout());
            navigate("/login");
            alert("로그아웃 되었습니다.");
        } catch (error) {
            alert("로그아웃에 실패했습니다.");
        }
    };

    return (
        <div
            className="profile-container"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            {/* ✅ 사이드바 추가 */}
            <div className="sidebar">
                <div className="profile-header">
                    <img
                        src={profileImage}
                        alt="프로필 이미지"
                        className="my-profile-image"
                    />
                </div>
                <h2>{username}</h2>
                <nav className="profile-menu">
                    <ul>
                        <li onClick={() => navigate("/profile")}>내 프로필</li>
                        <li onClick={() => navigate("/profile-info")}>
                            회원정보 수정
                        </li>
                        <li className="active">비밀번호 변경</li>
                        <li onClick={handleLogout}>로그아웃</li>
                        <li onClick={() => navigate("/profile-delete")}>
                            회원 탈퇴
                        </li>
                    </ul>
                </nav>
            </div>

            {/* ✅ 메인 컨텐츠 */}
            <div className="profile-content">
                <h2>비밀번호 변경</h2>
                <form onSubmit={handleChangePassword}>
                    <div className="pw-info-box">
                        <label>현재 비밀번호</label>
                        <input
                            type="password"
                            className="pw-input"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="pw-info-box">
                        <label>새 비밀번호</label>
                        <input
                            type="password"
                            className="pw-input"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="pw-info-box">
                        <label>새 비밀번호 확인</label>
                        <input
                            type="password"
                            className="pw-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        className="pw-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "변경 중..." : "비밀번호 변경"}
                    </button>
                </form>
                <HomeButton />
            </div>
        </div>
    );
};

export default ChangePassword;
