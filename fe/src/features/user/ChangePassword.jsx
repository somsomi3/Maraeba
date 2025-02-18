import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { springApi } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/authSlice";
import HomeButton from "../../components/button/HomeButton";
import "./Profile.css";
import backgroundImage from"../../assets/background/mypage_Bg.webp";

const ChangePassword = () => {
    const token = useSelector((state) => state.auth.token);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

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
            console.error("❌ 비밀번호 변경 실패:", error);
            alert("비밀번호 변경 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
            {/* ✅ 사이드바 추가 */}
            <div className="sidebar">
                <div className="profile-header">
                    <h2>비밀번호 변경</h2>
                </div>
                <nav className="profile-menu">
                    <ul>
                        <li onClick={() => navigate("/profile")}>내 프로필</li>
                        <li onClick={() => navigate("/profile-info")}>
                            회원정보 수정
                        </li>
                        <li className="active">비밀번호 변경</li>
                    </ul>
                </nav>
            </div>

            {/* ✅ 메인 컨텐츠 */}
            <div className="profile-content">
                <h2>비밀번호 변경</h2>
                <form onSubmit={handleChangePassword}>
                    <div className="info-box">
                        <label>현재 비밀번호</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="info-box">
                        <label>새 비밀번호</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="info-box">
                        <label>새 비밀번호 확인</label>
                        <input
                            type="password"
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
