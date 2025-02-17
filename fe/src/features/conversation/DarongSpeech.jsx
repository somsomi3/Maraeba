import './DarongSpeech.css'; // ✅ 다롱이 스타일 추가
import darongImage from '../../assets/images/darong.png'; // ✅ 다롱이 이미지 불러오기

const DarongSpeech = ({ text, position = "center", onNext }) => {
  return (
    <div className={`darong-container ${position}`}>
      <img src={darongImage} alt="다롱이" className="darong-image" />
      <div className="darong-speech-bubble">
        {text.split("\n").map((line, index) => (
          <span key={index}>
            {line}
            <br />
          </span>
        ))}
        {onNext && <button onClick={onNext} className="darong-nextbutton">다음</button>}
      </div>
    </div>
  );
};

export default DarongSpeech;
