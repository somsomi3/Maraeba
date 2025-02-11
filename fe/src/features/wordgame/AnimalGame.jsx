import { useState, useRef, useEffect } from 'react';
import { springApi } from "../../utils/api"; // API 인스턴스 사용
import backgroundImage from "../../assets/background/animal_bg.png";
import { useSelector } from 'react-redux'; // ✅ Redux에서 토큰 가져오기
import HomeButton from "../../components/button/HomeButton";
import "./AnimalGame.css";
import recordIcon from "../../assets/icons/record.png";
import stopIcon from "../../assets/icons/pause.png";

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

  const base64ToBlob = (base64, mimeType) => {
    try {
        // ✅ Base64  형식이 맞는지 확인
        if (!base64 || typeof base64 !== "string") {
            throw new Error("Base64 데이터가 올바르지 않습니다.");
        }

        // ✅ Base64 포맷 검사 및 공백 제거
        base64 = base64.replace(/\s/g, ""); // 공백 제거
        if (!/^data:image\/(png|jpeg|jpg);base64,/.test(base64)) {
            base64 = `data:image/png;base64,${base64}`; // PNG 형식으로 변환
        }

        const byteCharacters = atob(base64.split(",")[1]); // ✅ atob() 적용
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    } catch (error) {
        console.error("Base64 디코딩 오류:", error);
        return null;
    }
};

const startGame = async () => {
    try {
      const response = await springApi.post('/wgames/find-animal/start-game', {}, {
          headers: {
              Authorization: `Bearer ${token}`, // ✅ Redux에서 가져온 토큰 사용
          },
          withCredentials: true, 
      });
        console.log("🔍 Response 객체:", response);  
        const data = response.data;
        console.log("응답 데이터:", data);

        if (!data.image_data) {
            throw new Error("imageData가 올바르지 않습니다.");
        }

        // 1️⃣ Base64 데이터 앞뒤 공백 제거
        const cleanBase64 = data.image_data?.replace(/\s/g, "") || "";

        // 2️⃣ 데이터 URL로 변환
        const imageUrl = `data:image/png;base64,${cleanBase64}`;
        console.log("생성된 이미지 URL:", imageUrl);

        setGameData({
            imageNumber: data.image_number,
            imageData: imageUrl,
        });
    } catch (error) {
        console.error("게임 시작 오류:", error);
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
      }, 10000);
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

        // ✅ 이미 존재하는 정답인지 프론트에서도 중복 체크 (추가적인 보안)
        if (currentAnswerList.includes(result.animal_name)) {
            alert(`⚠️ 이미 맞춘 정답입니다: ${result.animal_name}`);
            return;
        }

        if (result.if_correct) {
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
                startGame(); // 새로운 게임 시작
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

  return (
    <div className="animal-game-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      
      {/* ✅ 홈 버튼 */}
      <HomeButton />
  
      {/* ✅ 게임 오버레이 추가 */}
      <div className="animal-game-overlay">
        
        {/* 🎯 게임 제목 */}
        <h1 className="animal-game-title">어떤 동물이 있을까?</h1>
  
        {/* ✅ 이미지 & 동물 리스트를 가로 정렬 (3:1 비율) */}
        <div className="animal-game-content">
          {/* 🎨 동물 찾기 이미지 */}
          <div className="image-container">
            {gameData.imageData && <img src={gameData.imageData} alt="Game Image" className="animal-game-image" />}
            {(gameData.circleData || []).map((circle, index) => (
              <div
                key={index}
                className="circle-marker"
                style={{
                  position: "absolute",
                  top: `${circle.y}px`,
                  left: `${circle.x}px`,
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  border: "3px solid red",
                  backgroundColor: "transparent",
                }}
              ></div>
            ))}
          </div>
  
          {/* 📝 동물 리스트 */}
          <div className="animal-list">
            <h3>음성으로 동물을 맞춰보세요! 🎤</h3>
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
  
        {/* 🎤 녹음 버튼 */}
        <button
          className="record-button"
          onClick={isRecording ? stopRecording : startRecording}
        >
          <img src={isRecording ? stopIcon : recordIcon} alt="녹음 버튼" className="record-icon" />
        </button>
        
      </div> {/* game-overlay 끝 */}
    </div>
  );
  
  
};

export default AnimalGame;