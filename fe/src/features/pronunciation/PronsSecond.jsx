
import './PronsSecond.css';
import GoBackButton from '../../components/button/GoBackButton';

const PronsSecond = () => {
  
  return (
    <div className="prons-second-container">
     <GoBackButton />
      <h2>Prons Second Page</h2>
      <p>이중 모음 1에 대한 발음을 학습하세요!</p>
      <button className="next-button">다음으로</button>
    </div>
  );
};

export default PronsSecond;
