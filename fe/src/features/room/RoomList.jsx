import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { springApi } from "../../utils/api.js";
import "./WaitingRoom.css"; // ✅ CSS 파일 import

const RoomList = () => {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setLoading(true);
                const response = await springApi.get("/rooms/list");
                console.log("📌 받아온 방 목록 데이터:", response.data);
                setRooms(response.data);
            } catch (error) {
                console.error("❌ 방 목록 불러오기 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    const handleSelectRoom = (room) => {
        setSelectedRoom(room);
    };

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
            await springApi.post(`/rooms/join/${selectedRoom.id}`, { room_password: password });
            navigate(`/room/${selectedRoom.id}`);
        } catch (error) {
            alert(error.response?.data?.message || "방 참가에 실패했습니다.");
        }
    };

    return (
        <div className="waiting-room">
            <h1>방 목록</h1>

            {/* ✅ 방 만들기 & 입장 버튼 */}
            <div className="room-actions">
                <button className="create-room-btn" onClick={() => navigate("/room/create")}>
                    방 만들기
                </button>
                <button className="join-room-btn" onClick={handleJoinRoom} disabled={!selectedRoom}>
                    입장하기
                </button>
                <button className="create-room-btn" onClick={() => navigate("/room/webrtc")}>
                    WebRTC
                </button>
            </div>

            {/* ✅ 방 목록 테이블 */}
            <div className="room-list-container">
                {loading ? (
                    <p>⏳ 방 목록을 불러오는 중...</p>
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
                                <td>
                                    {/* ✅ 방 제목을 클릭하면 해당 방으로 이동 */}
                                    <Link to={`/room/${room.id}`} className="room-link">
                                        {room.title} (ID: {room.id})
                                    </Link>
                                </td>
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
                    <p>❌ 현재 생성된 방이 없습니다.</p>
                )}
            </div>
        </div>
    );
};

export default RoomList;
