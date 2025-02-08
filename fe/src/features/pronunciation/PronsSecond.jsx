import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { springApi } from "../../utils/api"; 
import "./PronsSecond.css";
import GoBackButton from "../../components/button/GoBackButton";
import PausePopup from "../../components/popup/PausePopup";
import RecordButton from "../../components/button/RecordButton";

import lipshape from "../../assets/images/lipshape.png";
import tongue from "../../assets/images/tongue.png";

const classMaxSeqMap = {
  1: 6, 
  2: 9, 
  3: 14, 
};

const PronsSecond = () => {
  const navigate = useNavigate();
  const { class_id, seq_id } = useParams();
  const videoRef = useRef(null);
 
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isMatch, setIsMatch] = useState(null); 

  useEffect(() => { 
    const fetchData = async () => {
      try {
        console.log(`📡 데이터 요청: /prons/class/${class_id}/seq/${seq_id}`);
        const response = await springApi.get(`/prons/class/${class_id}/seq/${seq_id}`);
        setData(response.data.data || {});
        setError(false);
      } catch (error) {
        console.error("❌ 데이터 불러오기 실패:", error);
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
        console.error("❌ 카메라 접근 오류:", error);
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

  // ✅ 학습 완료 후 세션 종료, 히스토리 저장, 통계 업데이트
  const handleEndSession = async () => {
    const session_id = localStorage.getItem("session_id");
    if (!session_id) {
      alert("세션 ID가 존재하지 않습니다. 다시 시작해주세요.");
      return;
    }

    try {
      console.log("📡 히스토리 저장 요청:", session_id);
      await springApi.post(`/prons/session/history/${session_id}`);
      console.log("✅ 히스토리 저장 완료");

      alert("학습이 성공적으로 완료되었습니다!");
      navigate("/prons/result"); // 학습 메인 페이지로 이동
    } catch (error) {
      console.error("❌ 세션 종료 또는 데이터 저장 실패:", error);
      alert("학습 종료를 처리하는 중 오류가 발생했습니다.");
    }
  };

  // ✅ "다음으로" 버튼을 눌렀을 때 정답 여부 저장 후 학습 완료 시 세션 종료
  const handleSaveCorrectAndNext = async () => {
    const session_id = localStorage.getItem("session_id");
    if (!session_id) {
      alert("세션 ID가 존재하지 않습니다. 다시 시작해주세요.");
      return;
    }

    if (isMatch === null) {
      alert("녹음을 먼저 진행해주세요.");
      return;
    }

    try {
      console.log("📡 정답 여부 저장 요청:", { session_id, is_correct: isMatch ? 1 : 0 });
      await springApi.post("/prons/session/correct", {
        session_id,
        is_correct: isMatch ? 1 : 0, // 🔹 match 값에 따라 1(정답) 또는 0(오답) 저장
      });

      console.log("✅ 정답 여부 저장 완료");

      // ✅ 만약 마지막 수업이면 세션 종료 및 통계 업데이트
      const nextSeqId = parseInt(seq_id) + 1;
      const maxSeq = classMaxSeqMap[class_id] || 1;

      if (nextSeqId > maxSeq) {
        await handleEndSession(); // 🔥 마지막 학습 단계면 세션 종료 & 통계 업데이트
      } else {
        navigate(`/prons/class/${class_id}/seq/${nextSeqId}`);
      }
    } catch (error) {
      console.error("❌ 정답 여부 저장 실패:", error);
      alert("정답 여부를 저장하는 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="prons-second-container">
      <GoBackButton />
      <PausePopup onExit={() => navigate("/prons")} />

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
                <div className="match-result">
                  {isMatch === null ? "녹음 후 결과가 표시됩니다." : 
                  isMatch ? "정확해요! ✅" : "발음이 달라요 😞"}
                </div>
              </div>
            </div>
          </div>

          {/* ✅ 발음 정보 표시 */}
          {data?.pronunciation && (
            <div className="pronunciation-box">
              {data.pronunciation}
            </div>
          )}
            <div className="record-button-container">
          <RecordButton onMatchUpdate={setIsMatch} pronunciation={data?.pronunciation} />
            </div>
          <button className="next-button" onClick={handleSaveCorrectAndNext}>
            {parseInt(seq_id) === classMaxSeqMap[class_id] ? "학습 끝내기" : "다음으로"}
          </button>
        </>
      )}
    </div>
  );
};

export default PronsSecond;
