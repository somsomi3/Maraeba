import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { springApi } from "../../utils/api"; 
import "./PronsSecond.css";
import GoBackButton from "../../components/button/GoBackButton";
import PausePopup from "../../components/popup/PausePopup";
import RecordButton from "../../components/button/RecordButton";

import lipshape from "../../assets/images/lipshape.png";
import tongue from "../../assets/images/tongue.png";

/* 학습 개수 하드코딩 (나중에 API로 변경) */
const classMaxSeqMap = {
  1: 6, 
  2: 9, 
  3: 14, 
};

const PronsSecond = () => {
  const navigate = useNavigate();
  const { class_id, seq_id } = useParams();
  const videoRef = useRef(null);
  const [accuracy, setAccuracy] = useState([null, null, null]); 
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => { 
    const fetchData = async () => {
      try {
        console.log(`📡 데이터 요청: /prons/class/${class_id}/seq/${seq_id}`);
        const response = await springApi.get(`/prons/class/${class_id}/seq/${seq_id}`);
        setData(response.data.data || {});
        setError(false);
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
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
        console.error("카메라 접근 오류:", error);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        let tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  // 학습 종료 (메인 페이지 이동)
  const handleExit = () => {
    navigate("/prons");
  };

  // ▶️ 다음 학습 화면으로 이동
  const goToNext = () => {
    const nextSeqId = parseInt(seq_id) + 1;
    const maxSeq = classMaxSeqMap[class_id] || 1;

    if (nextSeqId > maxSeq) {
      navigate("/prons"); 
    } else {
      navigate(`/prons/class/${class_id}/seq/${nextSeqId}`);
    }
  };

  // ✅ RecordButton에서 정확도 업데이트
  const handleAccuracyUpdate = (lev, jaro, custom) => {
    setAccuracy([lev, jaro, custom]);
  };

  return (
    <div className="prons-second-container">
      <GoBackButton />
      <PausePopup onExit={handleExit} />

      {loading ? (
        <div className="loading-container">🔄 데이터 로딩 중...</div>
      ) : (
        <>
          <div className="content-container">
            <div className="image-section">
              <img src={lipshape} alt="입모양" className="image-top" />
              <img src={tongue} alt="혀 위치" className="image-bottom" />
            </div>
            <div className="camera-section">
              <div className="camera-frame">
                <video ref={videoRef} autoPlay playsInline className="camera-video"></video>
              </div>
              <div className="accuracy">
                정확도: {accuracy[0] !== null ? `${accuracy[0]}%` : "측정 대기 중..."}
              </div>
            </div>
          </div>

          {/* ✅ Pronunciation 표시 추가 */}
          {data?.pronunciation && (
            <div className="pronunciation-box">
              {data.pronunciation}
            </div>
          )}

          <div className="record-button-container">
            <RecordButton onAccuracyUpdate={handleAccuracyUpdate} pronunciation={data?.pronunciation} />
          </div>

          {/* ✅ 정확도 세 개를 오른쪽에 표시 */}
          <div className="accuracy-box">
            <h3>정확도</h3>
            <p>lev: {accuracy[0] !== null ? `${accuracy[0]}%` : "-"}</p>
            <p>jaro: {accuracy[1] !== null ? `${accuracy[1]}%` : "-"}</p>
            <p>custom: {accuracy[2] !== null ? `${accuracy[2]}%` : "-"}</p>
          </div>

          <button className="next-button" onClick={goToNext}>
            {parseInt(seq_id) === classMaxSeqMap[class_id] ? "학습 끝내기" : "다음으로"}
          </button>
        </>
      )}
    </div>
  );
};

export default PronsSecond;
