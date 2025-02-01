import { useNavigate } from 'react-router-dom';
import './AnimalGameTheme.css';
import forestImage from '../../assets/background/forestImage.webp';
import prairieImage from '../../assets/background/prairieImage.webp';
import oceanImage from '../../assets/background/oceanImage.webp';
import backgroundImage from '../../assets/background/animalGameBg.png';
import homeIcon from '../../assets/icons/home_button.png';
import pauseIcon from '../../assets/icons/pause.png';

const gameThemes = [
  { id: 'forest', name: '숲', image: forestImage },
  { id: 'prairie', name: '초원', image: prairieImage },
  { id: 'ocean', name: '바다', image: oceanImage }
];

const AnimalGameTheme = () => {
  const navigate = useNavigate();

  return (
    <div className="animal-game-theme" style={{ backgroundImage: `url(${backgroundImage})` }}>
      {/* 홈 버튼 */}
      <button className="home-button" onClick={() => navigate('/main')}>
        <img src={homeIcon} alt="홈" />
      </button>

      {/* 일시 정지 버튼 */}
      <button className="pause-button">
        <img src={pauseIcon} alt="일시 정지" />
      </button>

      {/* 게임 테마 카드 목록 */}
      <div className="theme-container">
        {gameThemes.map((theme) => (
          <div key={theme.id} className="theme-card" onClick={() => navigate(`/animal-game/${theme.id}`)}>
            <img src={theme.image} alt={theme.name} className="theme-image" />
            <div className="theme-info">
              <h3>{theme.name}</h3>
              <button className="start-button">시작하기</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


export default AnimalGameTheme;
