import { useNavigate } from 'react-router-dom';
import './SingleMain.css';
import HomeButton from '../../components/button/HomeButton';
// import foximage from '../../assets/images/fox.png';
// import lionimage from '../../assets/images/lion.png';
// import bearimage from '../../assets/images/bear.png';

const SingleMain = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 React Router 훅

  return (
    <div className="main-container">
      <HomeButton />
      {/* <img src={foximage} alt="Fox" className="card-image fox-image" /> */}
      <h1 className="main-title"></h1>
      <div className="cards-container">
        <div className="card" onClick={() => navigate('/prons')}>
          <h2 className="card-title">발음 익히기</h2>
          <p className="card-description">자음, 모음과 같은 발음을 공부해보고 입으로 직접 소리내어 말해봐요.</p>
          
        </div>
        <div className="card" onClick={() => navigate('/wgame')}>
          <h2 className="card-title">단어와 친해지기</h2>
          <p className="card-description">간단한 단어들을 직접 소리내어 읽어봐요.</p>
          {/* <img src={lionimage} alt="Lion" className="card-image lion-image" /> */}
        </div>
        <div className="card" onClick={() => navigate('/conversation')}>
          <h2 className="card-title">이야기 나누기</h2>
          <p className="card-description">일상 대화를 통해 다양한 문장을 소리내어 읽어봐요.</p>
          {/* <img src={bearimage} alt="Bear" className="card-image bear-image" /> */}
        </div>
      </div>
    </div>
  );
};

export default SingleMain;
