import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { springApi } from "../../utils/api"; // ✅ springApi 추가
import "./index.css";

const FindId = () => {
  const navigate = useNavigate(); // 페이지 이동
  const [email, setEmail] = useState(""); // 입력한 이메일 저장
  const [userIds, setUserIds] = useState([]); // 🔹 찾은 아이디 리스트
  const [errorMessage, setErrorMessage] = useState(""); // 🔹 에러 메시지 저장

  // 🔍 아이디 찾기 요청
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUserIds([]);
    setErrorMessage("");
    
    try {
        const response = await springApi.post(
            "/auth/find-id",
            { email },
        );

        if (response.status === 200) {
            
            setUserIds(response.data.user_ids);
        }
    } catch (error) {
        console.error("❌ 아이디 찾기 실패:", error);
        if (error.response?.status === 404) {
            setErrorMessage("해당 이메일로 등록된 아이디가 없습니다.");
        } else {
            setErrorMessage("아이디 찾기 요청 중 오류가 발생했습니다.");
        }
    }
};

  return (
    <div className="form-container">
      <h2>아이디 찾기</h2>
      <form onSubmit={handleSubmit}>
        <div className="login-input-group">
          <input
            className="login-input"
            type="email"
            id="email"
            name="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button className="auth-button" type="submit">
          아이디 찾기
        </button>
      </form>

      {/* 🔹 결과 출력 */}
      {userIds.length > 0 && (
        <div className="result-box">
          <h3>🔎 찾은 아이디</h3>
          <ul>
            {userIds.map((user, index) => (
                <li key={index}>
                <strong>{user.user_id}</strong> 
                {user.created_at && ` - 생성 날짜 : ${new Date(user.created_at).toLocaleDateString("ko-KR")}`}
                </li>
            ))}
            </ul>

        </div>
      )}

      {/* ❌ 에러 메시지 출력 */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <button className="secondary-button" onClick={() => navigate("/")}>
        로그인으로 돌아가기
      </button>
    </div>
  );
};

export default FindId;
