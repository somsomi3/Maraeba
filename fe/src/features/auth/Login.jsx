import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../store/authSlice";
import { springApi } from "../../utils/api";
import "./index.css";
import logo from "../../assets/logo.png";

const Login = () => {
  const [formData, setFormData] = useState({ user_id: "", password: "" });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.user_id || !formData.password) {
      alert("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    springApi
      .post("/auth/login", formData)
      .then(({ data: { access_token, refresh_token } }) => {
        // ✅ 구조 분해 할당을 사용하여 access_token과 refresh_token을 직접 할당
        dispatch(login(access_token)); // Redux 상태 업데이트
        localStorage.setItem("token", access_token); // Access 토큰 저장
        localStorage.setItem("refreshToken", refresh_token); // Refresh 토큰 저장

        navigate("/main"); // 로그인 성공 후 이동
      })
      .catch((error) => {
        console.error("Error during login:", error);
        if (error.response) {
          alert(error.response.data.message || "로그인에 실패했습니다.");
        } else {
          alert("서버와 연결할 수 없습니다.");
        }
      });
  };

  return (
    <div className="form-container">
      <img src={logo} alt="마래바 로고" className="logo" />
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            className="input"
            type="text"
            name="user_id"
            placeholder="아이디"
            value={formData.user_id}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <input
            className="input"
            type="password"
            name="password"
            placeholder="비밀번호"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button className="auth-button" type="submit">
          로그인
        </button>
      </form>
      <div className="secondary-button">
        <span onClick={() => navigate("/find-id")}>아이디 찾기</span> |{" "}
        <span onClick={() => navigate("/find-pw")}>비밀번호 찾기</span>
      </div>
      <div>
        <button className="secondary-button" onClick={() => navigate("/register")}>
          회원가입하기
        </button>
      </div>
      {/* /main으로 이동하는 임시 버튼 */}
      <div>
        <button className="secondary-button" onClick={() => navigate("/main")}>
          메인 페이지로 이동
        </button>
      </div>
    </div>
  );
};

export default Login;
