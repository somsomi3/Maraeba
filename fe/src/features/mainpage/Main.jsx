import { useNavigate } from "react-router-dom";
import "./Main.css";
import pronsStuff from "../../assets/images/prons_stuff.png";
import wordStuff from "../../assets/images/word_stuff.png";
import profile from "../../assets/icons/profile.png"
import LogoutButton from "../../components/button/LogoutButton";


const Main = () => {
    const navigate = useNavigate();

    return (
        <div className="main-page">
            <div className="main-profile-container" onClick={() => navigate("/profile")}>
                <img
                    src={profile}
                    alt="프로필 이미지"
                    className="main-profile-image"
                />
                <p className="profile-text">프로필</p>
                {/* <LogoutButton /> */}
            </div>
            <div className="card-container">
                {/* 왼쪽 카드 */}
                <div className="card single-mode" onClick={() => navigate("/single")}>
                    <div className="card-content">
                        <h2>즐거운 발음 학습</h2>
                        <p>
                            발음 익히기, 단어 게임, 가상의 친구와 즐겁게 대화하며 재미있게 발음을 학습해요!
                        </p>
                    </div>
                    <img src={pronsStuff} alt="발음 학습 관련 이미지" className="card-image single-image" />
                </div>

                {/* 오른쪽 카드 */}
                <div className="card multi-mode" onClick={() => navigate("/room/RoomList")}>
                    <div className="card-content">
                        <h2>선생님과 단어 놀이</h2>
                        <p>
                            선생님과 친구들과의 영상 단어 카드 놀이를 통해 다양한 단어들을 직접 말해봐요!
                        </p>
                    </div>
                    <img src={wordStuff} alt="단어 학습 관련 이미지" className="card-image multi-image" />
                    
            
                </div>
            </div>

            
        </div>
    );
};

export default Main;
