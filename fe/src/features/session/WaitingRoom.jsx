import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { springApi } from "../../utils/api"; // ✅ API 요청을 위한 axios 인스턴스
import "./WaitingRoom.css";

const WaitingRoom = () => {
    const [rooms, setRooms] = useState([]); // ✅ 방 목록 저장
    const [loading, setLoading] = useState(true);
    const [selectedRoom, setSelectedRoom] = useState(null); // ✅ 선택된 방 저장
    const navigate = useNavigate();

    // ✅ 방 목록 불러오기 (GET /sessions/list)
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await springApi.get("/sessions/list");
                setRooms(response.data);
            } catch (error) {
                console.error("방 목록을 불러오는 중 오류 발생:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    // ✅ 방 선택 핸들러
    const handleSelectRoom = (room) => {
        setSelectedRoom(room);
    };

    // ✅ 방 참가 요청 (POST /sessions/join/{session_id})
    const handleJoinRoom = async () => {
        if (!selectedRoom) {
            alert("입장할 방을 선택하세요.");
            return;
        }

        let password = "";
        if (selectedRoom.room_password) {
            password = prompt("방 비밀번호를 입력하세요:");
            if (!password) return;
        }

        try {
            await springApi.post(`/sessions/join/${selectedRoom.id}`, { room_password: password });
            navigate(`/session/room/${selectedRoom.id}`);
        } catch (error) {
            alert(error.response?.data?.message || "방 참가에 실패했습니다.");
        }
    };

    return (
        <div className="waiting-room">
            {/* 방 만들기 및 입장하기 버튼 */}
            <div className="room-actions">
                <button className="create-room-btn" onClick={() => navigate("/session/create-room")}>
                    방 만들기
                </button>
                <button
                    className="join-room-btn"
                    onClick={handleJoinRoom}
                    disabled={!selectedRoom}
                >
                    입장하기
                </button>
            </div>

            {/* 방 목록 */}
            <div className="room-list-container">
                {loading ? (
                    <p>방 목록을 불러오는 중...</p>
                ) : rooms.length > 0 ? (
                    <table className="room-table">
                        <thead>
                            <tr>
                                <th>번호</th>
                                <th>방 제목</th>
                                <th>상태</th>
                                <th>인원</th>
                                <th>비밀번호</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map((room, index) => (
                                <tr
                                    key={room.id}
                                    className={selectedRoom?.id === room.id ? "selected" : ""}
                                    onClick={() => handleSelectRoom(room)}
                                >
                                    <td>{index + 1}</td>
                                    <td>{room.title}</td>
                                    <td className={room.status === "playing" ? "playing" : "waiting"}>
                                        {room.status === "playing" ? "PLAYING" : "WAITING"}
                                    </td>
                                    <td>{room.current_players}/{room.max_players}</td>
                                    <td>{room.room_password ? "🔒" : "🔓"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>현재 생성된 방이 없습니다.</p>
                )}
            </div>
        </div>
    );
};

export default WaitingRoom;
