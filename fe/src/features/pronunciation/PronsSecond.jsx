import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { turnOnCamera, turnOffCamera } from "../../store/cameraSlice";
import { springApi } from "../../utils/api"; 
import "./PronsSecond.css";
import GoBackButton from "../../components/button/GoBackButton";
import PausePopup from "../../components/popup/PausePopup";
import RecordButton from "../../components/button/RecordButton";

import lipshape from "../../assets/images/lipshape.png";
import tongue from "../../assets/images/tongue.png";

import tutoPorong from "../../assets/images/tuto_porong.png"
import bookbg from "../../assets/background/book.png"

const STATIC_API_URL = import.meta.env.VITE_STATIC_API_URL;

const classMaxSeqMap = {
  1: 6, 
  2: 8, 
  3: 6, 
};

const PronsSecond = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { class_id, seq_id } = useParams();
//   const token = useSelector((state) => state.auth.token); 
  const videoRef = useRef(null);
  const [tongueImage, setTongueImage] = useState(null);
  const [lipVideoSrc, setLipVideoSrc] = useState(null); // ✅ 비디오 Blob URL
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isMatch, setIsMatch] = useState(null); 
  const [feedback, setFeedback] = useState("")
  const [mypron, setMypron] = useState("")
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(null);  
  const [isTutorialCompleted, setIsTutorialCompleted] = useState(false); 
  const [username, setUsername] = useState("");
  const [showGreeting, setShowGreeting] = useState(true); // ✅ 인삿말 표시 여부
  const [recordWarning, setRecordWarning] = useState(true);

  const getClassBackground = (class_id) => {
    switch (class_id) {
      case "1":
        return "class1-bg";
      case "2":
        return "class2-bg";
      case "3":
        return "class3-bg";
      default:
        return "default-bg";
    }
  };
  
useEffect(() => {
  const fetchUserData = async () => {
    try {
      const response = await springApi.get("/users/me");
      setUsername(response.data.username); // ✅ username 저장
    } catch (error) {
      console.error("❌ 사용자 정보 불러오기 실패:", error);
    }
  };

  fetchUserData();
}, []);


useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`📡 데이터 요청: /prons/class/${class_id}/seq/${seq_id}`);
        const response = await springApi.get(`/prons/class/${class_id}/seq/${seq_id}`);
        console.log("✅ 가져온 데이터:", response.data.data);

        const { tongue_image_url, lip_video_url } = response.data.data;

        // ✅ URL을 바로 상태에 저장
        setTongueImage(tongue_image_url ? `${STATIC_API_URL}${tongue_image_url}` : null);
        setLipVideoSrc(lip_video_url ? `${STATIC_API_URL}${lip_video_url}` : null);
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

//   const fetchResource = async (url, setState) => {
//     try {
//       const response = await fetch(url, {
//         headers: {
//           Authorization: `Bearer ${token}`, // ✅ 토큰 포함하여 요청
//         },
//       });

//       if (!response.ok) {
//         throw new Error("리소스 로딩 실패");
//       }

//       const blob = await response.blob();
//       const blobUrl = URL.createObjectURL(blob);
//       setState(blobUrl);
//     } catch (error) {
//       console.error(`❌ ${url} 가져오기 실패:`, error);
//       setState(null); // 실패하면 기본 이미지 또는 null
//     }
//   };

  const isCameraOn = useSelector((state) => state.camera.isCameraOn);
  const shouldRestart = useSelector((state) => state.camera.shouldRestart);
  const cameraStreamRef = useRef(null);

  const startCamera = async () => {
    try {
      if (!cameraStreamRef.current) { // ✅ 이미 켜져 있으면 실행하지 않음
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraStreamRef.current = stream;
        dispatch(turnOnCamera());
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch (error) {
      console.error("❌ 카메라 접근 오류:", error);
    }
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
    dispatch(turnOffCamera());
  };

  // ✅ Redux에서 관리하는 스트림을 videoRef에 연결
  useEffect(() => {
    if (shouldRestart) {
      startCamera();
    }
  }, [shouldRestart]);


  useEffect(() => {
    const fetchTutorialStatus = async () => {
      try {
        const response = await springApi.get("/users/me/tutorial");
        const hasSeenPron = response.data.data.has_seen_pron;
        
        if (hasSeenPron) {
          setIsTutorialCompleted(true);
          setShowGreeting(false); // 튜토리얼을 봤다면 인삿말 표시 X
        } else {
          setShowGreeting(true);  // 처음이면 인삿말 표시
        }
      } catch (error) {
        console.error("❌ 튜토리얼 상태 가져오기 실패:", error);
      }
    };
    fetchTutorialStatus();
  }, [seq_id]);
  
  const handleTutorialComplete = async () => {
    try {
      await springApi.patch("/users/me/tutorial/1", { completed: true });
      console.log("튜토리얼 완료 상태 저장");
      setIsTutorialCompleted(true);
      setShowGreeting(false); // 튜토리얼 완료 후 인삿말 숨기기
    } catch (error) {
      console.error("❌ 튜토리얼 완료 상태 저장 실패:", error);
    }
  };
  
  const handleRestartTutorial = async () => {
    try {
      await springApi.patch("/users/me/tutorial/1", { completed: false });
      setIsTutorialCompleted(false);
      setTutorialStep(1);
    //   setShowGreeting(true);
    } catch (error) {
      console.error("❌ 튜토리얼 다시보기 실패:", error);
    }
  };


const PorongSpeech = ({ text, position= "center", onNext }) => {
    return (
      <div className={`porong-container ${position}`}>
        <img src={tutoPorong} alt="포롱이" className="porong-image" />
        <div className="porong-speech-bubble">
          {text.split("\n").map((line, index) => (
            <span key={index}>
              {line}
              <br />
            </span>
          ))}
          {onNext && <button onClick={onNext} className="porong-nextbutton">다음</button>}
        </div>
      </div>
    );
  };
  

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
      setIsPopupOpen(true);
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
    <div className={`prons-second-container ${getClassBackground(class_id)}`}>
    {/* <div className="prons-second-container"> */}
      <GoBackButton />
      <PausePopup onExit={() => navigate("/prons")} title="수업을 끝낼까요?" />
        <img src={bookbg} alt="책배경" className="book-container"/>
      <button className="restart-tutorial-btn" onClick={handleRestartTutorial}>
        ▶ 튜토리얼
      </button>

      {loading ? (
        <div className="loading-container">🔄 데이터 로딩 중...</div>
      ) : (
        <>
          <div className="content-container">
          {showGreeting && !isTutorialCompleted && (
            <PorongSpeech
                text={`안녕하세요, ${username}님! \n 저는 포롱이예요🦊 \n 포롱이와 함께 발음 연습 방법을 익혀볼까요?`}
                position="center"
                onNext={() => {
                setShowGreeting(false);
                setTutorialStep(1);
                }}
            />
            )}
            <div className="image-section">
                {lipVideoSrc ? (
                    <video className={`lip-video ${tutorialStep === 1 ? "highlight" : ""}`} controls autoPlay loop muted>
                    <source src={lipVideoSrc} type="video/mp4" />
                    </video>
                ) : (
                    <img src={lipshape} alt="입모양" className={`image-top ${tutorialStep === 1 ? "highlight" : ""}`} />
                )}
                <img src={tongueImage ?? tongue} alt="구강 내부" className={`image-bottom ${tutorialStep === 1 ? "highlight" : ""}`} />
                </div>
                {!isTutorialCompleted && tutorialStep === 1 && (
                    <PorongSpeech text="먼저, 입모양을 확인해요!" position="near-result" onNext={() => setTutorialStep(2)} />
                    )}


            <div className={`camera-section ${tutorialStep === 2 ? "highlight" : ""}`}>
              <div className="camera-frame">
                <video ref={videoRef} autoPlay playsInline className="camera-video"></video>
              </div>
              <button onClick={isCameraOn ? stopCamera : startCamera} 
              className={`camera-button ${tutorialStep === 2 ? "highlight" : ""}`}
              >
                {isCameraOn ? "OFF" : "ON"}
                </button>
                <div className={`accuracy ${tutorialStep === 5 ? "highlight" : ""}`}>
                    <div className="match-result">
                        {isMatch === null ? "" : `내 발음: ${mypron}` }
                    </div>
                    </div>
                    {tutorialStep === 5 && (
                        <PorongSpeech text="내 발음을 확인할 수 있어요!" position="near-result" onNext={() => setTutorialStep(6)} />
                        )}

                {tutorialStep === 2 && (
                <PorongSpeech text="카메라를 켜고 입모양을 확인하면서 연습해요!" onNext={() => setTutorialStep(3)} />
                )}
            </div>
          </div>

          {/* ✅ 발음 정보 표시 */}
          {data?.pronunciation && (
            <div className="pronunciation-box">
              {data.pronunciation}
            </div>
          )}
            {/* ✅ 녹음 버튼 */}
            <div className={`record-button-container ${tutorialStep === 3 ? "highlight" : ""}`}>
            {recordWarning && (
                    <div className="record-warning">
                        🎤 녹음을 해주세요!
                    </div>
                )}
            <RecordButton 
              onMatchUpdate={(match, feedbackMsg, mypron) => {
                setIsMatch(match);
                setFeedback(feedbackMsg);
                setMypron(mypron);
                setRecordWarning(false);
                if (tutorialStep === 3) {
                    setTutorialStep(4);
                  }
             }} 
              pronunciation={data?.pronunciation} 
            />
          </div>
          {tutorialStep === 3 && (
            <PorongSpeech text="녹음 버튼을 누르고, 내 발음을 확인해볼까요?" position="near-record"/>
            
           )}

            {/* ✅ 4단계: 녹음 후 버튼을 눌러주세요! */}
                {tutorialStep === 4 && isMatch === null && (
                <PorongSpeech text="녹음 후 버튼을 눌러주세요!" />
                )}

                {/* ✅ 5단계: "잘했어요!"도 포롱이가 말하도록 변경 */}
                {tutorialStep === 4 && isMatch !== null && (
                <PorongSpeech text="잘했어요!" position="above-record" onNext={() => setTutorialStep(5)} />
                )}

          {feedback && (
            <div className="prons-feedback-box">
              <p>{feedback}</p>
            </div>
          )}

        {isPopupOpen && (
        <div className="prons-popup-overlay">
            <div className="prons-popup-content">
                <h1>🦊</h1>
                <p>녹음을 진행해주세요!</p>
            <button onClick={() => setIsPopupOpen(false)}>확인</button>
            </div>
        </div>
        )}

            <button className={`next-button ${tutorialStep === 6 ? "highlight" : ""}`} onClick={handleSaveCorrectAndNext}>
            {parseInt(seq_id) === classMaxSeqMap[class_id] ? "🔚학습 끝내기" : "다음으로"}
            </button>
            
            {/* ✅ 6단계: 튜토리얼 완료 */}
            {tutorialStep === 6 && (
            <PorongSpeech
                text="이제 계속해서 발음 연습을 해볼까요?"
                position="near-next"
                onNext={handleTutorialComplete}
            />
            )}

        </>
      )}
    </div>
  );
};

export default PronsSecond;
