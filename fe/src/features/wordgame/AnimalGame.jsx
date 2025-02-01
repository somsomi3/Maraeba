import { useNavigate, useParams } from 'react-router-dom';
import './AnimalGame.css';
import forestImage from '../../assets/background/forestImage.webp';
import HomeButton from '../../components/button/HomeButton';
import RecordButton from '../../components/button/RecordButton';
import PausePopup from '../../components/popup/PausePopup';

// 동물 리스트
const animals = [
  { id: 1, name: '원숭이', icon: '📖' },
  { id: 2, name: '사자', icon: '☂️' },
  { id: 3, name: '새', icon: '🏠' },
  { id: 4, name: '판다', icon: '🛒' },
  { id: 5, name: '너구리', icon: '🖊' },
  { id: 6, name: '토끼', icon: '✈️' }
];

const AnimalGame = () => {
  const navigate = useNavigate();
  const { themeName } = useParams(); // URL의 테마 이름 가져오기

  return (
    <div className="animal-game-container">
      {/* ✅ 홈 버튼 (컴포넌트 사용) */}
      <HomeButton onClick={() => navigate('/main')} />

      {/* ✅ 일시 정지 팝업 (컴포넌트 사용) */}
      <PausePopup />

      {/* 동물 게임 화면 */}
      <div className="game-content">
        {/* 배경 이미지 */}
        <div className="image-container">
          <img src={forestImage} alt="숲 배경" className="game-image" />
        </div>

        {/* 동물 목록 */}
        <div className="animal-list">
          <h3>어떤 동물이 있을까?</h3>
          <ul>
            {animals.map((animal) => (
              <li key={animal.id}>
                <span className="animal-icon">{animal.icon}</span>
                <span className="animal-name">{animal.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ✅ 마이크 버튼 (컴포넌트 사용) */}
      <RecordButton />
    </div>
  );
};

export default AnimalGame;
