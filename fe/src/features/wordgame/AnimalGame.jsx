import { useState, useRef, useEffect } from 'react';
import { springApi } from "../../utils/api"; // API 인스턴스 사용
import backgroundImage from "../../assets/background/animal_bg.png";
import { useSelector } from 'react-redux'; // ✅ Redux에서 토큰 가져오기
import HomeButton from "../../components/button/HomeButton";
import "./AnimalGame.css";
import recordIcon from "../../assets/icons/record.png";
import stopIcon from "../../assets/icons/pause.png";
import CorrectPopup from "../../components/popup/CorrectPopup"; 

const AnimalGame = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [gameData, setGameData] = useState({
    imageNumber: '',
    imageData: '',
    answerList: [],
    circleData: [],
  });
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimeoutRef = useRef(null);
  const token = useSelector((state) => state.auth.token);
  const backendURL = import.meta.env.VITE_STATIC_API_URL;
  const imageContainerRef = useRef(null); // 이미지 컨테이너 참조
  const imageRef = useRef(null); // 이미지 참조
  const [imageLoaded, setImageLoaded] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [showCorrectPopup, setShowCorrectPopup] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(""); // ✅ 피드백 메시지 상태
  const [userSpokenWord, setUserSpokenWord] = useState(""); // ✅ 사용자가 말한 단어 저장
  const [feedbackAnimation, setFeedbackAnimation] = useState(""); 
  const [spokenAnswers, setSpokenAnswers] = useState(new Set()); // ✅ 이미 맞춘 정답 저장

   // ✅ 공통 fetch 함수 (Access Token 포함)
   const fetchResource = async (url, setState) => {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("이미지 로딩 실패");
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setState(blobUrl);
    } catch (error) {
      console.error(`❌ ${url} 가져오기 실패:`, error);
      setState(null); // 실패하면 기본값 유지
    }
  };

  const startGame = async () => {
    try {
        const response = await springApi.get('/wgames/find-animal/start-game', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            withCredentials: true, 
        });

        console.log("🔍 Response 객체:", response);
        const data = response.data;
        console.log("응답 데이터:", data);

        if (!data.image_url) {
            throw new Error("❌ image_url이 올바르지 않습니다.");
        }

        const fullImageUrl = `${backendURL}${data.image_url}`; // 서버 경로 보정
        console.log("🔍 최종 이미지 URL:", fullImageUrl);

        // ✅ `fetchResource` 사용하여 이미지 로드
        fetchResource(fullImageUrl, (blobUrl) => {
            setGameData({
                imageNumber: data.image_number,
                imageData: blobUrl,
            });
        });

    } catch (error) {
        console.error("❌ 게임 시작 오류:", error);
    }
};

  // 녹음 시작
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = []; // 데이터 초기화
        await sendAudioToServer(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      recordingTimeoutRef.current = setTimeout(() => {
        stopRecording();
      }, 4000);
    } catch (error) {
      console.error('마이크 권한 요청 실패:', error);
    }
  };

  // 녹음 중지
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearTimeout(recordingTimeoutRef.current);
    }
  };

  // 정답 확인 API 요청
  const sendAudioToServer = async (audioBlob) => {
    try {
        console.log("🎤 음성 데이터를 백엔드로 전송 중...");

        // 1️⃣ Access Token 가져오기
        // const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("❌ Access Token이 없습니다. 로그인하세요.");
        }

        // ✅ gameData.answerList가 undefined/null일 경우 빈 배열로 초기화
        const currentAnswerList = gameData.answerList || [];

        // 2️⃣ FormData 객체 생성
        const formData = new FormData();
        formData.append("audio", new File([audioBlob], "recorded-audio.webm", { type: "audio/webm" })); // ✅ 파일명 추가
        formData.append("imageNumber", gameData.imageNumber);
        formData.append("answerList", JSON.stringify(currentAnswerList)); // ✅ JSON 문자열 변환

        console.log("📤 최종 전송할 FormData:", [...formData.entries()]);

        // 3️⃣ 백엔드 API 호출 (Authorization 포함)
        const response = await springApi.post('/wgames/find-animal/is-correct', formData, {
            headers: {
                Authorization: `Bearer ${token}`,  // ✅ JWT 토큰 추가
                "Content-Type": "multipart/form-data",
            },
            withCredentials: true,  // ✅ 쿠키 인증 활성화 (필요한 경우)
        });

        // 4️⃣ 백엔드 응답 데이터 확인
        const result = response.data;
        console.log("✅ 백엔드 응답 데이터:", result);


        if (result.duplication) {
            console.warn("⚠️ 이미 맞춘 정답입니다:", result.animal_name);
            return; // 중복 정답이면 처리 중단
        }

        // // ✅ 이미 존재하는 정답인지 프론트에서도 중복 체크 (추가적인 보안)
        // if (currentAnswerList.includes(result.animal_name)) {
        //     // alert(`⚠️ 이미 맞춘 정답입니다: ${result.animal_name}`);
        //     return;
        // }

        checkIncorrect(result);

        if (result.if_correct && !currentAnswerList.includes(result.animal_name))  {
            console.log("🎯 정답 확인! 추가된 동물:", result.animal_name);

            // 5️⃣ 정답 리스트 & 동그라미 위치 업데이트
            setGameData((prevState) => ({
                ...prevState,
                answerList: [...(prevState.answerList || []), result.animal_name],
                circleData: [...(prevState.circleData || []), { x: result.x, y: result.y }],
            }));

            // 6️⃣ 모든 정답을 맞추면 게임 재시작
            if (result.cnt === 5) {
                console.log("🎉 5개 정답 완료! 게임을 새로 시작합니다.");
                setShowCorrectPopup(true); 
            }
        } else {
            console.log("❌ 오답입니다. 다시 시도하세요.");
        }
    } catch (error) {
        console.error("❌ 음성 데이터 전송 실패:", error);
        if (error.response) {
            console.error("📢 서버 응답 데이터:", error.response.data);
        }
    }
};

  useEffect(() => {
    startGame();
  }, []);

  // ✅ 이미지 로드 시 크기 업데이트
  const handleImageLoad = () => {
    if (imageRef.current) {
      setContainerSize({
        width: imageRef.current.clientWidth,
        height: imageRef.current.clientHeight,
      });
    }
  };

// ✅ 동그라미 좌표 비율 변환
const calculateAdjustedPosition = (origX, origY) => {
  if (!imageRef.current) return { x: "0%", y: "0%", size: "2vw" };

  // 이미지의 자연 크기
  const naturalWidth = imageRef.current.naturalWidth;
  const naturalHeight = imageRef.current.naturalHeight;
  // 이미지의 실제 렌더링된 크기
  const renderedWidth = imageRef.current.clientWidth;
  const renderedHeight = imageRef.current.clientHeight;

  // 컨테이너의 크기를 가져옴 (이미지 컨테이너가 이미지의 부모라면)
  const containerRect = imageRef.current.getBoundingClientRect();

  // 스케일 비율 계산 (object-fit: contain이면 가로 또는 세로 중 하나가 꽉 차게 됨)
  const scale = renderedWidth / naturalWidth; // 혹은 renderedHeight / naturalHeight

  // 원본 좌표를 실제 픽셀 좌표로 변환
  const pixelX = origX * scale;
  const pixelY = origY * scale;

  // 만약 컨테이너가 이미지보다 클 경우, 이미지 주변에 생기는 여백(오프셋)을 계산
  const offsetX = (containerRect.width - renderedWidth) / 2;
  const offsetY = (containerRect.height - renderedHeight) / 2;

  // 최종 좌표 (컨테이너 기준 픽셀)
  const finalPixelX = offsetX + pixelX;
  const finalPixelY = offsetY + pixelY;

  // 컨테이너 기준 퍼센트 좌표로 변환
  let percX = (finalPixelX / containerRect.width) * 100;
  let percY = (finalPixelY / containerRect.height) * 100;

  // 보정값을 적용 (DB 좌표가 약간 부정확할 경우)
  const correctionXPercent = 12; // 조정 가능한 값
  const correctionYPercent = 13; // 조정 가능한 값
  percX += correctionXPercent;
  percY += correctionYPercent;

  // 동그라미 크기도 동일한 스케일로 계산 (예시로 최소/최대 값 고려)
  const circleSizePx = Math.max((8 / 100) * renderedWidth, (3 / 100) * window.innerWidth);
  // vw 단위로 변환 (window.innerWidth 기준)
  const circleSizeVw = (circleSizePx / window.innerWidth) * 100;

  return {
    x: `${percX}%`,
    y: `${percY}%`,
    size: `${circleSizeVw}vw`,
  };
};




  // 5개 정답 달성 시 팝업이 뜨고,
  // 팝업에서 [게임 시작] 버튼을 누르면 실제 startGame() 실행
  const handleRestart = () => {
    setShowCorrectPopup(false); // 팝업 닫기
    startGame();                // 새로운 게임 시작
  };
  
// 🎯 정답 검증 및 피드백 처리 함수
const checkIncorrect = (result) => {
    setUserSpokenWord(result.animal_name || ""); // 사용자가 말한 단어 저장

     // ✅ gameData.answerList가 undefined일 경우 빈 배열로 처리
     const currentAnswerList = gameData.answerList || [];


    if (currentAnswerList.includes(result.animal_name)) {
        setFeedbackMessage("⚠️ 이미 맞춘 정답입니다!");
        setFeedbackAnimation("feedback-shake");
        setTimeout(() => {
            setFeedbackAnimation("");
          }, 1000);
    } else if (!result.if_correct) {
        setFeedbackMessage("❌ 오답이에요! 다시 시도하세요.");
        setFeedbackAnimation("feedback-shake");
        setTimeout(() => {
            setFeedbackAnimation("");
          }, 1000);
    } else {
        setFeedbackMessage("✅ 정답!");
        setFeedbackAnimation("feedback-bounce");

        setTimeout(() => {
            setFeedbackAnimation("");
          }, 1000);
    }
};





  
  useEffect(() => {
    const handleResize = () => {
      if (imageRef.current) {
        setGameData((prev) => ({
          ...prev,
          circleData: (prev.circleData || []).map((circle) => {
            const adjustedPos = calculateAdjustedPosition(parseFloat(circle.x), parseFloat(circle.y));
            return { x: adjustedPos.x, y: adjustedPos.y };
          }),
        }));
      }
    };
  
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  return (
    <div className="animal-game-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <HomeButton />
  
      <div className="animal-game-overlay">
        <h1 className="animal-game-title">숨은 동물을 찾아보자!</h1>
  
        <div className="animal-game-content">
          
          {/* 왼쪽 칼럼 */}
          <div className="animal-left-column">
            {/* 이미지를 감싸는 컨테이너 */}
            <div className="animal-image-container">
              {gameData.imageData && (
                <img
                  ref={imageRef}
                  src={gameData.imageData}
                  alt="Game Image"
                  className="animal-game-image"
                  onLoad={handleImageLoad}
                />
              )}
  
                {Array.isArray(gameData.circleData) &&
                gameData.circleData.map((circle, index) => {
                    const { x, y, size } = calculateAdjustedPosition(circle.x, circle.y);
                    return (
                    <div
                        key={index}
                        className="circle-marker"
                        style={{
                            top: y,
                            left: x,
                            width: size,
                            height: size,
                        }}
                    />
                    );
                })}
            </div>
            
          {/* 🔹 피드백 박스 */}
            <div className={`animal-feedback-box ${feedbackAnimation}`}>
            <h3>피드백</h3>
            {feedbackMessage ? (
                <>
                <p>{feedbackMessage}</p>
                {userSpokenWord && <p>🗣 사용자가 말한 동물: <strong>{userSpokenWord}</strong></p>}
                </>
            ) : (
                <p>📝 여기에 피드백이 표시됩니다.</p>
            )}
            </div>
            </div>
  
          {showCorrectPopup && (
            <CorrectPopup
              message="축하합니다! 5개 정답을 모두 맞추셨어요!"
              onRestart={handleRestart}
            />
          )}
  
          {/* 동물 리스트 (오른쪽 칼럼) */}
          <div className="animal-list">
            <h3>음성으로 동물을 맞춰보세요!</h3>
            <p>{(gameData.answerList || []).length} / 5</p>
            <ul>
              {(gameData.answerList || []).length > 0 ? (
                gameData.answerList.map((animal, index) => (
                  <li key={index}>
                    <span className="animal-icon">🐾</span>
                    <span className="animal-name">{animal}</span>
                  </li>
                ))
              ) : (
                <p>아직 맞춘 동물이 없습니다.</p>
              )}
            </ul>
          </div>
        </div>
  
        {/* 녹음 버튼 */}
        <div className="animal-record-container">
        <p className="animal-record-guide">
            {isRecording ? "녹음을 완료하려면 정지 버튼을 눌러주세요" : "녹음을 하려면 마이크 버튼을 눌러주세요"}
        </p>
        <button
          className="Animal-record-button"
          onClick={isRecording ? stopRecording : startRecording}
        >
          <img
            src={isRecording ? stopIcon : recordIcon}
            alt="녹음 버튼"
            className="Animal-record-icon"
          />
        </button>
        </div>

      </div>
    </div>
  );
  
};

export default AnimalGame;