import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { springApi } from '../../utils/api';
import './index.css'; // 기존 CSS 유지

const Register = () => {
  const [formData, setFormData] = useState({
    user_id: '', // 로그인 ID
    password: '', // 비밀번호
    confirmPassword: '', // 비밀번호 확인
    email: '', // 이메일
    name: '', // 자녀 이름
  });
  const [isUserIdChecked, setIsUserIdChecked] = useState(false); // 아이디 중복 검사 완료 여부

  const navigate = useNavigate(); // 페이지 이동을 위한 React Router 훅

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // 아이디가 변경되면 중복 검사 상태 초기화
    if (name === 'user_id') {
      setIsUserIdChecked(false);
    }
  };

  const checkUserId = () => {
    if (!formData.user_id) {
      alert('아이디를 입력해주세요.');
      return;
    }

    springApi
      .post('/auth/check-user-id', { user_id: formData.user_id })
      .then((response) => {
        alert(response.data.message || '사용 가능한 아이디입니다.');
        setIsUserIdChecked(true);
      })
      .catch((error) => {
        console.error('Error checking user ID:', error);
        if (error.response) {
          alert(error.response.data.message || '사용할 수 없는 아이디입니다.');
        } else {
          alert('서버와 연결할 수 없습니다.');
        }
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 필드 유효성 검사
    if (!formData.user_id || !formData.password || !formData.confirmPassword || !formData.email || !formData.name) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    // 아이디 중복 검사 여부 확인
    if (!isUserIdChecked) {
      alert('아이디 중복 검사를 완료해주세요.');
      return;
    }

    // 서버로 데이터 전송
    springApi
      .post('/auth/register', formData)
      .then((response) => {
        // 성공 시
        alert(response.data.message || '회원가입이 완료되었습니다!');
        navigate('/'); // 로그인 화면으로 이동
      })
      .catch((error) => {
        // 실패 시
        console.error('Error during signup:', error);
        if (error.response) {
          alert(error.response.data.message || '회원가입에 실패했습니다.');
        } else {
          alert('서버와 연결할 수 없습니다.');
        }
      });
  };

  return (
    <div className="form-container">
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            className="input"
            type="text"
            id="user_id"
            name="user_id"
            placeholder="로그인 ID"
            value={formData.user_id}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="button small-button"
            onClick={checkUserId}
          >
            아이디 중복검사
          </button>
        </div>
        <div className="input-group">
          <input
            className="input"
            type="password"
            id="password"
            name="password"
            placeholder="비밀번호"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <input
            className="input"
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="비밀번호 확인"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <input
            className="input"
            type="email"
            id="email"
            name="email"
            placeholder="이메일"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <input
            className="input"
            type="text"
            id="name"
            name="name"
            placeholder="자녀 이름"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <button className="button" type="submit">
          회원가입
        </button>
      </form>
      <button className="secondary-button" onClick={() => navigate('/')}>
        로그인
      </button>
    </div>
  );
};

export default Register;
