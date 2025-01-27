<<<<<<< Updated upstream
import './Conversation.css';
import conversation from '../../assets/images/conversation.png'
import GoBackButton from '../../components/button/GoBackButton';

const Conversation = () => {

  return (
    <div className="conversation-container">
    <GoBackButton />
      <img src={conversation} alt="Conversation Title" className="conversation-image" />
=======
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Conversation.css';
import conversationTitle from '../../assets/images/conversation.png'; 
import homeButtonImage from '../../assets/images/home_btn.png'; // 홈 버튼 이미지 경로

const Conversation = () => {
  const navigate = useNavigate();
  const [selectedSituation, setSelectedSituation] = useState(null);
  const [formData, setFormData] = useState({
    otherRole: '',
    myRole: '',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSituation && !formData.situation.trim()) return;
    navigate('/conversation/start');
  };

  return (
    <>
      <div className="conversation-container">
        {/* 헤더 */}
        <div className="conversation-header">
          <img
            src={conversationTitle}
            alt="이야기 나누기"
            className="conversation-title-image"
          />
        </div>
>>>>>>> Stashed changes

        {/* 메인 컨텐츠 */}
        <div className="conversation-content">
          <div className="situation-section situation-select">
            <h2>상황 고르기</h2>
            <div className="situation-grid">
              {predefinedSituations.map((situation, index) => (
                <button
                  key={index}
                  className={`situation-card ${
                    selectedSituation === situation ? 'selected' : ''
                  }`}
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
              {/* 상대방의 역할 */}
              <label>
                상대방의 역할
                <input
                  type="text"
                  name="otherRole"
                  value={formData.otherRole}
                  onChange={handleInputChange}
                  placeholder="상대방의 역할을 입력해주세요."
                />
              </label>

              {/* 나의 역할 */}
              <label>
                나의 역할
                <input
                  type="text"
                  name="myRole"
                  value={formData.myRole}
                  onChange={handleInputChange}
                  placeholder="자신의 역할을 입력해주세요."
                />
              </label>

              {/* 상황 설명 */}
              <label className="situation-description">
                상황
                <textarea
                  name="situation"
                  value={formData.situation}
                  onChange={handleInputChange}
                  placeholder="상황을 간단하게 설명해주세요."
                />
              </label>
            </form>
          </div>
        </div>

        {/* 시작하기 버튼 */}
        <div className="action-footer">
          <button
            className="primary-button"
            onClick={handleSubmit}
            disabled={!selectedSituation && !formData.situation.trim()}
          >
            시작하기
          </button>
        </div>
      </div>

      {/* 홈 버튼 */}
      <button className="home-button" onClick={() => navigate('/main')}>
        <img src={homeButtonImage} alt="홈 버튼" />
      </button>
    </>
  );
};

export default Conversation;
