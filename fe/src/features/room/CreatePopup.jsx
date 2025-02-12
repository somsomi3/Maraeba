import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { springApi } from "../../utils/api";
import "./CreatePopup.css";

const CreateRoomPopup = ({ isOpen, onClose }) => {
    const [roomTitle, setRoomTitle] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const token = useSelector((state) => state.auth.token);
    const userId = useSelector((state) => state.auth.userId);

    const handleCreateRoom = async (e) => {
        e.preventDefault();

        if (!roomTitle.trim()) {
            alert("방 제목을 입력하세요.");
            return;
        }

        if (!userId) {
            alert("사용자 정보가 없습니다. 로그인 후 다시 시도하세요.");
            return;
        }

        try {
            setLoading(true);
            await springApi.post("/rooms/create", {
                title: roomTitle,
                room_password: password || null,
                host_id: userId,
                started_at: new Date().toISOString(),
            });

            alert("방이 성공적으로 생성되었습니다!");
            onClose(); // 팝업 닫기
            navigate("/room/Roomlist");
        } catch (error) {
            alert(error.response?.data?.message || "방 생성에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="room-popup-overlay">
            <div className="room-popup-content">
                <h2>방 만들기</h2>
                <form className="room-form" onSubmit={handleCreateRoom}>
                    <input
                        className="room-input"
                        type="text"
                        placeholder="방 제목"
                        value={roomTitle}
                        onChange={(e) => setRoomTitle(e.target.value)}
                        required
                    />
                    <input
                        className="room-input"
                        type="password"
                        placeholder="비밀번호 (선택)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="create-roombtn" type="submit" disabled={loading}>
                        {loading ? "생성 중..." : "방 만들기"}
                    </button>
                </form>
                <button className="cancel-button" onClick={onClose}>취소</button>
            </div>
        </div>
    );
};

export default CreateRoomPopup;
