import './PronsSecondPrac.css';
import tongue from "../../assets/images/tongue.png";
import lipshape from "../../assets/images/lipshape.png";
import GoBackButton from '../../components/button/GoBackButton';
import PausePopup from "../../components/popup/PausePopup";
import { useNavigate } from 'react-router-dom';

const PronsSecondPrac = () => {
  const navigate = useNavigate();

  const handleExit = () => {
    navigate('/prons');
  };

  return (
    <div className="second-prac-container">
      <GoBackButton />
      <PausePopup onExit={handleExit} />
      <div className="content-container">
        <div className="image-section">
          <img src={lipshape} alt="발음 입모양" className="image-top" />
          <img src={tongue} alt="혀 위치" className="image-bottom" />
        </div>
        <div className="camera-section">
          <div className="camera-frame">
            <p>아이의 카메라 화면</p>
            <span role="img" aria-label="wave emoji">👋</span>
          </div>
          <div className="accuracy">정확도: 90%</div>
        </div>
      </div>
    </div>
  );
};

export default PronsSecondPrac;
