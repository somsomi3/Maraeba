import "./PronsCompletePopup.css";

const PronsCompletePopup = ({ onClose }) => {
  return (
    <div className="prons-popup-overlay">
      <div className="prons-popup-content">
        <h2>🎉 학습을 모두 끝냈어요!</h2>
        <p>이제 결과를 확인해볼까요?</p>
        <button onClick={onClose} className="popup-button">확인</button>
      </div>
    </div>
  );
};

export default PronsCompletePopup;
