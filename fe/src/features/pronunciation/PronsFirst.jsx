import { useNavigate } from 'react-router-dom';
import './PronsFirst.css';
import GoBackButton from '../../components/button/GoBackButton';

const PronsFirst = () => {
  const navigate = useNavigate();
  
  return (
    <div className="prons-first-container">
        <GoBackButton />
      <div className="image-container">
        <img src="/path/to/lip-shape-image.jpg" alt="입모양" className="lip-image" />
        <img src="/path/to/mouth-shape-image.jpg" alt="구강 내부" className="mouth-image" />
      </div>
      <div className="description-container">
        <h2 className="vowel-title">우</h2>
        <p>
          입술을 둥그렇게 오므려 소리를 내어요. 만약 입술을 오므리기 어렵다면 입술 양 옆의 볼을 손으로 살짝 눌러 앞으로 내밀어보도록 해요!
        </p>
      </div>
      <button className="next-button" onClick={() => navigate('/first-prac')}>다음으로</button>
    </div>
  );
};

export default PronsFirst;
