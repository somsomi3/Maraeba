import { useState } from "react";
import "./ProfileImageSelector.css";
import bear from "../../assets/profiles/profile1.png"
import cat from "../../assets/profiles/profile2.png"
import dog from "../../assets/profiles/profile3.png"
import fox from "../../assets/profiles/profile4.png"
import panda from "../../assets/profiles/profile5.png"
import penguin from "../../assets/profiles/profile6.png"
import pig from "../../assets/profiles/profile7.png"
import rabbit from "../../assets/profiles/profile8.png"
import rat from "../../assets/profiles/profile9.png"


// ✅ 정해진 프로필 이미지 목록
const profileImages = [
    bear, cat, dog, fox, panda, penguin, pig, rabbit, rat
];

const ProfileImageSelector = ({ selectedImage, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen((prev) => !prev);
  }

  const handleImageSelect = (image) => {
    onSelect(image); // ✅ 부모 컴포넌트에 선택한 이미지 전달
    setIsOpen(false);
  };

  return (
    <div className="my-profile-selector">
      <div className="my-profile-image" onClick={toggleModal}>
      <img src={selectedImage} alt="프로필 이미지" />
      </div>

      {isOpen && (
        <div className="my-profile-modal">
          {/* <h3>프로필 고르기</h3> */}
          <div className="my-profile-grid">
            {profileImages.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`프로필 ${index + 1}`}
                onClick={() => handleImageSelect(image)}
              />
            ))}
          </div>
          <button className="profileselect-btn" onClick={() => setIsOpen(false)}>닫기</button>
        </div>
      )}
    </div>
  );
};

export default ProfileImageSelector;

