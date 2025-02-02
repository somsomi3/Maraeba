import { useState, useRef, useEffect } from 'react';

const FindGame = () => {
  const [isRecording, setIsRecording] = useState(false); // 녹음 중인지 여부
  const [gameData, setGameData] = useState({
    imageNumber: '',
    imageData: [],
    answerList: [],
    circleData: [],
  });

  const mediaRecorderRef = useRef(null); // MediaRecorder 참조
  const audioChunksRef = useRef([]); // 녹음된 음성 데이터 조각
  const recordingTimeoutRef = useRef(null); // 녹음 타임아웃 관리

  const imageContainerRef = useRef(null); // 이미지 컨테이너 참조
  const imageRef = useRef(null); // 이미지 참조

  // 이미지 크기 비율 계산
  const getImageScale = () => {
    const image = imageRef.current;
    if (!image) return { scaleX: 1, scaleY: 1 };

    const imgWidth = image.naturalWidth;
    const imgHeight = image.naturalHeight;

    const containerWidth = image.clientWidth;
    const containerHeight = image.clientHeight;

    const scaleX = containerWidth / imgWidth;
    const scaleY = containerHeight / imgHeight;

    return { scaleX, scaleY };
  };

  // 비례적으로 동그라미 위치 계산 (비율 기반)
  const calculateAdjustedPosition = (x, y) => {
    const image = imageRef.current;
    if (!image) return { x: 0, y: 0 };

    const imgWidth = image.naturalWidth; // 원본 이미지 너비
    const imgHeight = image.naturalHeight; // 원본 이미지 높이

    return {
      x: (x / imgWidth) * 100, // % 변환
      y: (y / imgHeight) * 100, // % 변환
    };
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
  const sendAudioToServer = async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio'); // 'audio/webm' 형식으로 보내기
    formData.append('imageNumber', gameData.imageNumber);
    if (gameData.answerList)
      formData.append('answerList', JSON.stringify(gameData.answerList));
    try {
      const response = await fetch(
        'http://localhost:8081/wgames/find-animal/is-correct',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log(result);
        if (result.if_correct) {
          // gameData.answerList에 동물 이름 추가
          setGameData((prevState) => ({
            ...prevState,
            answerList: Array.isArray(prevState.answerList)
              ? [...prevState.answerList, gameData.animal_name]
              : [gameData.animal_name],
            circleData: Array.isArray(prevState.circleData)
              ? [...prevState.circleData, { x: result.x, y: result.y }]
              : [{ x: result.x, y: result.y }], // 배열이 아니라면 새로운 배열로 설정
          }));

          //정답이 5개라고 가정
          if (result.cnt == 5) {
            startGame;
          }
        }
      } else {
        console.error('파일 업로드 실패');
      }
    } catch (error) {
      console.error('파일 업로드 오류:', error);
    }
  };

  //게임 시작
  const startGame = async () => {
    try {
      const response = await fetch(
        'http://localhost:8081/wgames/find-animal/start-game',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      );

      const data = await response.json();
      console.log('응답 데이터: ', data);

      if (!data.image_data) {
        console.error('image_data가 없습니다.');
        return;
      }

      console.log('Base64 데이터: ', data.image_data.substring(0, 30) + '...'); // 일부만 출력

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

      // 변환 실행 (PNG 이미지로 가정)
      const blob = base64ToBlob(data.image_data, 'image/png');
      const url = URL.createObjectURL(blob);
      console.log('생성된 이미지 URL:', url);

      setGameData({
        imageNumber: data.image_number,
        imageData: url,
      });
    } catch (error) {
      console.error('게임 시작 오류:', error);
    }
  };

  useEffect(() => {
    startGame();
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh',
        position: 'relative',
      }}
    >
      <div
        ref={imageContainerRef}
        style={{
          position: 'relative',
          display: 'inline-block',
          maxWidth: '90%',
          maxHeight: '80vh',
          border: '2px solid black',
          borderRadius: '10px',
        }}
      >
        {gameData.imageData ? (
          <img
            ref={imageRef}
            src={gameData.imageData}
            alt='Game Image'
            style={{
              maxWidth: '100%', // 부모 컨테이너보다 커지지 않도록 제한
              maxHeight: '80vh', // 화면 높이를 넘지 않도록 제한
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              display: 'block', // 하단 여백 제거
              margin: '0 auto', // 중앙 정렬
            }}
          />
        ) : (
          <p>이미지를 불러오는 중...</p>
        )}

        {/* 동그라미 표시 */}
        {Array.isArray(gameData.circleData) &&
          gameData.circleData.map((circle, index) => {
            const { x, y } = calculateAdjustedPosition(circle.x, circle.y);
            return (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  top: `${y}%`,
                  left: `${x}%`,
                  width: '4%', // 크기 조정
                  height: '4%',
                  border: '3px solid red', // 테두리만 보이게 설정
                  borderRadius: '50%', // 원 모양 유지
                  backgroundColor: 'transparent', // 가운데 비우기
                  transform: 'translate(-50%, -50%)',
                }}
              ></div>
            );
          })}
      </div>

      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? '녹음 종료' : '녹음 시작'}
      </button>
    </div>
  );
};

export default FindGame;
