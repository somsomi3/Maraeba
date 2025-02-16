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
  1: 6, 
  2: 8, 
  3: 6, 
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
  const [mypron, setMypron] = useState("")
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(null);  // ✅ 튜토리얼 단계 관리
  const [isTutorialCompleted, setIsTutorialCompleted] = useState(false); // ✅ 튜토리얼 완료 여부
  

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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOn(true);  // ✅ 카메라가 켜졌다고 표시
      }
    } catch (error) {
      console.error("❌ 카메라 접근 오류:", error);
    }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      let tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraOn(false);  // ✅ 카메라가 꺼졌다고 표시
    }
  };

  useEffect(() => {
    // const fetchTutorialStatus = async () => {
    //   try {
    //     const response = await springApi.get("/users/me/tutorial");
    //     if (response.data.has_seen_pron) {
    //       setIsTutorialCompleted(true);  // 이미 완료된 경우
    //     } else {
    //       setTutorialStep(1);  // 튜토리얼 시작
    //     }
    //   } catch (error) {
    //     console.error("튜토리얼 상태 가져오기 실패:", error);
    //   }
    // };
   if (Number(seq_id) === 1) {
        setTutorialStep(1);
    }
    // fetchTutorialStatus();
  }, [seq_id]);
  


//   useEffect(() => {
//     const startCamera = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//         }
//       } catch (error) {
//         console.error("❌ 카메라 접근 오류:", error);
//       }
//     };

//     startCamera();

//     return () => {
//       if (videoRef.current && videoRef.current.srcObject) {
//         let tracks = videoRef.current.srcObject.getTracks();
//         tracks.forEach((track) => track.stop());
//       }
//     };
//   }, [navigate]);


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
                    <video className={`lip-video ${tutorialStep === 1 ? "highlight" : ""}`} controls autoPlay loop muted>
                    <source src={lipVideoSrc} type="video/mp4" />
                    </video>
                ) : (
                    <img src={lipshape} alt="입모양" className={`image-top ${tutorialStep === 1 ? "highlight" : ""}`} />
                )}
                <img src={tongueImage ?? tongue} alt="구강 내부" className={`image-bottom ${tutorialStep === 1 ? "highlight" : ""}`} />
                </div>
                {tutorialStep === 1 && (
                <div className="prons-tutorial-overlay">
                    <div className="prons-tutorial-box">
                    <p>입모양을 확인해요!</p>
                    <button onClick={() => setTutorialStep(2)}>다음</button>
                    </div>
                </div>
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
                        {isMatch === null ? "녹음 후 결과가 표시됩니다." : isMatch ? "정확해요! ✅" : `내 발음: ${mypron}` }
                    </div>
                    </div>
                    {tutorialStep === 5 && (
                    <div className="prons-tutorial-overlay">
                        <div className="prons-tutorial-box">
                        <p>내 발음을 확인할 수 있어요!</p>
                        <button onClick={() => setTutorialStep(6)}>다음</button>
                        </div>
                    </div>
                )}

                {tutorialStep === 2 && (
                    <div className="prons-tutorial-overlay">
                        <div className="prons-tutorial-box">
                        <p>카메라를 켜고 입모양을 확인하면서 연습해요!</p>
                        <button onClick={() => setTutorialStep(3)}>다음</button>
                        </div>
                    </div>
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
            <RecordButton 
              onMatchUpdate={(match, feedbackMsg, mypron) => {
                setIsMatch(match);
                setFeedback(feedbackMsg);
                setMypron(mypron)
                if (tutorialStep === 3) {
                    setTutorialStep(4);
                  }
             }} 
              pronunciation={data?.pronunciation} 
            />
          </div>
          {tutorialStep === 3 && (
            <div className="prons-tutorial-overlay">
                <div className="prons-tutorial-box">
                <p>이제, 내 발음을 확인해볼까요?</p>
                </div>
            </div>
            )}

            {tutorialStep === 4 && isMatch === null && (
            <div className="prons-tutorial-overlay">
                <div className="prons-torial-box">
                <p>녹음 후 버튼을 눌러주세요!</p>
                </div>
            </div>
            )}

            {tutorialStep === 4 && isMatch !== null && (
            <div className="prons-tutorial-overlay">
                <div className="prons-tutorial-box">
                <p>잘했어요!</p>
                <button onClick={() => setTutorialStep(5)}>다음</button>
                </div>
            </div>
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


            <button className={`next-button ${tutorialStep === 6 ? "highlight" : ""}`} onClick={handleSaveCorrectAndNext}>
            {parseInt(seq_id) === classMaxSeqMap[class_id] ? "🔚학습 끝내기" : "다음으로"}
            </button>
            {tutorialStep === 6 && (
            <div className="prons-tutorial-overlay">
                <div className="prons-tutorial-box">
                <p>이제 계속해서 발음 연습을 해볼까요?</p>
                <button onClick={async () => {
                    setIsTutorialCompleted(true);
                    setTutorialStep(null);

                    // ✅ 튜토리얼 완료 PUT 요청
                    try {
                    await springApi.put("/prons/tutorial-status", { completed: true });
                    console.log("✅ 튜토리얼 완료 상태 저장됨");
                    } catch (error) {
                    console.error("❌ 튜토리얼 완료 상태 저장 실패:", error);
                    }
                }}>완료</button>
                </div>
            </div>
            )}

        </>
      )}
    </div>
  );
};

export default PronsSecond;
