
import './PronsThird.css';
import GoBackButton from '../../components/button/GoBackButton';
const PronsThird = () => { 
  return (
    <div className="prons-third-container">
    <GoBackButton />
      <h2>Prons Third Page</h2>
      <p>이중 모음 2에 대한 발음을 학습하세요!</p>
      <button className="next-button">다음으로</button>
    </div>
  );
};

export default PronsThird;
