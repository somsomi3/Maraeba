import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ConversationStart.css';
import catAvatar from '../../assets/images/aiCat.png';
import smileAvatar from '../../assets/images/smile.png';
import { springApi, flaskApi } from '../../utils/api';
import recordbtn from '../../assets/icons/record.png';
import PausePopup from '../../components/popup/PausePopup';

const ConversationStart = () => {
  const location = useLocation();
  const { sessionId, aiAnswer, aiRole, userRole } = location.state || {}; // AI 첫 메시지 & 역할 받음
  const [messages, setMessages] = useState([{ role: 'ai', text: aiAnswer }]); // AI 첫 메시지
  const [isRecording, setIsRecording] = useState(false); // 녹음 상태
  const [audioBlob, setAudioBlob] = useState(null); // 녹음된 음성 파일
  const navigate = useNavigate();

  // 🔥 녹음 시작
  const startRecording = () => {
    if (isRecording) return; // 중복 방지
    setIsRecording(true);
    setAudioBlob(null);

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioFile = new Blob(audioChunks, { type: 'audio/webm' });
          console.log("녹음된 파일", audioFile)
          setAudioBlob(audioFile);
          setIsRecording(false);
        };

        mediaRecorder.start();

        setTimeout(() => {
          mediaRecorder.stop();
        }, 5000); // 5초 후 자동 종료
      })
      .catch((error) => console.error('🚨 마이크 권한 오류:', error));
  };

  // 🔥 녹음 완료 후 STT 변환 + AI 응답
  const processAudio = async () => {
    if (!audioBlob) return;
  
    try {
      console.log("🎤 Sending audio to STT & AI...");
  
      // ✅ 유저 말풍선에 녹음 중 텍스트 추가 (STT 변환 전)
      setMessages((prev) => [
        ...prev,
        { role: 'user', text: "..." }, // 유저 말풍선 (STT 변환 전)
        { role: 'ai', text: "🤖 AI가 생각 중..." } // AI 응답 대기
      ]);
      
      const audioFile = new File([audioBlob], "recording.wav", { type: 'audio/wav' });
      const sttFormData = new FormData();
      sttFormData.append('file', audioFile);
  
      const sttResponse = await flaskApi.post('/ai/stt', sttFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
  
      const userText = sttResponse.data.recognized_text || '🎤 (음성 변환 실패)';
  
      // ✅ 2. AI 응답 요청
      if (!sessionId) {
        console.error("❌ sessionId가 없습니다!");
        return;
      }
  
      const chatFormData = new FormData();
      chatFormData.append('audio', audioBlob);
      chatFormData.append('sessionId', sessionId);
  
      const aiResponse = await springApi.post('/chat/play', chatFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
  
      console.log("🤖 AI Response:", aiResponse.data.answer);
  
      // ✅ 3. UI 업데이트 (STT 변환된 유저 텍스트 & AI 응답 추가)
      setMessages((prev) => {
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 2] = { role: 'user', text: userText }; // STT 변환된 유저 말풍선 업데이트
        updatedMessages[updatedMessages.length - 1] = { role: 'ai', text: aiResponse.data.answer }; // AI 응답 업데이트
        return updatedMessages;
      });
  
      setAudioBlob(null);
    } catch (error) {
      console.error('🚨 음성 처리 오류:', error.response?.data || error.message);
    }
  };
  

  useEffect(() => {
    if (audioBlob) {
      processAudio();
    }
  }, [audioBlob]); // 녹음이 완료되면 실행

  return (
    <div className="conversation-start-container">
      {/* AI 역할과 메시지 */}
      <div className="message-row ai">
        <img src={catAvatar} alt="AI 아바타" className="avatar" />
        <div className="message-content">
          <p className="role-name">{aiRole || "상대의 역할 이름"}</p> {/* AI 역할 표시 */}
          <div className="message-bubble">
            <p className="message-text">{messages[messages.length - 1].text}</p>
          </div>
        </div>
      </div>

      {/* 사용자 메시지 */}
      <div className="message-row user">
        <div className="message-content user-content">
          <p className="role-name">{userRole || "내 역할" }</p> 
          <div className="message-bubble">
            <p className="message-text">
              {messages.findLast(msg => msg.role === 'user')?.text || ''}
            </p>
          </div>
        </div>
        <img src={smileAvatar} alt="유저 아바타" className="avatar" />
      </div>

      {/* 🔥 녹음 버튼 (이미지 클릭) */}
      <div className="footer">
        <img 
          src={recordbtn} 
          alt="녹음 버튼" 
          className={`record-button ${isRecording ? 'recording' : ''}`} 
          onClick={startRecording} 
        />
      </div>
      <PausePopup onExit={() => navigate("/prons")} title="대화를 끝낼까요?" />
    </div>
  );
};

export default ConversationStart;
