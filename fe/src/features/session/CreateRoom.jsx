import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { springApi } from "../../utils/api"; // ✅ API 요청
import "./CreateRoom.css";

const CreateRoom = () => {
    const [roomTitle, setRoomTitle] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // ✅ 방 생성 요청 (POST /sessions/create)
    const handleCreateRoom = async (e) => {
        e.preventDefault();

        if (!roomTitle.trim()) {
            alert("방 제목을 입력하세요.");
            return;
        }

        try {
            setLoading(true);
            await springApi.post("/sessions/create", {
                title: roomTitle,
                room_password: password || null, // 비밀번호가 없을 경우 null 전달
            });

            alert("방이 성공적으로 생성되었습니다!");
            navigate("/session/waiting"); // ✅ 대기실 페이지로 이동
        } catch (error) {
            alert(error.response?.data?.message || "방 생성에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-room">
            <h2>방 만들기</h2>
            <form 
            onSubmit={handleCreateRoom}>
                <input
                    className="room-input"
                    type="text"
                    placeholder="방 제목"
                    value={roomTitle}
                    onChange={(e) => setRoomTitle(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="비밀번호 (선택)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit" disabled={loading}>
                    {loading ? "생성 중..." : "방 만들기"}
                </button>
            </form>
            <button className="cancel-btn" onClick={() => navigate("/session/waiting")}>
                취소
            </button>
        </div>
    );
};

export default CreateRoom;
