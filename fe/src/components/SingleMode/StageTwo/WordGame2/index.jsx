import { useState, useRef, useEffect } from "react";
const FindGame = () => {
    const [isRecording, setIsRecording] = useState(false); // 녹음 중인지 여부
    const [imageUrl, setImageUrl] = useState(null);
    const [gameData, setGameData] = useState({
        imageNumber: "",
        imageData: [],
    });

        const mediaRecorderRef = useRef(null); // MediaRecorder 참조
        const audioChunksRef = useRef([]); // 녹음된 음성 데이터 조각
        const recordingTimeoutRef = useRef(null); // 녹음 타임아웃 관리

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
                        type: "audio/webm",
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
                console.error("마이크 권한 요청 실패:", error);
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
            formData.append("audio", audioBlob, "audio"); // 'audio/webm' 형식으로 보내기
    
            // 게임 시작 시 받은 데이터 추가
            if (gameData.foodName) formData.append("foodName", gameData.foodName);
            if (gameData.item1) formData.append("item1", gameData.item1);
            if (gameData.item2) formData.append("item2", gameData.item2);
            try {
                const response = await fetch(
                    "http://localhost:8081/maraeba/wgames/find-animal/is-correct",
                    {
                        method: "POST",
                        body: formData,
                    }
                );
    
                if (response.ok) {
                    const result = await response.json();
                    console.log('정답 검증 응답: ', result.item);
                    if (result.if_correct) {
                        if (result.cnt === 1) {
                            setGameData((prevState) => ({
                                ...prevState,
                                item1: result.item,
                            }));
                        } else {
                            setGameData((prevState) => ({
                                ...prevState,
                                item2: result.item,
                            }));
                        }
                    }
                } else {
                    console.error("파일 업로드 실패");
                }
            } catch (error) {
                console.error("파일 업로드 오류:", error);
            }
        };

    //게임 시작
    const startGame = async () => {
        try {
            const response = await fetch(
                "http://localhost:8081/maraeba/wgames/find-animal/start-game",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({})
                }
            );

            const data = await response.json();
            console.log("응답 데이터: ", data);

            if (!data.image_data) {
                console.error("image_data가 없습니다.");
                return;
            }

            console.log("Base64 데이터: ", data.image_data.substring(0, 30) + "..."); // 일부만 출력

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
            const blob = base64ToBlob(data.image_data, "image/png");
            const url = URL.createObjectURL(blob);
            console.log("생성된 이미지 URL:", url);
            setImageUrl(url);
        } catch (error) {
            console.error("게임 시작 오류:", error);
        }
    };

    useEffect(() => {
        startGame();
    }, []);

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
            {imageUrl ? (
                <img 
                    src={imageUrl} 
                    alt="Game Image" 
                    style={{ 
                        maxWidth: "90%",  // 가로 크기를 화면 크기 대비 90%로 제한
                        maxHeight: "80vh", // 세로 크기를 화면 높이의 80%로 제한
                        objectFit: "contain", // 비율 유지하면서 축소
                        border: "2px solid black", // 테두리 추가 (선택 사항)
                        borderRadius: "10px" // 모서리 둥글게 (선택 사항)
                    }} 
                />
            ) : (
                <p>이미지를 불러오는 중...</p>
            )}
                        <button
                onClick={isRecording ? stopRecording : startRecording}
            >
                {isRecording ? "녹음 종료" : "녹음 시작"}
            </button>
        </div>
    );
    
};

export default FindGame;
