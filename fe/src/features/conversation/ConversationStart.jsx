// fe/src/features/conversation/ConversationStart.jsx 

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate 추가
import './ConversationStart.css';
import catAvatar from '../../assets/images/aiCat.png';
import smileAvatar from '../../assets/images/smile.png';
import micIcon from '../../assets/images/mic.png';
import stopIcon from '../../assets/images/stop.png';
import bunnyImage from '../../assets/images/bunny.png'; // 팝업 이미지 추가
import HomeButton from '../../components/button/HomeButton';

const ConversationStart = () => {
  const [isRecording, setIsRecording] = useState(false); // 녹음 상태
  const [recordingTime, setRecordingTime] = useState(0); // 녹음 시간
  const [showExitPopup, setShowExitPopup] = useState(false); // 종료 팝업 상태
  const navigate = useNavigate(); // useNavigate 사용

  const handleMicClick = () => {
    setIsRecording(true); // 녹음 시작
    setRecordingTime(0); // 녹음 시간 초기화
  };

  const handleStopClick = () => {
    setShowExitPopup(true); // 종료 팝업 띄우기
  };

  const handleExit = () => {
    setShowExitPopup(false); // 팝업 닫기
    navigate('/conversation'); // Conversation.jsx로 이동
  };

  const handleContinue = () => {
    setShowExitPopup(false); // 팝업 닫기
  };

  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
  };

  return (
    <div className="conversation-start-container">
      {/* 상대방 대화 */}
      <div className="conversation-row">
        <div className="avatar-container">
          <img src={catAvatar} alt="상대방" className="avatar" />
          <p className="role">상대의 역할 이름</p>
        </div>
        <div className="chat-bubble">
          와, 오늘 정말 비가 많이 온다! 그렇지?
        </div>
      </div>

      {/* 나의 대화 */}
      <div className="conversation-row self">
        <div className="chat-bubble self-bubble"></div>
        <div className="avatar-container">
          <img src={smileAvatar} alt="나" className="avatar" />
          <p className="role">아이 애칭</p>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="footer">
        <button className="mic-button" onClick={handleMicClick}>
          <img src={micIcon} alt="마이크" />
        </button>
      </div>

      {/* 정지 버튼 */}
      <button className="stop-button" onClick={handleStopClick}>
        <img src={stopIcon} alt="정지" />
      </button>

      {/* 녹음중 팝업 */}
      {isRecording && (
        <div className="popup">
          <p>녹음중...</p>
          <p>녹음 시간: {formatTime(recordingTime)}</p>
          <button className="popup-stop-button" onClick={() => setIsRecording(false)}>
            <img src={stopIcon} alt="정지" />
          </button>
        </div>
      )}

      {/* 종료 확인 팝업 */}
      {showExitPopup && (
        <div className="exit-popup">
          <h2>대화를 종료할까요?</h2>
          <img src={bunnyImage} alt="토끼" className="exit-popup-image" />
          <div className="exit-popup-buttons">
            <button className="continue-button" onClick={handleContinue}>
              계속하기
            </button>
            <button className="exit-button" onClick={handleExit}>
              끝내기
            </button>
          </div>
        </div>
      )}
      <HomeButton />
    </div>
  );
};

export default ConversationStart;
