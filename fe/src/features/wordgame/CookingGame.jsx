import { useState, useEffect } from "react";
import "./CookingGame.css";
import backgroundImage from "../../assets/images/CookingGame_Bg.png";
import foodNamePlaceholder from "../../assets/images/strawberryCake.png";
import GameRecordBtn from "./GameRecordBtn";
import PausePopup from "../../components/popup/PausePopup";
import { useNavigate } from "react-router-dom";
import { springApi } from "../../utils/api"; // API 인스턴스 사용

const CookingGame = () => {
  const [timeLeft, setTimeLeft] = useState(60); // 타이머 초
  const [isTimerActive, setIsTimerActive] = useState(true); // 타이머 활성화 여부
  const [gameData, setGameData] = useState({
    foodName: '',
    item1: null,
    item2: null,
    itemList: [],
    imageData: '',
  });
  const [foodImg, setFoodImg] = useState({
    food: '',
    item1: '',
    item2: '',
  });
  const [audioBlob, setAudioBlob] = useState(null); // 🎤 녹음된 오디오 저장
  const [isCheckingAnswer, setIsCheckingAnswer] = useState(false); // 정답 검증 중 여부
  const navigate = useNavigate();

  // ✅ AI 인식 결과 업데이트 함수
  const handleAccuracyUpdate = ({ recognizedText }) => {
    console.log("🎯 AI 인식 결과 반영:", recognizedText);

    // 기존 선택된 item1이 없으면 item1에 할당, 이미 있으면 item2로 설정
    setGameData((prevState) => {
      if (!prevState.item1) {
        return { ...prevState, item1: recognizedText };
      } else if (!prevState.item2) {
        return { ...prevState, item2: recognizedText };
      }
      return prevState;
    });
  };

  // ✅ 녹음된 오디오 저장 (GameRecordBtn에서 전달됨)
  const handleAudioCapture = (blob) => {
    console.log("🎤 오디오 캡처 완료:", blob);
    setAudioBlob(blob);
  };


  // ✅ 정답 확인 API 요청 (수동 버튼 클릭)
  const checkAnswer = async () => {
    if (!gameData.item1 || !gameData.item2) return; // 두 개의 재료가 모두 선택되지 않았다면 실행 X

    setIsCheckingAnswer(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Access Token이 없습니다. 로그인하세요.");

      const formData = new FormData();
      formData.append("foodName", gameData.foodName || "");
      formData.append("item1", gameData.item1 || "");
      formData.append("item2", gameData.item2 || "");

      // 🎤 오디오 파일 확인 후 추가
      if (audioBlob) {
        formData.append("audio", audioBlob, "recording.wav");
      } else {
        console.warn("🚨 오디오 파일이 없습니다. 음성 데이터를 포함하지 않고 전송합니다.");
      }

      // ✅ FormData 내부 확인
      console.log("📤 전송할 FormData:");
      for (let pair of formData.entries()) {
          console.log(`${pair[0]}:`, pair[1]);
      }

      console.log("📤 전송할 FormData:", {
        foodName: gameData.foodName,
        item1: gameData.item1,
        item2: gameData.item2,
        audio: audioBlob ? "✅ 있음" : "❌ 없음",
      });

      const response = await springApi.post("/cook-game/is-correct", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      const result = response.data;
      console.log("✅ 정답 검증 결과:", result);

      if (result.ifCorrect) {
        console.log("🎉 정답입니다!");
        setTimeout(() => {
          newFood(); // 정답이면 새로운 요리 시작
        }, 1000);
      } else {
        console.log("❌ 오답입니다. 다시 시도하세요.");
      }
    } catch (error) {
      console.log("❌ 정답 확인 API 오류:", error);
    } finally {
      setIsCheckingAnswer(false);
    }
  };


  // ✅ 새로운 요리 게임 데이터 요청
  const newFood = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Access Token이 없습니다. 로그인하세요.");

      const response = await springApi.post(
        "/cook-game/start-game",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      const result = response.data;
      console.log('Base64 데이터:', result.image_data.substring(0, 30) + '...');

      const blob = base64ToBlob(result.image_data, 'image/png');
      const url = URL.createObjectURL(blob);

      setGameData({
        foodName: result.food_name || '',
        item1: null,
        item2: null,
        itemList: result.food_items,
        imageData: url,
      });

      setFoodImg({ food: url });
      setAudioBlob(null); // 새로운 문제 시작 시 오디오 초기화
    } catch (error) {
      console.log('게임 시작 데이터 로드 실패:', error);
    }
  };

  // ✅ 타이머 설정
  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timerId);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
    }
  }, [isTimerActive, timeLeft]);

  // ✅ 게임 시작 (한 번만 실행)
  useEffect(() => {
    newFood();
  }, []);

    // ✅ gameData.item1, gameData.item2 변경 시에만 로그 출력
    useEffect(() => {
        console.log(`🛠 선택된 재료 업데이트 - item1: ${gameData.item1}, item2: ${gameData.item2}`);
    }, [gameData.item1, gameData.item2]);

  // ✅ 글자 색상 변경 함수
  const getItemStyle = (item) => {
    if (item === gameData.item1 || item === gameData.item2) {
      return { color: 'red', fontWeight: 'bold' };
    }
    return {};
  };

  // ✅ Base64 → Blob 변환 함수
  const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  return (
    <div
      className="cooking-game-container"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="game-overlay">
        <PausePopup onExit={() => navigate("/wgame")} />
        <h2 className="game-title">{gameData.foodName || "요리 게임"}</h2>
        <div>남은 시간: {timeLeft}초</div>
        <div className="combination">
          <span className="plus-sign">+</span>
          <span className="equals-sign">=</span>
          <img src={foodImg.food || foodNamePlaceholder} alt="결과" className="item-icon" />
        </div>
        <div className="item-selection">
          {gameData.itemList.map((item, index) => (
            <button key={index} style={getItemStyle(item)}>
              {item}
            </button>
          ))}
        </div>
        <GameRecordBtn 
          onAccuracyUpdate={handleAccuracyUpdate}
          pronunciation={gameData.foodName}
          gameData={gameData}
          onAudioCapture={handleAudioCapture}
        />
        
        {/* ✅ 정답 확인 버튼 추가 */}
        <button 
          onClick={checkAnswer} 
          disabled={!gameData.item1 || !gameData.item2 || isCheckingAnswer}
          className="check-answer-btn"
        >
          {isCheckingAnswer ? "검사 중..." : "정답 확인"}
        </button>
      </div>
    </div>
  );
};

export default CookingGame;
