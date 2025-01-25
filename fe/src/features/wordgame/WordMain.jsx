import { useNavigate } from 'react-router-dom';
import './WordMain.css';

const WordMain = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 React Router 훅

  return (
    <div className="word-main-container">
      <button className="home-button" onClick={() => navigate('/single')}>
      ↩
      </button>
      <h1>단어와 친해지기</h1>
      <p>요리, 동물 게임 고르는 페이지</p>
    </div>
  );
};

export default WordMain;
