import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ConversationStart.css';
import catAvatar from '../../assets/images/aiCat.png';
import smileAvatar from '../../assets/images/smile.png';
import { springApi, flaskApi } from '../../utils/api';
import recordbtn from '../../assets/icons/record.png';
import pausebtn from '../../assets/icons/pause.png';
import ConversationStopPopup from '../../components/popup/ConversationStopPopup';
import backgroundImage from"../../assets/background/ai_Bg.webp";

const ConversationStart = () => {
  const location = useLocation();
  const { sessionId, aiAnswer, aiRole, userRole } = location.state || {}; // AI 첫 메시지 & 역할 받음
  const [messages, setMessages] = useState([{ role: 'ai', text: aiAnswer }]); // AI 첫 메시지
  const [isRecording, setIsRecording] = useState(false); // 녹음 상태
  const [recordingIcon, setRecordingIcon] = useState(recordbtn); // 🔥 버튼 아이콘 상태 추가
  const [audioBlob, setAudioBlob] = useState(null); // 녹음된 음성 파일
  const [ttsAudioUrl, setTtsAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [recordWarning, setRecordWarning] = useState(true);
  const [isSwapped, setIsSwapped] = useState(false);


  const toggleRecording = async () => {
    if (!isRecording) {
      // ✅ 녹음 시작
      setIsRecording(true);
      setRecordingIcon(pausebtn); // 🎤 녹음 중 버튼 변경

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioFile = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log("🎤 녹음된 파일:", audioFile);
        setAudioBlob(audioFile);
        setRecordingIcon(recordbtn); // 🔁 버튼 원래대로
        setIsRecording(false);
      };

      mediaRecorder.start();
    } else {
      // ✅ 녹음 중지
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }
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
        { role: 'ai', text: "..." } // AI 응답 대기
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
        console.error("sessionId가 없습니다");
        return;
      }
  
      const chatFormData = new FormData();
      chatFormData.append('audio', audioBlob);
      chatFormData.append('sessionId', sessionId);
  
      const aiResponse = await springApi.post('/chat/play', chatFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
  
      // ✅ 3. UI 업데이트 (STT 변환된 유저 텍스트 & AI 응답 추가)
      setMessages((prev) => {
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 2] = { role: 'user', text: userText }; // STT 변환된 유저 말풍선 업데이트
        updatedMessages[updatedMessages.length - 1] = { role: 'ai', text: aiResponse.data.answer }; // AI 응답 업데이트
        return updatedMessages;
      });   
  
      setIsSwapped(true);
      setAudioBlob(null);
      handleTTS(aiResponse.data.answer);

    } catch (error) {
      console.error('🚨 음성 처리 오류:', error.response?.data || error.message);
    }
  };
  

  useEffect(() => {
    if (audioBlob) {
      processAudio();
    }
  }, [audioBlob]); // 녹음이 완료되면 실행
  
  const handleTTS = async (text) => {
    try {
      const response = await flaskApi.post('/ai/tts', { text }, { responseType: 'blob' });

      // ✅ MP3 파일을 Blob으로 변환하여 URL 생성
      const audioBlob = new Blob([response.data], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setTtsAudioUrl(audioUrl);
    } catch (error) {
      console.error("🚨 TTS 변환 실패:", error);
      setTtsAudioUrl(null);
    }
  };

  return (
    <div className="conversation-start-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      {/* AI 역할과 메시지 */}
      <div className={`message-row ai ${isSwapped ? "swapped" : ""}`}>
        <img src={catAvatar} alt="AI 아바타" className="avatar" />
        <div className="message-content">
          <p className="role-name">{aiRole || "상대의 역할 이름"}</p> {/* AI 역할 표시 */}
          <div className="message-bubble">
            <p className="message-text">{messages[messages.length - 1].text}</p>
            {ttsAudioUrl && (
              <div className="tts-audio-container">
                <button className="tts-button" onClick={() => new Audio(ttsAudioUrl).play()}>
                  🔈 음성 듣기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 사용자 메시지 */}
      <div className={`message-row user ${isSwapped ? "swapped" : ""}`}>
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
        {recordWarning && (
            <div className="conversation-record-warning">
                🎤  대화를 시작하려면 눌러주세요!
            </div>
        )}
        <img 
          src={recordingIcon} 
          alt="녹음 버튼" 
          className={`record-button ${isRecording ? 'recording' : ''}`} 
          onClick={() => {
            toggleRecording()
            setRecordWarning(false)
            }}  
        />
      </div>
      
      <ConversationStopPopup />
    </div>
  );
};

export default ConversationStart;
