import { useState, useRef } from "react";
import "./RecordButton.css";
import recordIcon from "../../assets/icons/record.png"; // 녹음 시작 버튼 이미지
import pauseIcon from "../../assets/icons/pause.png"; // 녹음 중 버튼 이미지

const RecordButton = ({ onAccuracyUpdate }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        await analyzePronunciation(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("오디오 녹음 오류:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const analyzePronunciation = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");

    try {
      const response = await fetch("/ai/compare", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        onAccuracyUpdate(result.accuracy); // 서버에서 받은 정확도를 업데이트
      } else {
        console.error("AI 분석 실패");
      }
    } catch (error) {
      console.error("AI 요청 오류:", error);
    }
  };

  return (
    <button className="record-button" onClick={isRecording ? stopRecording : startRecording}>
      <img src={isRecording ? pauseIcon : recordIcon} alt="녹음 버튼" />
    </button>
  );
};

export default RecordButton;
