import { useNavigate } from 'react-router-dom';
import './WordMain.css';
import wordtitle from '../../assets/images/wordtitle.png'

const WordMain = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 React Router 훅

  return (
    <div className="word-main-container">
      <button className="home-button" onClick={() => navigate('/single')}>
      ↩
      </button>

      <img src={wordtitle} alt="Wordgame Title" className="wordtitle-image" />
      <p>요리, 동물 게임 고르는 페이지</p>
    </div>
  );
};

export default WordMain;
