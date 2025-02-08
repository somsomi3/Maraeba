import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { springApi } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/authSlice"; 
import HomeButton from "../../components/button/HomeButton";
import pororo from "../../assets/images/pororo.png"; 
import "./ProfileInfo.css"; // ✅ 기존 CSS 유지

const ProfileInfo = () => {
    const token = useSelector((state) => state.auth.token);
    const [userInfo, setUserInfo] = useState({ username: "", email: "" });
    const [newUsername, setNewUsername] = useState("");  
    const [newEmail, setNewEmail] = useState("");  
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (!token) {
                console.warn("❌ 토큰 없음. 로그인 페이지 이동");
                navigate("/login");
                return;
            }

            try {
                const response = await springApi.get("/users/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserInfo(response.data);
                setNewUsername(response.data.username);  
                setNewEmail(response.data.email);
            } catch (error) {
                console.error("❌ 사용자 정보 조회 실패:", error);
                if (error.response?.status === 401) {
                    console.warn("⏳ 토큰 만료됨. 로그아웃 후 이동");
                    dispatch(logout());
                    navigate("/login");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, [token, dispatch, navigate]);

    // ✅ 닉네임 변경 요청
    const handleUpdateUsername = async () => {
        if (!newUsername.trim()) return alert("이름을 입력하세요!");

        try {
            await springApi.patch("/users/me", { username: newUsername }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("✅ 닉네임이 변경되었습니다!");
            setUserInfo((prev) => ({ ...prev, username: newUsername }));
        } catch (error) {
            console.error("❌ 닉네임 변경 실패:", error);
            alert("닉네임 변경 중 오류 발생");
        }
    };

    // ✅ 이메일 변경 요청
    const handleUpdateEmail = async () => {
        if (!newEmail.trim()) return alert("이메일을 입력하세요!");

        try {
            await springApi.patch("/users/me", { email: newEmail }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("✅ 이메일이 변경되었습니다!");
            setUserInfo((prev) => ({ ...prev, email: newEmail }));
        } catch (error) {
            console.error("❌ 이메일 변경 실패:", error);
            alert("이메일 변경 중 오류 발생");
        }
    };

    // ✅ 비밀번호 변경 페이지로 이동
    const handleChangePassword = () => {
        navigate("/change-password");
    };

    // ✅ 회원 탈퇴 요청
    const handleDeleteAccount = async () => {
        if (!window.confirm("정말 회원 탈퇴를 진행하시겠습니까? 🥲")) return;

        try {
            await springApi.delete("/users/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            dispatch(logout());
            alert("✅ 회원 탈퇴가 완료되었습니다.");
            navigate("/login");
        } catch (error) {
            console.error("❌ 회원 탈퇴 실패:", error);
            alert("회원 탈퇴 중 오류 발생");
        }
    };

    return (
        <div className="profile-container">
            {/* ✅ 사이드바 추가 (Profile.jsx랑 동일) */}
            <div className="sidebar">
                <div className="profile-header">
                    <img src={pororo} alt="프로필" className="profile-avatar" />
                    <h2>{loading ? "로딩 중..." : userInfo.username}</h2>
                </div>
                <nav className="profile-menu">
                    <ul>
                        <li onClick={() => navigate("/profile")}>내 프로필</li>
                        <li className="active">회원정보 수정</li>
                        <li>도움말</li>
                    </ul>
                </nav>
            </div>

            {/* ✅ 메인 컨텐츠 */}
            <div className="profile-content">
                <h2>회원정보 수정</h2>
                {loading ? <p>로딩 중...</p> : (
                    <>
                        <div className="info-box">
                            <label>아이 이름</label>
                            <input 
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                            />
                            <button className="profile-button" onClick={handleUpdateUsername} >이름 변경</button>
                        </div>

                        <div className="info-box">
                            <label>이메일</label>
                            <input 
                                type="email" 
                                value={newEmail} 
                                onChange={(e) => setNewEmail(e.target.value)}
                            />
                            <button className="profile-button" onClick={handleUpdateEmail} >이메일 변경</button>
                        </div>

                        <button className="change-password-btn" onClick={handleChangePassword}>
                            비밀번호 변경
                        </button>

                        <button className="delete-account-btn" onClick={handleDeleteAccount}>
                            회원 탈퇴
                        </button>
                    </>
                )}
            </div>
            <HomeButton />
        </div>
    );
};

export default ProfileInfo;
