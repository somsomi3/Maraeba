import { useNavigate } from 'react-router-dom';
import './PronsMain.css';
import pronstitle from '../../assets/images/pronstitle.png'

const PronsMain = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 React Router 훅

  return (
    <div className="prons-container">
      <button className="home-button" onClick={() => navigate('/single')}>
        ↩
      </button>
      <h1 className="stage-one-title">발음 익히기</h1>

      <img src={pronstitle} alt="Pronunciation Title" className="pronstitle-image" />

      <div className="card-slider">
        <div className="card">
          <h2>단모음</h2>
          <p>ㅏ, ㅓ, ㅗ, ㅜ, ㅡ, ㅣ</p>
          <p>발음의 입모양을 익혀보고 소리내어 읽어봐요!</p>
          <button className="start-button" onClick={() => navigate('/prons-first')}>
            시작하기
          </button>
        </div>
        <div className="card">
          <h2>이중모음 1</h2>
          <p>발음의 입모양을 익혀보고 소리내어 읽어봐요!</p>
          <p>ㅑ, ㅕ, ㅛ, ㅠ, ㅐ, ㅔ</p>
          <button className="start-button" onClick={() => navigate('/prons-second')}>
            시작하기
          </button>
        </div>
        <div className="card">
          <h2>이중모음 2</h2>
          <p>발음의 입모양을 익혀보고 소리내어 읽어봐요!</p>
          <p>ㅒ, ㅖ, ㅘ, ㅙ, ㅚ</p>
          <button className="start-button" onClick={() => navigate('/prons-third')}>
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PronsMain;
