import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { springApi } from '../../utils/api';
import './PronsFirst.css';
import GoBackButton from '../../components/button/GoBackButton';
import PausePopup from '../../components/popup/PausePopup';
import lipshape from '../../assets/images/lipshape.png';
import tongue from '../../assets/images/tongue.png';

const PronsFirst = () => {
  const navigate = useNavigate();
  const { class_id, seq_id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPronunciationData = async () => {
      try {
        console.log(`📡 데이터 요청: /prons/class/${class_id}/seq/${seq_id}`);
        const response = await springApi.get(`/prons/class/${class_id}/seq/${seq_id}`);
        console.log("API 응답:", response.data);

        setData(response.data.data || {}); // 객체이므로 data.data로 가져옴옴
        setError(false);
      } catch (error) {
        console.error('데이터 불러오기 실패:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPronunciationData();
  }, [class_id, seq_id]);

  const handleExit = () => {
    navigate("/prons");
  };

  // 다음 연습 화면으로 이동
  const goToPractice = () => {
    navigate(`/prons/class/${class_id}/seq/${seq_id}/prac`);
  };

  return (
    <div className="prons-first-container">
      <GoBackButton />
      <PausePopup onExit={handleExit} />
      {/* 데이터 로딩 중 표시 */}
      {loading ? (
        <div className="loading-container">🔄 데이터 로딩 중...</div>
      ) : (
        <>
          <div className="image-container">
            <img src={lipshape} alt="입모양" className="lip-image" />
            <img src={tongue} alt="구강 내부" className="mouth-image" />
          </div>
          
          <div className="description-container">
            <h2 className="vowel-title">{data?.pronunciation || '발음 학습'}</h2>
            <p>{error ? '데이터를 불러오는 중 오류가 발생했습니다.' : data?.description}</p>
          </div>

          <button 
            className="next-button" 
            onClick={goToPractice} 
            disabled={loading || error}
          >
            다음으로
          </button>
        </>
      )}
    </div>
  );
};

export default PronsFirst;
