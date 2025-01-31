import { useState, useEffect } from 'react';
import './CookingGame.css';
import backgroundImage from '../../assets/images/CookingGame_Bg.png';
import foodName from '../../assets/images/strawberryCake.png';
import RecordButton from '../../components/button/RecordButton';
import PausePopup from '../../components/popup/PausePopup';

// 음식 이미지 설정
import strawberry from '../../assets/images/strawberry.png';
import salt from '../../assets/images/strawberry.png';
import fries from '../../assets/images/strawberry.png';
import milk from '../../assets/images/strawberry.png';
import cakeBread from '../../assets/images/strawberry.png';
import sausage from '../../assets/images/strawberry.png';

// 음식 리스트 (객체)
const foodItems = {
  '딸기': strawberry,
  '소금': salt,
  '감자튀김': fries,
  '우유': milk,
  '케이크 빵': cakeBread,
  '소시지': sausage
};

// ✅ 정답 조합 (백엔드 API 대신 테스트용으로 사용)
const correctCombination = ['딸기', '케이크 빵'];

const CookingGame = () => {
  const [selectedItems, setSelectedItems] = useState([]); // 선택된 재료
  const [isCorrect, setIsCorrect] = useState(false); // 정답 여부

  // ✅ 재료 선택 핸들러: 한 번 더 클릭하면 해제되도록 설정
  const handleSelectItem = (item) => {
    setSelectedItems((prevItems) => {
      if (prevItems.includes(item)) {
        return prevItems.filter((i) => i !== item);
      } else if (prevItems.length < 2) {
        return [...prevItems, item];
      }
      return prevItems;
    });
  };

  // ✅ 정답 체크 로직 (재료 2개 선택 후 확인)
  useEffect(() => {
    if (selectedItems.length === 2) {
      const sortedSelected = [...selectedItems].sort().join(',');
      const sortedCorrect = [...correctCombination].sort().join(',');

      setIsCorrect(sortedSelected === sortedCorrect);
    } else {
      setIsCorrect(false);
    }
  }, [selectedItems]);

  const item1 = selectedItems[0] ? foodItems[selectedItems[0]] : null;
  const item2 = selectedItems[1] ? foodItems[selectedItems[1]] : null;

  return (
    <div className="cooking-game-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="game-overlay">
        {/* ✅ 일시 정지 버튼 대신 PausePopup 컴포넌트 사용 */}
        <PausePopup />

        {/* 조합 UI */}
        <h2 className="game-title">딸기 케이크</h2>
        <div className="combination">
          {item1 ? <img src={item1} alt="재료 1" className="item-icon" /> : <div className="item-placeholder"></div>}
          <span className="plus-sign">+</span>
          {item2 ? <img src={item2} alt="재료 2" className="item-icon" /> : <div className="item-placeholder"></div>}
          <span className="equals-sign">=</span>
          <img src={foodName} alt="결과" className="item-icon" />
        </div>

        {/* ✅ 정답 메시지 표시 */}
        {isCorrect && <p className="correct-message">🎉 정답입니다! 🎉</p>}

        {/* 재료 선택 */}
        <div className="item-selection">
          {Object.keys(foodItems).map((item, index) => (
            <button
              key={index}
              onClick={() => handleSelectItem(item)}
              className={selectedItems.includes(item) ? 'selected' : ''}
            >
              {item}
            </button>
          ))}
        </div>

        {/* 마이크 버튼 (RecordButton으로 대체) */}
        <RecordButton />
      </div>
    </div>
  );
};

export default CookingGame;
