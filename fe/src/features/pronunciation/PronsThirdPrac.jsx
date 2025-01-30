import { useEffect, useRef, useState } from "react";
import "./PronsThirdPrac.css";
import tongue from "../../assets/images/tongue.png";
import lipshape from "../../assets/images/lipshape.png";
import GoBackButton from "../../components/button/GoBackButton";
import PausePopup from "../../components/popup/PausePopup";
import RecordButton from "../../components/button/RecordButton";
import { useNavigate } from "react-router-dom";

const PronsThirdPrac = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [accuracy, setAccuracy] = useState(null); // 정확도 저장

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
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const handleExit = () => {
    navigate("/prons");
  };

  return (
    <div className="third-prac-container">
      <GoBackButton />
      <PausePopup onExit={handleExit} />
      <div className="content-container">
        <div className="image-section">
          <img src={lipshape} alt="발음 입모양" className="image-top" />
          <img src={tongue} alt="혀 위치" className="image-bottom" />
        </div>
        <div className="camera-section">
          <div className="camera-frame">
            <video ref={videoRef} autoPlay playsInline className="camera-video"></video>
          </div>
          <div className="accuracy">
            정확도: {accuracy !== null ? `${accuracy}%` : "측정 대기 중..."}
          </div>
        </div>
      </div>

      {/* 중앙 하단 녹음 버튼 */}
      <div className="record-button-container">
        <RecordButton onAccuracyUpdate={setAccuracy} />
      </div>
    </div>
  );
};

export default PronsThirdPrac;
