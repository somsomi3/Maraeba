import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { springApi } from "../../utils/api"; // ✅ API 요청
import "./CreateRoom.css";
import { useSelector } from "react-redux";

const CreateRoom = () => {
    const [roomTitle, setRoomTitle] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const token = useSelector((state) => state.auth.token); // ✅ Redux에서 토큰 가져오기
    const userId = useSelector((state) => state.auth.userId);

    // ✅ JWT 토큰에서 사용자 정보 추출하는 함수
   

    // ✅ 방 생성 요청 (POST /room/create)
    const handleCreateRoom = async (e) => {
        e.preventDefault();

        if (!roomTitle.trim()) {
            alert("방 제목을 입력하세요.");
            return;
        }
        // 디버깅: roomTitle 값 확인
        console.log("방 제목:", roomTitle);

        if (!userId) {
            alert("사용자 정보가 없습니다. 로그인 후 다시 시도하세요.");
            return;
        }

        try {
            setLoading(true);
            await springApi.post("/rooms/create", {
                title: roomTitle,
                room_password: password || null, // 비밀번호가 없을 경우 null 전달
                host_id: userId,  // 사용자 ID
                // username: userInfo.username, // 사용자 이름 (예시로 사용)
                started_at: new Date().toISOString(), // 방 시작 시간을 현재 시간으로 설정
            });

            alert("방이 성공적으로 생성되었습니다!");
            navigate("/rooms/Roomlist"); // ✅ 대기실 페이지로 이동
        } catch (error) {
            alert(error.response?.data?.message || "방 생성에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="create-room">
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
                    type="password"
                    placeholder="비밀번호 (선택)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className="room-button" type="submit" disabled={loading}>
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
