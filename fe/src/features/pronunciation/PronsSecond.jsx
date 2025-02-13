import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { springApi } from "../../utils/api"; 
import "./PronsSecond.css";
import GoBackButton from "../../components/button/GoBackButton";
import PausePopup from "../../components/popup/PausePopup";
import RecordButton from "../../components/button/RecordButton";

import lipshape from "../../assets/images/lipshape.png";
import tongue from "../../assets/images/tongue.png";

const STATIC_API_URL = import.meta.env.VITE_STATIC_API_URL;

const classMaxSeqMap = {
  1: 8, 
  2: 9, 
  3: 13, 
};

const PronsSecond = () => {
  const navigate = useNavigate();
  const { class_id, seq_id } = useParams();
  const token = useSelector((state) => state.auth.token); // ✅ Redux에서 토큰 가져오기
  const videoRef = useRef(null);
  const [tongueImage, setTongueImage] = useState(null);
  const [lipVideoSrc, setLipVideoSrc] = useState(null); // ✅ 비디오 Blob URL
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isMatch, setIsMatch] = useState(null); 
  const [feedback, setFeedback] = useState("")

//   const [isRecording, setIsRecording] = useState(false);
//   const [audioStream, setAudioStream] = useState(null)
  useEffect(() => { 
    const fetchData = async () => {
      try {
        console.log(`📡 데이터 요청: /prons/class/${class_id}/seq/${seq_id}`);
        const response = await springApi.get(`/prons/class/${class_id}/seq/${seq_id}`);
        console.log("✅ 가져온 데이터:", response.data.data);

        // ✅ 혀 이미지 & 입모양 비디오 URL 가져오기
        const { tongue_image_url, lip_video_url } = response.data.data;

        // ✅ 혀 이미지 & 비디오 fetch 요청
        if (tongue_image_url) {
          fetchResource(`${STATIC_API_URL}${tongue_image_url}`, setTongueImage);
        } else {
          setTongueImage(null);
        }

        if (lip_video_url) {
          fetchResource(`${STATIC_API_URL}${lip_video_url}`, setLipVideoSrc);
        } else {
          setLipVideoSrc(null);
        }

        setData(response.data.data);
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

  const fetchResource = async (url, setState) => {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ 토큰 포함하여 요청
        },
      });

      if (!response.ok) {
        throw new Error("리소스 로딩 실패");
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setState(blobUrl);
    } catch (error) {
      console.error(`❌ ${url} 가져오기 실패:`, error);
      setState(null); // 실패하면 기본 이미지 또는 null
    }
  };

  // ✅ 마이크 & 카메라 권한을 요청하는 함수
//   const startRecording = async () => {
//     try {
//       const audio = await navigator.mediaDevices.getUserMedia({ audio: true });
//       console.log("🎤 마이크 권한 허용됨");
//       setAudioStream(audio); // ✅ 마이크 스트림 저장

//       const video = await navigator.mediaDevices.getUserMedia({ video: true });
//       console.log("📷 카메라 권한 허용됨");

//       const combinedStream = new MediaStream([...audio.getTracks(), ...video.getTracks()]);
//       if (videoRef.current) {
//         videoRef.current.srcObject = combinedStream;
//       }

//       setIsRecording(true);
//     } catch (error) {
//       console.error("❌ 마이크/카메라 접근 오류:", error);
//       alert("마이크 & 카메라 사용을 허용해주세요.");
//     }
//   };

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
  }, [navigate]);


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
    const pron_id = localStorage.getItem("pron_id");
    if (!session_id || !pron_id) {
      alert("세션 ID가 존재하지 않습니다. 다시 시작해주세요.");
      return;
    }

    if (isMatch === null) {
      alert("녹음을 먼저 진행해주세요.");
      return;
    }

    try {
      console.log("📡 정답 여부 저장 요청:", { session_id, pron_id, is_correct: isMatch ? 1 : 0 });
      await springApi.post("/prons/session/correct", {
        session_id,
        pron_id,
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
      <PausePopup onExit={() => navigate("/prons")} title="수업을 끝낼까요?" />

      {loading ? (
        <div className="loading-container">🔄 데이터 로딩 중...</div>
      ) : (
        <>
          <div className="content-container">
          <div className="image-section">
              {lipVideoSrc ? (
                <video className="lip-video" controls autoPlay loop muted>
                  <source src={lipVideoSrc} type="video/mp4" />
                </video>
              ) : (
                <img src={lipshape} alt="입모양" className="image-top" />
              )}
              <img src={tongueImage ?? tongue} alt="구강 내부" className="image-bottom" />
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
            {/* ✅ 녹음 버튼 */}
          <div className="record-button-container">
            <RecordButton 
              onMatchUpdate={(match, feedbackMsg) => {
                setIsMatch(match);
                setFeedback(feedbackMsg);
              }} 
              pronunciation={data?.pronunciation} 
            />
          </div>

        {/* ✅ 피드백 표시 */}
          {feedback && (
            <div className="prons-feedback-box">
              <p>{feedback}</p>
            </div>
          )}


            {/* <div className="record-button-container">
            <button onClick={startRecording} disabled={isRecording}>
                {isRecording ? "🎙 녹음 중..." : "🎤 녹음 & 카메라 시작"}
            </button>

            {isRecording && audioStream && (
              <RecordButton 
                onMatchUpdate={setIsMatch} 
                pronunciation={data?.pronunciation} 
                audioStream={audioStream} // ✅ 마이크 스트림 전달
              />
            )}
          </div> */}


          <button className="next-button" onClick={handleSaveCorrectAndNext}>
            {parseInt(seq_id) === classMaxSeqMap[class_id] ? "🔚학습 끝내기" : "다음으로"}
          </button>
        </>
      )}
    </div>
  );
};

export default PronsSecond;
