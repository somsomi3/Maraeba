import { useState } from 'react';
import './CookingGame.css';
import backgroundImage from '../../assets/images/CookingGame_Bg.png';
import pauseIcon from '../../assets/images/pause.png';
import micIcon from '../../assets/images/mic.png';
import ingredient1 from '../../assets/images/ingredient1.png';
import ingredient2 from '../../assets/images/ingredient2.png';
import resultCake from '../../assets/images/cake.png';

const CookingGame = () => {
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  // 재료 선택 핸들러
  const handleSelectIngredient = (ingredient) => {
    if (selectedIngredients.length < 2) {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  return (
    <div className="cooking-game-container">
      {/* 게임 화면 */}
      <div className="game-overlay">
        <button className="pause-button">
          <img src={pauseIcon} alt="일시 정지" />
        </button>

        {/* 조합 UI */}
        <h2 className="game-title">딸기 케이크</h2>
        <div className="combination">
          <img src={ingredient1} alt="재료 1" className="ingredient-icon" />
          <span className="plus-sign">+</span>
          <img src={ingredient2} alt="재료 2" className="ingredient-icon" />
          <span className="equals-sign">=</span>
          <img src={resultCake} alt="결과" className="ingredient-icon" />
        </div>

        {/* 재료 선택 */}
        <div className="ingredient-selection">
          <button onClick={() => handleSelectIngredient('딸기')}>딸기</button>
          <button onClick={() => handleSelectIngredient('소금')}>소금</button>
          <button onClick={() => handleSelectIngredient('감자튀김')}>감자튀김</button>
          <button onClick={() => handleSelectIngredient('우유')}>우유</button>
          <button onClick={() => handleSelectIngredient('케이크 빵')}>케이크 빵</button>
          <button onClick={() => handleSelectIngredient('소시지')}>소시지</button>
        </div>

        {/* 마이크 버튼 */}
        <button className="mic-button">
          <img src={micIcon} alt="음성 입력" />
        </button>
      </div>
    </div>
  );
};

export default CookingGame;
