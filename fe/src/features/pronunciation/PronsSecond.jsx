import { useNavigate } from 'react-router-dom';
import './PronsSecond.css';

const PronsSecond = () => {
  const navigate = useNavigate();
  
  return (
    <div className="prons-second-container">
      <button className="home-button" onClick={() => navigate('/prons')}>
        ↩
      </button>
      <h2>Prons Second Page</h2>
      <p>이중 모음 1에 대한 발음을 학습하세요!</p>
      <button className="next-button">다음으로</button>
    </div>
  );
};

export default PronsSecond;
