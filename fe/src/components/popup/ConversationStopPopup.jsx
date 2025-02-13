import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { springApi } from "../../utils/api"; // ✅ Spring API 가져오기
// import "./ConversationStopPopup.css";
import bunny from "../../assets/images/bunny.png";
import stopIcon from "../../assets/icons/stop.png";

const ConversationStopPopup = ({ sessionId }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const navigate = useNavigate();

  // 🔥 대화 종료 API 요청
  const handleExit = async () => {
    try {
      await springApi.delete(`/chat/exit/${sessionId}`); // ✅ DELETE 요청
      console.log(`🗑️ 대화 세션 종료: ${sessionId}`);
      navigate("/conversation"); // ✅ 대화 목록 페이지로 이동
    } catch (error) {
      console.error("❌ 대화 종료 실패:", error);
      alert("대화 종료에 실패했습니다.");
    }
  };

  return (
    <div>
      <img
        src={stopIcon}
        alt="Stop Icon"
        onClick={() => setIsPopupOpen(true)} // ✅ 팝업 열기
        className="stop-button"
        style={{ cursor: "pointer", width: "50px" }}
      />
      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup-container">
            <h2 className="popup-title">대화를 종료할까요?</h2>
            <img src={bunny} alt="Bunny illustration" className="popup-image" />
            <div className="popup-buttons">
              <button className="popup-button continue" onClick={() => setIsPopupOpen(false)}>
                계속하기
              </button>
              <button className="popup-button exit" onClick={handleExit}>
                끝내기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ConversationStopPopup.propTypes = {
  sessionId: PropTypes.string.isRequired, // ✅ 대화 세션 ID 필수
};

export default ConversationStopPopup;
