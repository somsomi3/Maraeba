import { useState, useRef, useEffect } from "react";
import "./CookingGame.css";
import backgroundImage from "../../assets/images/CookingGame_Bg.png";
import foodNamePlaceholder from "../../assets/images/strawberryCake.png";
import GameRecordBtn from "./GameRecordBtn";
import PausePopup from "../../components/popup/PausePopup";
import { useNavigate } from "react-router-dom";
import { springApi } from "../../utils/api"; // API 인스턴스 사용

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
  const mediaRecorderRef = useRef(null); // MediaRecorder 참조
  const audioChunksRef = useRef([]); // 녹음된 음성 데이터 조각
  const recordingTimeoutRef = useRef(null); // 녹음 타임아웃 관리
  const navigate = useNavigate();
  const handleAccuracyUpdate = ({ recognizedText, accuracy }) => {
    console.log("🎯 AI 분석 결과:", accuracy);
    console.log("🎯 AI 인식 결과 반영:", recognizedText);

    // 기존 선택된 item1이 없으면 item1에 할당, 이미 있으면 item2로 설정
    setGameData((prevState) => ({
        ...prevState,
        item1: prevState.item1 || recognizedText,
        item2: prevState.item1 ? recognizedText : prevState.item2,
    }));
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

      // 10초 후에 자동으로 녹음 종료
      recordingTimeoutRef.current = setTimeout(() => {
        stopRecording();
      }, 10000); // 10초 후에 자동 종료
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
  const updateGameData = (newItem) => {
    setGameData((prevState) => {
        let updatedState;

        if (!prevState.item1) {
            updatedState = { ...prevState, item1: newItem };
        } else if (!prevState.item2) {
            updatedState = { ...prevState, item2: newItem };
        } else {
            updatedState = prevState; // item1, item2가 이미 채워져 있으면 변경 없음
        }

        console.log("🛠 업데이트된 gameData:", updatedState);
        return updatedState;
    });
};

const cleanItemText = (item) => {
    if (!item) {
        console.log("🧐 cleanItemText: item이 null 또는 undefined입니다.");
        return ""; // item이 없을 경우 빈 문자열 반환
    }
    const halfLength = Math.ceil(item.length / 2);
    const cleanedText = item.substring(0, halfLength);
    console.log(`🧼 cleanItemText 변환: 원본="${item}", 변환 결과="${cleanedText}"`);
    return cleanedText;
};

const sendAudioToServer = async (audioBlob) => {
    console.log("🎤 STT 변환을 위해 오디오 데이터 전송...");

    const formData = new FormData();
    formData.append("audio", new File([audioBlob], "recorded-audio.webm", { type: "audio/webm" }));

    console.log("📤 최종 전송할 FormData:", [...formData.entries()]);

    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Access Token이 없습니다. 로그인하세요.");

        // 백엔드로 전송하여 STT 변환된 결과 받기
        const response = await springApi.post("/cook-game/is-correct", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
        });

        const result = response.data;
        console.log("🎯 백엔드 응답 데이터 (STT 변환 결과 포함):", result);

        if (result.item) {
            console.log("✅ STT 변환 결과 반영:", result.item);

            // gameData를 백엔드 응답을 기반으로 업데이트
            setGameData((prevState) => {
                const updatedState = { 
                    ...prevState,
                    item1: prevState.item1 ? prevState.item1 : result.item,
                    item2: prevState.item1 ? result.item : prevState.item2
                };
                console.log("🛠 업데이트된 gameData:", updatedState);
                return updatedState;
            });
        }
    } catch (error) {
        console.error("❌ STT 변환 실패:", error);
        if (error.response) {
            console.error("📢 서버 응답 데이터:", error.response.data);
        }
    }
};





  // 게임 시작 POST 요청
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

        const result = response.data; // ✅ Fix: Axios returns data directly

        console.log(
            'Base64 데이터: ',
            result.image_data.substring(0, 30) + '...'
        );

        const blob = base64ToBlob(result.image_data, 'image/png');
        const url = URL.createObjectURL(blob);

        setGameData({
            foodName: result.food_name || '',
            item1: null,
            item2: null,
            itemList: result.food_items,
            imageData: url,
        });

        setFoodImg({
            food: url,
        });
    } catch (error) {
        console.log('게임 시작 데이터 로드 실패:', error);
    }
};


  // 타이머 설정
  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1); // 1초 감소
      }, 1000);

      return () => clearInterval(timerId); // 정리
    } else if (timeLeft === 0) {
      setIsTimerActive(false); // 타이머 종료
      stopRecording(); // 녹음 종료
    }
  }, [isTimerActive, timeLeft]);

  // 초기 게임 시작 (한 번만 실행)
  useEffect(() => {
    newFood();
  }, []);

  // 다음 음식
  useEffect(() => {
    if (gameData.item2 !== null) {
      const timeoutId = setTimeout(() => {
        newFood();
      }, 1000); // 1초 후에 newFood() 실행

      // 컴포넌트가 언마운트되거나 item2가 null로 변경되면 타이머 클리어
      return () => clearTimeout(timeoutId);
    }
  }, [gameData.item2]);

  // 게임 재시작
  const restart = () => {
    setTimeLeft(60); // 타이머 초기화
    setAudioURL('');
    setIsTimerActive(true); // 타이머 활성화
    newFood(); // 게임 다시 시작
  };

  // 재료 글씨 색 변경
  const getItemStyle = (item) => {
    if (item === gameData.item1 || item === gameData.item2) {
      return { color: 'red' }; // item1 또는 item2에 해당하는 재료는 빨간색
    }
    return {};
  };

  // Base64 → Blob 변환 함수
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
          {foodImg.item1 && (
            <img src={foodImg.item1} alt="재료 1" className="item-icon" />
          )}
          <span className="plus-sign">+</span>
          {foodImg.item2 && (
            <img src={foodImg.item2} alt="재료 2" className="item-icon" />
          )}
          <span className="equals-sign">=</span>
          {/* 최종 결과 이미지: pickFood()로 받아온 이미지 */}
          <img src={foodImg.food || foodNamePlaceholder} alt="결과" className="item-icon" />
        </div>
        <div className="item-selection">
          {gameData.itemList.map((item, index) => (
            <button key={index} onClick={() => handleSelectItem(item)}>
              {item}
            </button>
          ))}
        </div>
        <GameRecordBtn 
        onClick={isRecording ? stopRecording : startRecording}
        onAccuracyUpdate={handleAccuracyUpdate}
        pronunciation={gameData.foodName}   />
      </div>
    </div>
  );
};

export default CookingGame;

