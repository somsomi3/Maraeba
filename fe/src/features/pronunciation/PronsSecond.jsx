import { useNavigate } from 'react-router-dom';
import './PronsSecond.css';
import GoBackButton from '../../components/button/GoBackButton';

const PronsSecond = () => {
  const navigate = useNavigate();

  return (
    <div className="prons-second-container">
        <GoBackButton />
      <div className="image-container">
        <img src="/path/to/lip-shape-image2.jpg" alt="입모양" className="lip-image" />
        <img src="/path/to/mouth-shape-image2.jpg" alt="구강 내부" className="mouth-image" />
      </div>
      <div className="description-container">
        <h2 className="vowel-title">으</h2>
        <p>
          입술을 좌우로 벌리고 소리를 내어요. 발음이 어려울 경우, 입술 양 옆을 손가락으로 잡아 살짝 당겨보며 소리를 내는 것을 연습해 보세요!
        </p>
      </div>
      <button className="next-button" onClick={() => navigate('/second-prac')}>다음으로</button>
    </div>
  );
};

export default PronsSecond;
