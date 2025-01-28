// components/popup/PausePopup.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import "./PausePopup.css";
import bunny from "../../assets/images/bunny.png";
import pauseIcon from "../../assets/icons/pause.png";

const PausePopup = ({ onExit }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handlePauseClick = () => {
    setIsPopupOpen(true); // 팝업 열기
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false); // 팝업 닫기
  };

  return (
    <div>
      <img
        src={pauseIcon}
        alt="Pause Icon"
        onClick={handlePauseClick} // 버튼 클릭 시 팝업 열기
        className="pause-button"
        style={{ cursor: "pointer", width: "50px" }}
      />
      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup-container">
            <h2 className="popup-title">수업을 끝낼까요?</h2>
            <img src={bunny} alt="Bunny illustration" className="popup-image" />
            <div className="popup-buttons">
              <button className="popup-button continue" onClick={handleClosePopup}>
                계속하기
              </button>
              <button className="popup-button exit" onClick={onExit}>
                끝내기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

PausePopup.propTypes = {
  onExit: PropTypes.func.isRequired, // 끝내기 버튼 클릭 시 동작
};

export default PausePopup;
