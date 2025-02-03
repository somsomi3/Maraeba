import { useState, useEffect } from "react";
import "./Profile.css";
import { springApi } from "../../utils/api";
import HomeButton from "../../components/button/HomeButton";
import PausePopup from "../../components/popup/PausePopup";

const Profile = () => {
  const [username, setUsername] = useState("사용자"); // 기본값 설정
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 백엔드에서 사용자 정보를 가져오는 함수
  useEffect(() => {
    const fetchUserInfo = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("토큰이 없습니다. 로그인하세요.");
    
            // 토큰이 제대로 들어갔는지 확인하는 로그 추가
            console.log("사용자 토큰:", token);
    
            const response = await springApi.get("/users/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            setUsername(response.data.username);
        } catch (error) {
            console.error("사용자 정보를 불러오는 중 오류 발생:", error);
    
            // 401 (Unauthorized) 발생 시 자동으로 재로그인 처리
            if (error.response && error.response.status === 401) {
                console.warn("토큰이 만료되었거나 인증되지 않음. 로그인 페이지로 이동합니다.");
                localStorage.removeItem("token");
                // window.location.href = "/login"; // 로그인 페이지로 이동
            } else {
                setError("사용자 정보를 불러올 수 없습니다.");
            }
        } finally {
            setLoading(false);
        }
    };
    
      

    fetchUserInfo();
  }, []);

  return (
    <div className="profile-container">
      {/* 사이드바 */}
      <div className="sidebar">
        <div className="profile-header">
          <img src="/assets/profile-avatar.png" alt="프로필" className="profile-avatar" />
          <h2>{loading ? "로딩 중..." : error ? "오류 발생" : username}</h2>
        </div>
        <nav className="profile-menu">
          <ul>
            <li className="active">내 프로필</li>
            <li>설정</li>
            <li>도움말</li>
            <li>앱 소개</li>
          </ul>
        </nav>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="profile-content">
        {/* 레벨 프로그래스 바 */}
        <div className="level-container">
          <h1>레벨 1 🌱</h1>
          <div className="progress-bar">
            <div className="progress" style={{ width: "30%" }}></div>
            <span className="progress-text">다음 레벨까지 70%</span>
          </div>
        </div>

        {/* 통계 박스 */}
        <div className="profile-stats">
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
        </div>

        {/* 관심 분야 */}
        <h2>나의 관심사 📚</h2>
        <div className="interest-list">
          <div className="interest-item">
            <span>사람</span>
            <div className="interest-progress" style={{ width: "45%" }}></div>
          </div>
          <div className="interest-item">
            <span>자연</span>
            <div className="interest-progress" style={{ width: "60%" }}></div>
          </div>
          <div className="interest-item">
            <span>여행</span>
            <div className="interest-progress" style={{ width: "30%" }}></div>
          </div>
          <div className="interest-item">
            <span>과학</span>
            <div className="interest-progress" style={{ width: "75%" }}></div>
          </div>
        </div>

        {/* 배지 */}
        <h2>받은 칭찬 ✨</h2>
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
        </div>
      </div>

      {/* 홈 버튼 & 일시정지 버튼 */}
      <HomeButton />
      <PausePopup />
    </div>
  );
};

export default Profile;
