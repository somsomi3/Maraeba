import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './ConversationStart.css';
import catAvatar from '../../assets/images/aiCat.png';
import smileAvatar from '../../assets/images/smile.png';
import RecordButton from "../../components/button/RecordButton";
import GoBackButton from "../../components/button/GoBackButton";
import { flaskApi } from '../../utils/api';

const ConversationStart = () => {
  const location = useLocation();
  const { sessionId } = location.state || {};
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  
  useEffect(() => {
    if (sessionId) {
      flaskApi.post('/chat/play', { sessionId })
        .then(({ data }) => {
          setMessages([{ role: 'ai', text: data.answer }]);
        })
        .catch(error => console.error('🚨 AI 초기 응답 오류:', error));
    }
  }, [sessionId]);

  const handleRecordingComplete = async (audioFile) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('sessionId', sessionId);

      const { data } = await flaskApi.post('/chat/respond', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessages((prev) => [...prev, { role: 'user', text: '유저 음성 메시지' }, { role: 'ai', text: data.answer }]);
    } catch (error) {
      console.error('🚨 AI 응답 오류:', error);
    }
  };

  return (
    <div className="conversation-start-container">
      {messages.map((msg, index) => (
        <div key={index} className={`conversation-row ${msg.role === 'user' ? 'self' : ''}`}>
          {msg.role === 'ai' && (
            <div className="avatar-container">
              <img src={catAvatar} alt="AI" className="avatar" />
            </div>
          )}
          <div className="chat-bubble">{msg.text}</div>
          {msg.role === 'user' && (
            <div className="avatar-container">
              <img src={smileAvatar} alt="User" className="avatar" />
            </div>
          )}
        </div>
      ))}

      <div className="footer">
        <RecordButton onRecordingComplete={handleRecordingComplete} />
      </div>

      <GoBackButton />
    </div>
  );
};

export default ConversationStart;
