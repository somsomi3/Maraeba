import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { springApi } from '../../utils/api';
import './index.css'; // 기존 CSS 유지

const Register = () => {
  const [formData, setFormData] = useState({
    user_id: '',
    password: '',
    confirmPassword: '',
    email: '',
    username: '',
  });
  const [isUserIdChecked, setIsUserIdChecked] = useState(false);


  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (name === 'user_id') setIsUserIdChecked(false);
  };

  const checkUserId = () => {
    if (!formData.user_id) {
      alert('아이디를 입력해주세요.');
      return;
    }
    springApi.get(`/auth/check-user-id?userId=${encodeURIComponent(formData.user_id)}`)
      .then((response) => {
        alert(response.data.message || '사용 가능한 아이디입니다.');
        setIsUserIdChecked(true);
      })
      .catch((error) => {
        alert(error.response?.data.message || '사용할 수 없는 아이디입니다.');
      });
  };

//   const checkEmail = () => {
//     if (!formData.email) {
//       alert('이메일을 입력해주세요.');
//       return;
//     }
//     springApi.get(`/auth/check-email?email=${encodeURIComponent(formData.email)}`)
//       .then((response) => {
//         alert(response.data.message || '사용 가능한 이메일입니다.');
//         setIsEmailChecked(true);
//       })
//       .catch((error) => {
//         alert(error.response?.data.message || '사용할 수 없는 이메일입니다.');
//       });
//   };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.user_id || !formData.password || !formData.confirmPassword || !formData.username) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    if (!isUserIdChecked) {
      alert('아이디 중복 검사를 완료해주세요.');
      return;
    }

    springApi.post('/auth/register', formData)
      .then((response) => {
        alert(response.data.message);
        navigate('/');
      })
      .catch((error) => {
        alert(error.response?.data.message);
      });
  };

  return (
    <div className="form-container">
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group inline-group">
          <input
            className="input"
            type="text"
            name="user_id"
            placeholder="로그인 ID"
            value={formData.user_id}
            onChange={handleChange}
            required
          />
          <button type="button" className="small-button" onClick={checkUserId}>아이디 중복검사</button>
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
        <div className="input-group">
          <input
            className="input"
            type="password"
            name="confirmPassword"
            placeholder="비밀번호 확인"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group inline-group">
          <input
            className="input"
            type="email"
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
            name="username"
            placeholder="자녀 이름"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <button className="auth-button" type="submit">회원가입</button>
      </form>
      <button className="secondary-button" onClick={() => navigate('/')}>로그인</button>
    </div>
  );
};

export default Register;
