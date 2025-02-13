import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Conversation.css';
import conversationTitle from '../../assets/images/conversation.png'; 
import HomeButton from '../../components/button/HomeButton';
import { springApi } from '../../utils/api';

const Conversation = () => {
  const navigate = useNavigate();
  const [selectedSituation, setSelectedSituation] = useState('');
  const [formData, setFormData] = useState({
    aiRole: '',
    userRole: '',
    situation: ''
  });

  const predefinedSituations = [
    '친구의 숙제 도와주기',
    '친구와 함께 우산쓰고 돌아가기',
    '학교에서 새로운 친구 사귀기',
    '마트에서 간식 구매하기',
    '다친 동생 위로해 주기',
    '친구와 여행에 대해 이야기하기'
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  useEffect(() => {

    if (selectedSituation) {
      setFormData((prev) => ({
        ...prev,
        situation: selectedSituation
      }));
    }
  }, [selectedSituation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.situation.trim() || !formData.aiRole.trim() || !formData.userRole.trim()) return;

    try {
      const { data } = await springApi.post('/chat/start', {
        is_default: false,
        default_id: null,
        ai_role: formData.aiRole,
        user_role: formData.userRole,
        situation: formData.situation
      });
    
      console.log(data.answer)

      if (data.session_id) {
        navigate('/conversation/start', { state: { sessionId: data.session_id, aiAnswer: data.answer, aiRole: formData.aiRole, userRole: formData.userRole } });
      }
    } catch (error) {
      console.error('🚨 대화 시작 오류:', error);
    }
  };

  return (
    <>
      <div className="conversation-container">
        <div className="conversation-header">
          <img src={conversationTitle} alt="이야기 나누기" className="conversation-title-image" />
        </div>

        <div className="conversation-content">
          <div className="situation-section situation-select">
            <h2>상황 고르기</h2>
            <div className="situation-grid">
              {predefinedSituations.map((situation, index) => (
                <button
                  key={index}
                  className={`situation-card ${selectedSituation === situation ? 'selected' : ''}`}
                  onClick={() => setSelectedSituation(situation)}
                >
                  {situation}
                </button>
              ))}
            </div>
          </div>

          <div className="situation-section situation-create">
            <h2>상황 만들기</h2>
            <form onSubmit={handleSubmit} className="creation-form">
              <label>
                AI 역할
                <input type="text" name="aiRole" value={formData.aiRole} onChange={handleInputChange} placeholder="AI의 역할을 입력해주세요." />
              </label>

              <label>
                나의 역할
                <input type="text" name="userRole" value={formData.userRole} onChange={handleInputChange} placeholder="나의 역할을 입력해주세요." />
              </label>

              <label className="situation-description">
                상황
                <textarea name="situation" value={formData.situation} onChange={handleInputChange} placeholder="상황을 설명해주세요." />
              </label>
            </form>
          </div>
        </div>

        <div className="action-footer">
          <button className="primary-button" onClick={handleSubmit} disabled={!formData.situation.trim() || !formData.aiRole.trim() || !formData.userRole.trim()}>
            시작하기
          </button>
        </div>
      </div>

      <HomeButton to='/single' />
    </>
  );
};

export default Conversation;
