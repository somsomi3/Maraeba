import { useNavigate } from 'react-router-dom';
import './PronsThird.css';

const PronsThird = () => { 
  const navigate = useNavigate();

  return (
    <div className="prons-third-container">
    <button className="home-button" onClick={() => navigate('/prons')}>
        ↩
      </button>
      <h2>Prons Third Page</h2>
      <p>이중 모음 2에 대한 발음을 학습하세요!</p>
      <button className="next-button">다음으로</button>
    </div>
  );
};

export default PronsThird;
