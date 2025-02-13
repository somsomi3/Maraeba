import "./CorrectPopup.css";

const CorrectPopup = ({ message, onRestart }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <p>{message}</p>
        {/* <button className="popup-button" onClick={onRestart}>게임 시작</button> */}
      </div>
    </div>
  );
};

export default CorrectPopup;
