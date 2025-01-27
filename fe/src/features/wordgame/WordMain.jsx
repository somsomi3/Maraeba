// fe/src/features/wordgame/WordMain.jsx 
import { useNavigate } from 'react-router-dom';
import './WordMain.css';
import wordtitle from '../../assets/images/wordtitle.png';
import HomeButton from '../../components/button/HomeButton';


const WordMain = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 React Router 훅

  return (
    <div className="word-main-container">
      {/* 홈 버튼 */}
      <button className="home-button" onClick={() => navigate('/single')}>
        ↩
      </button>

      {/* 제목 이미지 */}
      <img src={wordtitle} alt="Wordgame Title" className="wordtitle-image" />

      {/* 게임 카드 섹션 */}
      <div className="game-section">
        {/* 요리를 하자 카드 */}
        <div className="game-card cooking">
          <h2>요리를 하자!</h2>
          <p>
            나는야 요리사! 오늘 열심히 추천받은 요리를 만들어야 하는데...
            <br />
            먼저, 냉장고가 어딨지? 냉장고에서 필요한 재료를 찾아 무사히 요리를 만들도록 하자!
          </p>
          <div className="button-group">
            <button className="guide-button" onClick={() => alert('게임 방법')}>
              게임 방법
            </button>
            <button className="game-start-button" onClick={() => navigate('/cooking-game')}>
              게임 시작
            </button>
          </div>
        </div>

        {/* 동물을 찾자 카드 */}
        <div className="game-card animal">
          <h2>동물을 찾자!</h2>
          <p>
            오늘은 즐거운 쇼핑날! 동물 친구들과 함께 놀기 위해 도시락을 들고 나왔는데...
            <br />
            동물 친구들의 문제를 찾아 함께 즐거운 소풍을 즐기자!
          </p>
          <div className="button-group">
            <button className="guide-button" onClick={() => alert('게임 방법')}>
              게임 방법
            </button>
            <button className="game-start-button" onClick={() => navigate('/animal-game')}>
              게임 시작
            </button>
          </div>
        </div>
        
      </div>
      <HomeButton />
    </div>
    
  );
};

export default WordMain;
