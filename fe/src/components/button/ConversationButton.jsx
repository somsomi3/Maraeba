import { useState } from "react";
import PropTypes from "prop-types"; // ✅ PropTypes 추가
import recordbtn from "../../assets/icons/record.png";
import pausebtn from "../../assets/icons/pause.png";
import stopbtn from "../../assets/icons/stop.png";

const ConversationButton = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingIcon, setRecordingIcon] = useState(recordbtn);
  let mediaRecorder;
  let audioChunks = [];

  // 🔥 녹음 시작 & 중지
  const toggleRecording = async () => {
    if (!isRecording) {
      // ✅ 녹음 시작
      setIsRecording(true);
      setRecordingIcon(pausebtn);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioFile = new Blob(audioChunks, { type: 'audio/webm' });
        console.log("🎤 녹음된 파일:", audioFile);
        setRecordingIcon(stopbtn);
        onRecordingComplete(audioFile); // ✅ 녹음된 파일을 부모 컴포넌트로 전달
      };

      mediaRecorder.start();
    } else {
      // ✅ 녹음 중지
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  return (
    <img 
      src={recordingIcon} 
      alt="녹음 버튼" 
      className={`record-button ${isRecording ? 'recording' : ''}`} 
      onClick={toggleRecording} 
    />
  );
};

ConversationButton.propTypes = {
  onRecordingComplete: PropTypes.func.isRequired, // ✅ 녹음된 파일을 처리할 함수
};

export default ConversationButton;
