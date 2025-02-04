import { useState, useRef, useEffect } from "react";
import "./CookingGame.css";
import backgroundImage from "../../assets/images/CookingGame_Bg.png";
import foodNamePlaceholder from "../../assets/images/strawberryCake.png";
import GameRecordBtn from "../../components/button/RecordButton";
import PausePopup from "../../components/popup/PausePopup";
import { useNavigate } from "react-router-dom";
import { springApi } from "../../utils/api"; // API 인스턴스 사용

const CookingGame = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [gameData, setGameData] = useState({
    foodName: "",
    item1: null,
    item2: null,
    itemList: [],
    imageData: "", // pickFood()에서 받아온 음식 이미지의 Blob URL
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

  // Base64 문자열을 Blob으로 변환하는 도우미 함수
  const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  // 백엔드의 pickFood() 메서드 호출: 음식 이름, 재료 목록, 그리고 이미지 데이터를 가져옴
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

      // 백엔드에서는 FoodResponse의 image_data 필드에 byte[] 데이터가
      // Jackson에 의해 Base64 문자열로 전송됩니다.
      const base64Image = response.data.image_data;
      const blob = base64ToBlob(base64Image, "image/png");
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
        item1: "",
        item2: "",
      });
    } catch (error) {
      console.error("게임 시작 데이터 로드 실패:", error);
    }
  };

  // 음성 녹음 시작
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

  // 음성 녹음 종료
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearTimeout(recordingTimeoutRef.current);
    }
  };

  // 서버에 음성 데이터 전송 후 인식된 단어로 자동 선택
  const sendAudioToServer = async (audioBlob) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Access Token이 없습니다. 로그인하세요.");

      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.wav"); // 파일명 지정
  
      const response = await springApi.post("/cook-game/is-correct", formData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
  
      if (response.data) {
        console.log("✅ AI 분석 응답:", response.data);
  
        // 백엔드에서 반환된 음성 인식 결과
        const recognizedText = response.data.recognized_text;
  
        if (recognizedText) {
          // 현재 게임의 아이템 목록에서 인식된 단어가 존재하는지 확인
          const matchedItem = gameData.itemList.find((item) => item === recognizedText);
  
          if (matchedItem) {
            console.log(`🎯 '${matchedItem}' 자동 선택됨`);
            handleSelectItem(matchedItem); // 자동 선택 처리
          } else {
            console.log(`❌ '${recognizedText}'이(가) 현재 아이템 목록에 없음`);
          }
        }
  
        // 이미지 데이터 처리 (정답에 따른 이미지 업데이트)
        if (response.data.image_data) {
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
      }
    } catch (error) {
      console.error("오디오 업로드 오류:", error);
    }
  };

  // 선택한 아이템에 해당하는 이미지를 가져옴
  const handleSelectItem = async (item) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Access Token이 없습니다. 로그인하세요.");

      // 여기서 아이템 이미지 요청 엔드포인트로 "/cook-game/start-game"을 사용 (설계상 맞다고 가정)
      const response = await springApi.post(
        "/cook-game/start-game",
        { item_name: item },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (!response.data || !response.data.image_data) {
        throw new Error("이미지 데이터를 불러오지 못했습니다.");
      }
      console.log(`아이템 이미지 데이터 (${item}):`, response.data);

      // 받은 Base64 문자열을 Blob URL로 변환
      const blob = base64ToBlob(response.data.image_data, "image/png");
      const url = URL.createObjectURL(blob);

      // 아직 item1이 없으면 item1로, 그렇지 않으면 item2로 저장
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

  // 컴포넌트 마운트 시 게임 데이터 로드 (pickFood() 호출)
  useEffect(() => {
    fetchGameData();
  }, []);

  // 두 재료 모두 선택되면 1초 후에 새로운 음식 데이터를 로드
  useEffect(() => {
    if (gameData.item2 !== null) {
      setTimeout(() => {
        fetchGameData();
      }, 1000);
    }
  }, [gameData.item2]);

  // 타이머 설정: 시간이 0이 되면 타이머 중지 및 녹음 종료
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
        <GameRecordBtn onClick={isRecording ? stopRecording : startRecording} />
      </div>
    </div>
  );
};

export default CookingGame;
