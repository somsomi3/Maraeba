import { useState, useRef, useEffect } from "react";
import "./CookingGame.css";
import backgroundImage from "../../assets/images/CookingGame_Bg.png";
import foodNamePlaceholder from "../../assets/images/strawberryCake.png";
import RecordButton from "../../components/button/RecordButton";
import PausePopup from "../../components/popup/PausePopup";
import { useNavigate } from "react-router-dom";
import { springApi } from "../../utils/api"; // ✅ API 인스턴스 사용

const CookingGame = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [gameData, setGameData] = useState({
    foodName: "",
    item1: null,
    item2: null,
    itemList: [],
    imageData: "",
  });
  const [foodImg, setFoodImg] = useState({
    food: "",
    item1: "",
    item2: "",
  });

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimeoutRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Base64 → Blob 변환 (도우미 함수)
  const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  // ✅ 게임 데이터 가져오기 (JWT 인증 포함)
  const fetchGameData = async () => {
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

      if (!response.data) throw new Error("응답 데이터가 없습니다.");
      console.log("서버 응답 데이터:", response.data);

      // Base64 → Blob 변환 후 URL 생성
      const blob = base64ToBlob(response.data.image_data, "image/png");
      const url = URL.createObjectURL(blob);

      setGameData({
        foodName: response.data.food_name || "",
        item1: null,
        item2: null,
        itemList: response.data.food_items,
        imageData: url,
      });

      setFoodImg({
        food: url,
      });
    } catch (error) {
      console.error("게임 시작 데이터 로드 실패:", error);
    }
  };

  // ✅ 음성 녹음 시작
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        audioChunksRef.current = [];
        await sendAudioToServer(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      recordingTimeoutRef.current = setTimeout(() => {
        stopRecording();
      }, 10000);
    } catch (error) {
      console.error("마이크 권한 요청 실패:", error);
    }
  };

  // ✅ 녹음 종료
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearTimeout(recordingTimeoutRef.current);
    }
  };

  // ✅ 서버에 음성 데이터 전송 (JWT 인증 포함)
  const sendAudioToServer = async (audioBlob) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Access Token이 없습니다. 로그인하세요.");

      const formData = new FormData();
      formData.append("audio", audioBlob, "audio");

      if (gameData.foodName) formData.append("foodName", gameData.foodName);
      if (gameData.item1) formData.append("item1", gameData.item1);
      if (gameData.item2) formData.append("item2", gameData.item2);

      const response = await springApi.post("/cook-game/is-correct", formData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (response.data) {
        console.log("응답 데이터:", response.data);

        // Base64 → Blob 변환 후 URL 생성
        const blob = base64ToBlob(response.data.image_data, "image/png");
        const url = URL.createObjectURL(blob);

        if (response.data.cnt === 1) {
          setGameData((prevState) => ({
            ...prevState,
            item1: response.data.item,
          }));
          setFoodImg((prevState) => ({
            ...prevState,
            item1: url,
          }));
        } else {
          setGameData((prevState) => ({
            ...prevState,
            item2: response.data.item,
          }));
          setFoodImg((prevState) => ({
            ...prevState,
            item2: url,
          }));
        }
      }
    } catch (error) {
      console.error("오디오 업로드 오류:", error);
    }
  };

  const handleSelectItem = async (item) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Access Token이 없습니다. 로그인하세요.");
  
      const response = await springApi.get("/cook-game/get-item-image", {
        params: { itemName: item },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
  
      if (!response.data) throw new Error("이미지 데이터를 불러오지 못했습니다.");
      console.log(`이미지 데이터 (${item}):`, response.data);
  
      // ✅ Base64 → Blob 변환 후 URL 생성
      const blob = base64ToBlob(response.data.image_data, "image/png");
      const url = URL.createObjectURL(blob);
  
      // ✅ 선택된 아이템을 item1 또는 item2로 저장
      if (!gameData.item1) {
        setGameData((prevState) => ({
          ...prevState,
          item1: item,
        }));
        setFoodImg((prevState) => ({
          ...prevState,
          item1: url,
        }));
      } else if (!gameData.item2) {
        setGameData((prevState) => ({
          ...prevState,
          item2: item,
        }));
        setFoodImg((prevState) => ({
          ...prevState,
          item2: url,
        }));
      }
    } catch (error) {
      console.error("아이템 이미지 불러오기 실패:", error);
    }
  };
  

  // ✅ 게임 초기화 (컴포넌트 마운트 시 게임 데이터 로드)
  useEffect(() => {
    fetchGameData();
  }, []);

  // ✅ 정답이 모두 맞춰지면 1초 후 다음 음식 데이터 로드
  useEffect(() => {
    if (gameData.item2 !== null) {
      setTimeout(() => {
        fetchGameData();
      }, 1000);
    }
  }, [gameData.item2]);

  // ✅ 타이머 설정
  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(timerId);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
      stopRecording();
    }
  }, [isTimerActive, timeLeft]);

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
          <img src={foodNamePlaceholder} alt="결과" className="item-icon" />
        </div>
        <div className="item-selection">
          {gameData.itemList.map((item, index) => (
            <button key={index} onClick={() => handleSelectItem(item)}>
              {item}
            </button>
          ))}
        </div>
        <RecordButton onClick={isRecording ? stopRecording : startRecording} />
      </div>
    </div>
  );
};

export default CookingGame;
