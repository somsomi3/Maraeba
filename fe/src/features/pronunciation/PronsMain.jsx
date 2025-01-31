import { useNavigate } from 'react-router-dom';
import './PronsMain.css';
import pronstitle from '../../assets/images/pronstitle.png'
import GoBackButton from '../../components/button/GoBackButton';

const PronsMain = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 React Router 훅

  return (
    <div className="prons-container">
      <GoBackButton />

      <img src={pronstitle} alt="Pronunciation Title" className="pronstitle-image" />

      <div className="card-slider">
        <div className="card">
          <h2>단모음</h2>
          <span className="emoji">😃</span>
          <p>ㅏ, ㅓ, ㅗ, ㅜ, ㅡ, ㅣ</p>
          <div className="divider"></div>
          <p>발음의 입모양을 익혀보고 소리내어 읽어봐요!</p>
          <button className="start-button" onClick={() => navigate('/prons/class/1/seq/1')}>
            시작하기
          </button>
        </div>
        <div className="card">
          <h2>이중모음 1</h2>
          <span className="emoji">😗</span>
          <p>ㅑ, ㅕ, ㅛ, ㅠ, ㅐ, ㅔ</p>
          <div className="divider"></div>
          <p>발음의 입모양을 익혀보고 소리내어 읽어봐요!</p>
          <button className="start-button" onClick={() => navigate('/prons/class/2/seq/1')}>
            시작하기
          </button>
        </div>
        <div className="card">
          <h2>이중모음 2</h2>
          <span className="emoji">🤗</span>
          <p>ㅒ, ㅖ, ㅘ, ㅙ, ㅚ</p>
          <div className="divider"></div>
          <p>발음의 입모양을 익혀보고 소리내어 읽어봐요!</p>
          <button className="start-button" onClick={() => navigate('/prons/class/3/seq/1')}>
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PronsMain;