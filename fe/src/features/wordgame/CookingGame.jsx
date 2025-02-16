import { useState, useRef, useEffect } from 'react';
import './CookingGame.css';
import backgroundImage from "../../assets/images/CookingGame_Bg.png";
import PausePopup from "../../components/popup/PausePopup";
import HomeButton from "../../components/button/HomeButton";
import { useNavigate } from "react-router-dom";
import { springApi } from "../../utils/api";
import recordIcon from "../../assets/icons/record.png";
import stopIcon from "../../assets/icons/pause.png";
import { useSelector } from "react-redux"; 
import dish from "../../assets/images/dish.png"

const CookingGame = () => {
  const [isRecording, setIsRecording] = useState(false); // 녹음 중인지 여부
  const [audioURL, setAudioURL] = useState(''); // 서버에서 반환받은 외부 오디오 URL
  const [timeLeft, setTimeLeft] = useState(60); // 타이머 초
  const [isTimerActive, setIsTimerActive] = useState(true); // 타이머 활성화 여부
  const [gameData, setGameData] = useState({
    foodName: '',
    item1: null,
    item2: null,
    itemList: [],
    imageData: '', //이미지 파일
  });
  const [foodImg, setFoodImg] = useState({
    food: '',
    item1: '',
    item2: '',
  });
  const [score, setScore] = useState(0); // ✅ 점수 상태 추가
  const [feedbackMessage, setFeedbackMessage] = useState(""); // ✅ 피드백 메시지 상태
  const [userSpokenWord, setUserSpokenWord] = useState(""); // ✅ 사용자가 말한 단어 저장
  
  const mediaRecorderRef = useRef(null); // MediaRecorder 참조
  const audioChunksRef = useRef([]); // 녹음된 음성 데이터 조각
  const recordingTimeoutRef = useRef(null); // 녹음 타임아웃 관리
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token); // ✅ Redux에서 Token 가져오기
  const backendURL = import.meta.env.VITE_STATIC_API_URL; // 환경변수에서 백엔드 주소 가져오기
  const [feedbackAnimation, setFeedbackAnimation] = useState(""); 
  const [showFoodHighlight, setShowFoodHighlight] = useState(false);

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

  
  // 녹음 시작
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const mediaRecorder = new MediaRecorder(stream);

      // 녹음 데이터 수집
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      // 녹음 종료 후 서버로 데이터 전송
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        });
        audioChunksRef.current = []; // 데이터 초기화
        await sendAudioToServer(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(); // 녹음 시작
      setIsRecording(true);

      // 4초 후에 자동으로 녹음 종료
      recordingTimeoutRef.current = setTimeout(() => {
        stopRecording();
      }, 4000);
    } catch (error) {
      console.error('마이크 권한 요청 실패:', error);
    }
  };

  // 녹음 종료
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearTimeout(recordingTimeoutRef.current); // 타임아웃 취소
    }
  };

  // 서버에 오디오 데이터 전송
  const sendAudioToServer = async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio'); // 'audio/webm' 형식으로 보내기

    // 게임 시작 시 받은 데이터 추가
    if (gameData.foodName) formData.append('foodName', gameData.foodName);
    if (gameData.item1) formData.append('item1', gameData.item1);
    if (gameData.item2) formData.append('item2', gameData.item2);
    try {
        // const token = localStorage.getItem("token");
        if (!token) throw new Error("Access Token이 없습니다. 로그인하세요.");

        const response = await springApi.post("/cook-game/is-correct", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data", // 자동 설정되므로 생략 가능
            },
            withCredentials: true,
        });

        
      if (response.status === 200) {
        const result = response.data;
        console.log("✅ 정답 검증 결과:", result);
        console.log("🔹 image_url:", result.image_url);

        // ✅ 오답, 중복 정답 피드백 추가
        checkIncorrect(result);

        if (result.if_correct) {
          if (result.image_url && result.image_url.includes("/")) {
              // URL 기반 이미지 처리
              const fullImageUrl = `${backendURL}${result.image_url}`; // 서버 경로 보정
              console.log("🔹 서버에서 받은 이미지 URL:", fullImageUrl);

              fetchResource(fullImageUrl, (blobUrl) => {
                if (result.cnt === 1) {
                    setGameData((prevState) => ({
                        ...prevState,
                        item1: result.item,
                    }));
    
                    setFoodImg((prevState) => ({
                        ...prevState,
                        item1: blobUrl,
                    }));
                } else {
                    setGameData((prevState) => ({
                        ...prevState,
                        item2: result.item,
                    }));
    
                    setFoodImg((prevState) => ({
                        ...prevState,
                        item2: blobUrl,
                    }));
                  }
                });
          } else {
              console.error("🚨 이미지 데이터가 없습니다! (image_url 및 image_data 없음)");
          }
      }
  }
} catch (error) {
  console.error('❌ 파일 업로드 오류:', error);
}
};

// 🎯 정답 검증 및 피드백 처리 함수
const checkIncorrect = (result) => {
    setUserSpokenWord(result.item || ""); // 사용자가 말한 단어 저장

    if (result.duplication) {
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

        // ✅ 두 개의 아이템이 모두 맞춰졌을 때만 점수 증가
        if (result.cnt === 2) {
            setScore((prev) => prev + 10);
        }
    }
};


  // 게임 시작 POST 요청
  const newFood = async () => {
    try {
        setShowFoodHighlight(false);
        setFeedbackMessage("");
        setFeedbackAnimation("");

      const response = await springApi.get("/cook-game/start-game", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      const result = response.data;
      console.log("✅ 게임 시작 응답:", result);

      setGameData({
        foodName: result.food_name || "",
        item1: null,
        item2: null,
        itemList: result.food_items || [],
        imageData: result.image_url, // API에서 받은 원본 URL 저장
      });

      // ✅ 기존 이미지 데이터 초기화
      setFoodImg({
        food: "",
        item1: "",
        item2: "",
      });

      // ✅ 음식 이미지 로드
      if (result.image_url) {
        fetchResource(`${backendURL}${result.image_url}`, (blobUrl) => {
          setFoodImg((prevState) => ({
            ...prevState,
            food: blobUrl,
          }));
        });
      }
    } catch (error) {
      console.error("❌ 게임 시작 데이터 로드 실패:", error);
    }
  };

// ⏳ 타이머 설정
useEffect(() => {
    if (!isTimerActive || timeLeft <= 0) {
        setIsTimerActive(false);
        stopRecording(); // 녹음 종료
        return;
    }

    const timerId = setTimeout(() => {
        setTimeLeft((prevTime) => prevTime - 1);
    }, 1000); // ⏳ 1초마다 감소

    return () => clearTimeout(timerId); // ✅ 타이머 정리
}, [isTimerActive, timeLeft]);

// 🎮 초기 게임 시작
useEffect(() => {
    newFood();
    setIsTimerActive(false);
}, []);

// 🍽️ 다음 음식 (정답 맞췄을 때)
useEffect(() => {
    if (gameData.item1 && gameData.item2) {
        setShowFoodHighlight(true); // 🔴 음식 이미지 강조 효과

        setTimeout(() => {
            newFood();
        }, 1000); // ✅ 1초 후 실행 
    }
}, [gameData.item1, gameData.item2]);

// 🔄 게임 재시작
const restart = () => {
    setTimeLeft(60);
    setAudioURL('');
    setIsTimerActive(true);
    setScore(0);

    // ✅ 상태 초기화 후 새로운 음식 로드
    setTimeout(() => {
        newFood();
    }, 500);
};

  return (
    <div className="cooking-game-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <HomeButton />

      {/* 🎮 게임 UI (왼쪽) */}
      <div className="cooking-game-overlay">
        <button className="pause-button">
          <PausePopup onExit={() => navigate("/wgame")} />
        </button>
  
        <h1 className="cooking-game-title">{gameData.foodName || "요리 만들기"}</h1>
        
        {/* 🔹 정답 조합 UI */}
        <div className="combination">
          <img src={foodImg.item1 || dish} alt="재료1" className="recipe-image" />
          <span className="plus-sign">+</span>
          <img src={foodImg.item2 || dish} alt="재료2" className="recipe-image" />
          <span className="equals-sign">=</span>
          <img src={foodImg.food || "/assets/images/placeholder.png"} alt="결과 음식" className={`recipe-image ${showFoodHighlight ? "food-highlight" : ""}`} />
        </div>
  
        {/* 🔹 AI가 인식한 텍스트 표시 */}
        {gameData.recognizedText && (
          <div className="recognized-text">
            <p>🎤 AI 인식 결과: {gameData.recognizedText}</p>
          </div>
        )}
                                 
        {/* 🔹 선택 가능한 재료 목록 */}
        <div className="item-selection">
          {gameData.itemList.map((item, index) => (
            <button key={index} className={item === gameData.item1 || item === gameData.item2 ? "selected" : ""}>
              {item}
            </button>
          ))}
        </div>
  
        {/* 🔹 마이크 버튼 및 안내 문구 */}
        <div className="cooking-record-container">
        <p className="cooking-record-guide">
            {isRecording ? "녹음을 완료하려면 정지 버튼을 눌러주세요" : "녹음을 하려면 마이크 버튼을 눌러주세요"}
        </p>
        <button className="cooking-record-button" disabled={!isTimerActive} onClick={isRecording ? stopRecording : startRecording}>
            <img src={isRecording ? stopIcon : recordIcon} alt="녹음 버튼" className="cooking-record-icon" />
        </button>
        </div>
  
        {/* 🔹 게임 재시작 버튼 */}
        <button className="cooking-start-button" disabled={isTimerActive} onClick={restart}>
          게임 시작
        </button>
  
        {audioURL && (
          <div className="audio-preview">
            <h2>녹음된 오디오</h2>
            <audio controls src={audioURL}></audio>
            <p>외부 오디오 URL: {audioURL}</p>
          </div>
        )}
      </div>
  
      {/* ✅ 오른쪽 정보 컨테이너 (독립적) */}
      <div className="side-info-container">
        
        <div className="cooking-score-box">
          <p>남은 시간: {timeLeft}초</p>
          <h3> 점수 </h3>
          <p>{score}</p>
        </div>
  
        <div className={`cooking-feedback-box ${feedbackAnimation}`}>
          <h3>🚨 피드백</h3>
          {feedbackMessage ? (
            <>
              <p>{feedbackMessage}</p>
              {userSpokenWord && <p>🗣 사용자가 말한 단어: <strong>{userSpokenWord}</strong></p>}
            </>
          ) : (
            <p>📝 여기에 피드백이 표시됩니다.</p>
          )}
        </div>
      </div>
    </div>
  );
  

}

export default CookingGame;
