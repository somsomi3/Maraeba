import { useNavigate } from 'react-router-dom';
import './SingleMain.css';
import HomeButton from '../../components/button/HomeButton';
import backgroundImage from '../../assets/images/singlepage.png'; // 🔥 배경 이미지 추가
import cloud from '../../assets/images/cloud.png'


const SingleMain = () => {
  const navigate = useNavigate();

  return (
    <div className="main-container">
      <HomeButton />

      {/* 🔥 배경 이미지 추가 */}
      <img src={backgroundImage} alt="Background" className="background-image" />
      <img src={cloud} alt="Cloud1" className="cloud cloud-1" />
      <img src={cloud} alt="Cloud2" className="cloud cloud-2" />
      <img src={cloud} alt="Cloud3" className="cloud cloud-3" />
      <img src={cloud} alt="Cloud4" className="cloud cloud-4" />
     
      <h1 className="main-title"></h1>
      <div className="cards-container">
        <div className="single-card" onClick={() => navigate('/prons')}>
          <h2 className="card-title">발음 익히기</h2>
          <p className="card-description">자음, 모음과 같은 발음을 공부해보고 입으로 직접 소리내어 말해봐요.</p>
        </div>
        <div className="single-card" onClick={() => navigate('/wgame')}>
          <h2 className="card-title">단어와 친해지기</h2>
          <p className="card-description">간단한 단어들을 직접 소리내어 읽어봐요.</p>
        </div>
        <div className="single-card" onClick={() => navigate('/conversation')}>
          <h2 className="card-title">이야기 나누기</h2>
          <p className="card-description">일상 대화를 통해 다양한 문장을 소리내어 읽어봐요.</p>
        </div>
      </div>
    </div>
  );
};

export default SingleMain;
