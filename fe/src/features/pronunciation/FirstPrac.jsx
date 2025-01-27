import './FirstPrac.css';
import tongue from "../../assets/images/tongue.png"
import lipshape from "../../assets/images/lipshape.png"
import GoBackButton from '../../components/button/GoBackButton';
const FirstPrac = () => {
  return (
    <div className="first-prac-container">
      <GoBackButton />
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
          <div className="accuracy">정확도: 86%</div>
        </div>
      </div>
    </div>
  );
};

export default FirstPrac;
