import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { springApi } from '../../utils/api'; 
import './PronsThird.css';
import GoBackButton from '../../components/button/GoBackButton';

import lipshape from '../../assets/images/lipshape.png';
import tongue from '../../assets/images/tongue.png';

const PronsThird = () => {
  const navigate = useNavigate();
  const { class_id, seq_id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maxSeq, setMaxSeq] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // 특정 순서 학습 자료 가져오기
    const fetchPronunciationData = async () => {
      try {
        const response = await springApi.get(`/prons/class/${class_id}/seq/${seq_id}`);
        setData(response.data);

        // 해당 class의 전체 학습 수 조회
        const classResponse = await springApi.get(`/prons/class/${class_id}`);
        setMaxSeq(classResponse.data.totalSequences);
      } catch (error) {
        console.error('데이터 불러오기 실패:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPronunciationData();
  }, [class_id, seq_id]);

  // 다음 연습 화면으로 이동
  const goToPractice = () => {
    navigate(`/prons/class/${class_id}/seq/${seq_id}/prac`);
  };

  return (
    <div className="prons-third-container">
      <GoBackButton />
      <div className="image-container">
        <img src={data?.lipVideoUrl || lipshape } alt="입모양" className="lip-image" />
        <img src={data?.tongueImageUrl || tongue} alt="구강 내부" className="mouth-image" />
      </div>
      <div className="description-container">
        <h2 className="vowel-title">{data?.pronunciation || '발음 학습'}</h2>
        <p>{data?.description || '데이터를 불러오는 중 오류가 발생했습니다. 기본적인 정보를 제공합니다.'}</p>
      </div>
      <button className="next-button" onClick={goToPractice} disabled={loading || error}>
        다음으로
      </button>
    </div>
  );
};

export default PronsThird;