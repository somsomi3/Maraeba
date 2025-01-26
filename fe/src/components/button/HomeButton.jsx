import { useNavigate } from "react-router-dom";
import home_button from "../../assets/icons/home_button.png"; // home_button 이미지 import
import "./HomeButton.css"; //

const HomeButton = () => {
  const navigate = useNavigate();

  const handleGoToMain = () => {
    navigate("/main"); // /main 경로로 이동
  };

  return (
    <button onClick={handleGoToMain} className="home-button">
      <img src={home_button} alt="Go to Main" />
    </button>
  );
};

export default HomeButton;