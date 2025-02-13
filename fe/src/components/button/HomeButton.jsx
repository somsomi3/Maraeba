import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types"; // ✅ PropTypes 추가
import home_button from "../../assets/icons/home_button.png"; // home_button 이미지 import
import "./HomeButton.css"; //

const HomeButton = ({ to = "/main" }) => { // ✅ 기본값 "/main" 설정
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(to); // ✅ 지정한 경로로 이동
  };

  return (
    <button onClick={handleNavigate} className="home-button">
      <img src={home_button} alt="Go to Home" />
    </button>
  );
};

HomeButton.propTypes = {
  to: PropTypes.string, // ✅ `to` prop으로 경로 지정 가능
};

export default HomeButton;
