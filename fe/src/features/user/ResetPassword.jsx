import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { springApi } from "../../utils/api";
import "./Profile.css";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!token) {
            alert("❌ 유효하지 않은 요청입니다.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("❌ 새 비밀번호가 일치하지 않습니다!");
            return;
        }

        try {
            setLoading(true);
            await springApi.patch("/auth/reset-password", {
                token,
                new_password: newPassword,
            });

            alert("✅ 비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.");
            navigate("/login");
        } catch (error) {
            console.error("❌ 비밀번호 재설정 실패:", error);
            alert("비밀번호 재설정 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-container">
            <h2>비밀번호 재설정</h2>
            <form onSubmit={handleResetPassword}>
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

                <button className="pw-button" type="submit" disabled={loading}>
                    {loading ? "변경 중..." : "비밀번호 변경"}
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;
