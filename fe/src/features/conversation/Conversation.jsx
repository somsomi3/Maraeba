import { useNavigate } from 'react-router-dom';
import './Conversation.css';
import conversation from '../../assets/images/conversation.png'

const Conversation = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 React Router 훅


  return (
    <div className="conversation-container">
      <button className="back-button" onClick={() => navigate('/single')}>
        이전으로
      </button>
      <img src={conversation} alt="Conversation Title" className="conversation-image" />

      <p>상황 고르기, 상황 만들기, 대화화면 구성</p>
    </div>
  );
};

export default Conversation;
