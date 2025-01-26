import './Conversation.css';
import conversation from '../../assets/images/conversation.png'
import GoBackButton from '../../components/button/GoBackButton';

const Conversation = () => {

  return (
    <div className="conversation-container">
    <GoBackButton />
      <img src={conversation} alt="Conversation Title" className="conversation-image" />

      <p>상황 고르기, 상황 만들기, 대화화면 구성</p>
    </div>
  );
};

export default Conversation;
