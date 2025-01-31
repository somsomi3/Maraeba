import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { springApi } from '../../utils/api';
import './PronsFirstPrac.css';
import GoBackButton from '../../components/button/GoBackButton';
import PausePopup from '../../components/popup/PausePopup';
import RecordButton from '../../components/button/RecordButton';

import lipshape from '../../assets/images/lipshape.png';
import tongue from '../../assets/images/tongue.png';

const PronsFirstPrac = () => {
  const navigate = useNavigate();
  const { class_id, seq_id } = useParams();
  const videoRef = useRef(null);
  const [accuracy, setAccuracy] = useState(null);
  const [maxSeq, setMaxSeq] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // 해당 class의 전체 학습 수 조회 및 현재 학습 데이터 불러오기
    const fetchData = async () => {
      try {
        const classResponse = await springApi.get(`/prons/class/${class_id}`);
        setMaxSeq(classResponse.data.totalSequences);

        const response = await springApi.get(`/prons/class/${class_id}/seq/${seq_id}`);
        setData(response.data);
      } catch (error) {
        console.error('데이터 불러오기 실패:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [class_id, seq_id]);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('카메라 접근 오류:', error);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        let tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const handleExit = () => {
    navigate('/prons');
  };

  // 다음 학습 화면으로 이동
  const goToNext = () => {
    const nextSeqId = parseInt(seq_id) + 1;
    if (nextSeqId > maxSeq) {
      navigate('/prons'); // 모든 학습이 끝나면 /prons 로 이동
    } else {
      navigate(`/prons/class/${class_id}/seq/${nextSeqId}`);
    }
  };

  return (
    <div className="first-prac-container">
      <GoBackButton />
      <PausePopup onExit={handleExit} />
      <div className="content-container">
        <div className="image-section">
          <img src={data?.lipVideoUrl || lipshape} alt="입모양" className="image-top" />
          <img src={data?.tongueImageUrl || tongue} alt="혀 위치" className="image-bottom" />
        </div>
        <div className="camera-section">
          <div className="camera-frame">
            <video ref={videoRef} autoPlay playsInline className="camera-video"></video>
          </div>
          <div className="accuracy">정확도: {accuracy !== null ? `${accuracy}%` : "측정 대기 중..."}</div>
        </div>
      </div>
      <div className="record-button-container">
        <RecordButton onAccuracyUpdate={setAccuracy} />
      </div>
      <button className="next-button" onClick={goToNext}>다음으로</button>
    </div>
  );
};

export default PronsFirstPrac;
