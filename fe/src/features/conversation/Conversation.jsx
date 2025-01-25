import { useNavigate } from 'react-router-dom';
import './Conversation.css';

const Conversation = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 React Router 훅

  return (
    <div className="conversation-container">
      <button className="back-button" onClick={() => navigate('/single')}>
        이전으로
      </button>
      <h1>이야기 나누기</h1>
      <p>상황 고르기, 상황 만들기, 대화화면 구성</p>
    </div>
  );
};

export default Conversation;
