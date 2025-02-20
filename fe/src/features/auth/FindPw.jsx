import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { springApi } from "../../utils/api"; // API 요청을 위한 springApi
import logo from "../../assets/logo.png"
import "./index.css";

const FindPw = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false); 
  const [message, setMessage] = useState(""); 
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(""); 
    setErrorMessage("");

    try {
        const response = await springApi.post(
            "/auth/forgot-password", 
            { user_id: userId, email },
            { headers: { Authorization: "" } } 
        );
        if (response.status === 200) {
            setMessage("✅ 임시 비밀번호가 이메일로 전송되었습니다.");
        }
    } catch (error) {
        console.error("❌ 비밀번호 찾기 실패:", error);
        if (error.response?.status === 404) {
            setErrorMessage("❌ 아이디 또는 이메일이 일치하지 않습니다.");
        } else {
            setErrorMessage("❌ 비밀번호 찾기 요청 중 오류가 발생했습니다.");
        }
    } finally {
        setLoading(false);
    }
};


  return (
    <div className="findid-form-container">
         <img src={logo} alt="logo" className="register-logo"/>
      <h2>비밀번호 찾기</h2>
      <form onSubmit={handleSubmit}>
        <div className="login-input-group">
          <input
            className="login-input"
            type="text"
            id="user_id"
            name="user_id"
            placeholder="아이디"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </div>
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
        <button className="auth-button" type="submit" disabled={loading}>
          {loading ? "🔄 요청 중..." : "비밀번호 찾기"}
        </button>
      </form>


      {message && <p className="success-message">{message}</p>}

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <button className="secondary-button" onClick={() => navigate("/login")}>
        돌아가기
      </button>
    </div>
  );
};

export default FindPw;
