import { useNavigate } from 'react-router-dom';
import './FirstPrac.css';

const FirstPrac = () => {
  const navigate = useNavigate();

  return (
    <div className="first-prac-container">
      <button className="back-button" onClick={() => navigate('/prons-first')}>
        ↩
      </button>
      <div className="content-container">
        <div className="image-section">
          <img src="/path/to/lip-shape-image.jpg" alt="발음 입모양" className="image-top" />
          <img src="/path/to/tongue-position-image.jpg" alt="혀 위치" className="image-bottom" />
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
