import { useNavigate } from 'react-router-dom';
import './PronsThird.css';
import GoBackButton from '../../components/button/GoBackButton';

const PronsThird = () => {
  const navigate = useNavigate();

  return (
    <div className="prons-third-container">
        <GoBackButton />
      <div className="image-container">
        <img src="/path/to/lip-shape-image3.jpg" alt="입모양" className="lip-image" />
        <img src="/path/to/mouth-shape-image3.jpg" alt="구강 내부" className="mouth-image" />
      </div>
      <div className="description-container">
        <h2 className="vowel-title">아</h2>
        <p>
          입을 크게 벌리고 자연스럽게 소리를 내요. 발음이 어려울 경우, 거울을 보며 입이 충분히 벌어지는지 확인해보세요!
        </p>
      </div>
      <button className="next-button" onClick={() => navigate('/third-prac')}>다음으로</button>
    </div>
  );
};

export default PronsThird;
