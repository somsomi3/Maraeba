import { useState, useRef, useEffect } from 'react';
import './CookingGame.css';
import backgroundImage from "../../assets/images/CookingGame_Bg.png";
import PausePopup from "../../components/popup/PausePopup";
import { useNavigate } from "react-router-dom";
import { springApi } from "../../utils/api";
import recordIcon from "../../assets/icons/record.png";
import stopIcon from "../../assets/icons/pause.png";

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
  const sendAudioToServer = async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio'); // 'audio/webm' 형식으로 보내기

    // 게임 시작 시 받은 데이터 추가
    if (gameData.foodName) formData.append('foodName', gameData.foodName);
    if (gameData.item1) formData.append('item1', gameData.item1);
    if (gameData.item2) formData.append('item2', gameData.item2);
    try {
        const token = localStorage.getItem("token");
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

        if (result.if_correct) {
          // 변환 실행 (PNG 이미지로 가정)
          const blob = base64ToBlob(result.image_data, 'image/png');
          const url = URL.createObjectURL(blob);

          if (result.cnt === 1) {
            setGameData((prevState) => ({
              ...prevState,
              item1: result.item,
            }));

            setFoodImg((prevState) => ({
              ...prevState,
              item1: url,
            }));
          } else {
            setGameData((prevState) => ({
              ...prevState,
              item2: result.item,
            }));

            setFoodImg((prevState) => ({
              ...prevState,
              item2: url,
            }));
          }
        }
      } else {
        console.error('파일 업로드 실패');
      }
    } catch (error) {
      console.error('파일 업로드 오류:', error);
    }
  };

  // 게임 시작 POST 요청
  const newFood = async () => {
    try {
      const response = await springApi.post(
        'cook-game/start-game',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const result = response.data;

      console.log(
        'Base64 데이터: ',
        result.image_data.substring(0, 30) + '...'
      ); // 일부만 출력

      // 변환 실행 (PNG 이미지로 가정)
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
    <div className="cooking-game-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="game-overlay">
      <button className="pause-button">
        <PausePopup onExit={() => navigate("/wgame")}/>
      </button>

      <h1 className="game-title">{gameData.foodName || "요리 만들기"}</h1>
      <div>남은 시간: {timeLeft}초</div>
      <div className="combination">

        {foodImg.item1 ? (
            <img src={foodImg.item1} alt="재료1" className="recipe-image" />
        ) : (
            <div className="placeholder"></div> // 🔥 추가된 부분: 이미지가 없으면 빈 div로 대체
        )}
        <span className="plus-sign">+</span>
       
        {foodImg.item2 ? (
            <img src={foodImg.item2} alt="재료2" className="recipe-image" />
        ) : (
            <div className="placeholder"></div> // 🔥 추가된 부분: 이미지가 없으면 빈 div로 대체
        )}


        <span className="equals-sign">=</span>
        <img src={foodImg.food} alt="결과 음식" className="recipe-image" />
      </div>

      <div className="item-selection">
        {gameData.itemList.map((item, index) => (
          <button key={index} className={item === gameData.item1 || item === gameData.item2 ? "selected" : ""}>
          {item}
        </button>
        ))}
      </div>

      <button
        className="record-button"
        disabled={!isTimerActive}
        onClick={isRecording ? stopRecording : startRecording}
      >
        <img src={isRecording ? stopIcon : recordIcon} alt="녹음 버튼" className="record-icon" />
      </button>
      <button 
      className="start-button"
      disabled={isTimerActive} 
      onClick={restart}>
        게임 시작
      </button>
      {audioURL && (
        <div>
          <h2>녹음된 오디오</h2>
          <audio controls src={audioURL}></audio>
          <p>외부 오디오 URL: {audioURL}</p>
        </div>
      )}
    </div>
    </div>
  );
};

export default CookingGame;
