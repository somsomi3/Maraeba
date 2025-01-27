import { useNavigate } from "react-router-dom";
import goback_button from "../../assets/icons/goback_button.png"; // 이미지 경로를 import
import "./GoBackButton.css"; // CSS 파일

const GoBackButton = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // -1은 브라우저 히스토리에서 이전 페이지로 이동
  };

  return (
    <button
      onClick={handleGoBack}
      className="go-back-button" // 스타일은 CSS로 관리
    >
      <img src={goback_button} alt="Go Back" />
    </button>
  );
};

export default GoBackButton;
