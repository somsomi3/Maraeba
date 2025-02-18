import "./CuteLoading.css";
import porong from "../../assets/images/porong.png"; // ✅ 귀여운 로딩 이미지

const CuteLoading = () => {
  return (
    <div className="cute-loading-container">
      <img src={porong} alt="로딩 중" className="loading-img" />
      <p className="loading-text">🎵 로딩 중... 잠시만 기다려 주세요! 🎶</p>
    </div>
  );
};

export default CuteLoading;
