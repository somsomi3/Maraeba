import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Conversation.css';
import conversationTitle from '../../assets/images/conversation.png'; 
import HomeButton from '../../components/button/HomeButton';
import { springApi } from '../../utils/api';
import DarongSpeech from './DarongSpeech'; // ✅ 다롱이 말풍선 컴포넌트 추가


const Conversation = () => {
  const navigate = useNavigate();
  const [selectedSituation, setSelectedSituation] = useState('');
  const [formData, setFormData] = useState({
    aiRole: '',
    userRole: '',
    situation: ''
  });
  
  const [tutorialStep, setTutorialStep] = useState(null);
  const [isTutorialCompleted, setIsTutorialCompleted] = useState(false);

  const defaultRoles = {
    '친구의 숙제 도와주기': { aiRole: '도움을 받는 친구', userRole: '도와주는 친구' },
    '친구와 함께 우산쓰고 돌아가기': { aiRole: '우산을 같이 쓰는 친구', userRole: '우산을 함께 쓰는 친구' },
    '학교에서 새로운 친구 사귀기': { aiRole: '새로운 친구', userRole: '학교 학생' },
    '마트에서 간식 구매하기': { aiRole: '마트 점원', userRole: '손님' },
    '다친 동생 위로해 주기': { aiRole: '다친 동생', userRole: '위로해주는 형/누나' },
    '친구와 여행에 대해 이야기하기': { aiRole: '여행을 다녀온 친구', userRole: '여행을 계획하는 친구' }
  };
  
  useEffect(() => {
    const fetchTutorialStatus = async () => {
      try {
        const response = await springApi.get("/users/me/tutorial");
        const hasSeenAi = response.data.data.has_seen_ai;
        
        if (hasSeenAi) {
        //   setIsTutorialCompleted(true);
          setTutorialStep(null)
        } else {
          setTutorialStep(1);
        }
      } catch (error) {
        console.error("❌ 튜토리얼 상태 가져오기 실패:", error);
      }
    };
    fetchTutorialStatus();
  }, []);


  const handleTutorialComplete = async () => {
    try {
      await springApi.patch("/users/me/tutorial/4", { completed: true });
      setIsTutorialCompleted(true);
      setTutorialStep(null);
    } catch (error) {
      console.error("❌ 튜토리얼 완료 상태 저장 실패:", error);
    }
  };

  const handleRestartTutorial = async () => {
    try {
      await springApi.patch("/users/me/tutorial/4", { completed: false });
      setIsTutorialCompleted(false);
      setTutorialStep(1);
    } catch (error) {
      console.error("❌ 튜토리얼 다시보기 실패:", error);
    }
  };

  const handleSituationClick = (situation) => {
    setSelectedSituation(situation);
    setFormData({
      ...formData,
      situation,
      aiRole: defaultRoles[situation]?.aiRole || '',
      userRole: defaultRoles[situation]?.userRole || ''
    });
  };
  
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
      console.log(data)
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

        <button className="restart-tutorial-btn" onClick={handleRestartTutorial}>
          🔄 튜토리얼 다시보기
        </button>

        <div className="conversation-content">
          {/* <div className={`situation-section situation-select ${tutorialStep === 1 ? "highlight" : ""}`}>*/}
          <div className="situation-section situation-select"> 
            <h2>상황 고르기</h2>
            <div className="situation-grid">
                {Object.keys(defaultRoles).map((situation, index) => (
                    <button
                    key={index}
                    className={`situation-card ${selectedSituation === situation ? 'selected' : ''} ${tutorialStep === 1 ? 'highlight' : ''}`}
                    onClick={() => handleSituationClick(situation)}
                    >
                    {situation}
                    </button>
                ))}
                </div>
          </div>

          {!isTutorialCompleted && tutorialStep === 1 && (
            <DarongSpeech text="상황을 골라요!" position="near-select" onNext={() => setTutorialStep(2)} />
          )}

          <div className="situation-section situation-create">
            <h2>상황 만들기</h2>
            <form onSubmit={handleSubmit} className="creation-form">
              <label>
                상대방 역할
                <input type="text" name="aiRole" value={formData.aiRole} onChange={handleInputChange} placeholder="AI의 역할을 입력해주세요." className={tutorialStep === 2 ? 'highlight' : ''} />
              </label>

              <label>
                나의 역할
                <input type="text" name="userRole" value={formData.userRole} onChange={handleInputChange} placeholder="나의 역할을 입력해주세요." className={tutorialStep === 2 ? 'highlight' : ''} />
              </label>

              <label className="situation-description">
                상황
                <textarea name="situation" value={formData.situation} onChange={handleInputChange} placeholder="상황을 설명해주세요." className={`situation-input ${tutorialStep === 2 ? 'highlight' : ''}`} />
              </label>
            </form>
          </div>

          {!isTutorialCompleted && tutorialStep === 2 && (
            <DarongSpeech text="직접 상황을 만들 수 있어요!" position="near-making" onNext={() => setTutorialStep(3)} />
          )}
        </div>

    
        <div className="action-footer">
          <button className={`primary-button ${tutorialStep === 3 ? 'highlight' : ''}`} onClick={handleSubmit} disabled={!formData.situation.trim() || !formData.aiRole.trim() || !formData.userRole.trim()}>
            시작하기
          </button>
        </div>

        {!isTutorialCompleted && tutorialStep === 3 && (
          <DarongSpeech text="시작하기를 눌러 대화를 시작해볼까요?" position="near-start" onNext={handleTutorialComplete} />
        )}
      </div>

          


      <HomeButton to='/single' />
    </>
  );
};

export default Conversation;
