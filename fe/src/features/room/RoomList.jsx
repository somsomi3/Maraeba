import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { springApi } from "../../utils/api.js";
import "./WaitingRoom.css";
import { useSelector } from "react-redux";
import CreateRoomPopup from "../room/CreatePopup";

const RoomList = () => {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const navigate = useNavigate();
    const token = useSelector((state) => state.auth.token); // ✅ Redux에서 토큰 가져오기
    const userId = useSelector((state) => state.auth.userId);

    // ✅ JWT 토큰에서 사용자 정보 추출하는 함수

    // 방 목록 가져오기
    const fetchRooms = async () => {
        try {
            setLoading(true);
            const response = await springApi.get("/rooms/list");
            setRooms(response.data);
        } catch (error) {
            console.error("❌ 방 목록 불러오기 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();

        const interval = setInterval(() => {
            fetchRooms(); // 주기적인 목록 갱신
        }, 10000); // 10초마다 갱신

        return () => clearInterval(interval); // 언마운트 시 인터벌 제거
    }, []); // 페이지 로드 시 방 목록을 불러오기

    // 방 선택
    const handleSelectRoom = (room) => {
        setSelectedRoom(room);
    };

    // 방 입장 요청
    const handleJoinRoom = async () => {
        if (!selectedRoom) {
            alert("입장할 방을 선택하세요.");
            return;
        }

        // getUserInfo()에서 이미 토큰을 확인하고 사용자 정보를 가져오기 때문에
        if (!userId) {
            alert("사용자 정보가 없습니다. 로그인 후 다시 시도하세요.");
            return;
        }

        if (selectedRoom.current_players >= selectedRoom.max_players) {
            alert("❌ 이 방은 최대 인원에 도달하여 입장할 수 없습니다.");
            return;
        }

        let password = "";
        if (room.room_password) {
            password = prompt("방 비밀번호를 입력하세요:");
            if (!password) {
                alert("비밀번호가 필요합니다.");
                return;
            }
        }

        try {
            // 방 입장 API 요청
            const response = await springApi.post(`/rooms/join/${room.id}`, {
                user: userId,
                room: room.id,
                room_password: password || null,
            });

            const { host } = response.data;
            alert(host ? "방장으로 입장했습니다!" : "참가자로 입장했습니다.");

            // 방 입장 후 해당 방 페이지로 이동
            navigate(`/room/${room.id}`);
        } catch (error) {
            alert(error.response?.data?.message || "방 참가에 실패했습니다.");
        }
    };

    return (
        <div className="waiting-room">
            <CreateRoomPopup
                isOpen={isPopupOpen}
                onClose={() => setIsPopupOpen(false)}
            />
            <h1>방 목록</h1>

            {/* ✅ 새로고침 버튼 추가 */}
            <div className="room-actions">
                <button
                    className="create-room-btn"
                    onClick={() => setIsPopupOpen(true)}
                >
                    방 만들기
                </button>
                <button
                    className="refresh-room-btn"
                    onClick={fetchRooms}
                    disabled={loading}
                >
                    {loading ? "🔄 새로고침 중..." : "🔄 새로고침"}
                </button>
                <button
                    className="join-room-btn"
                    onClick={() => handleJoinRoom(selectedRoom)}
                    disabled={!selectedRoom}
                >
                    입장하기
                </button>
            </div>

            {/* 방 목록 테이블 */}
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
                                    className={
                                        selectedRoom?.id === room.id
                                            ? "selected"
                                            : ""
                                    }
                                    onClick={() => handleSelectRoom(room)} // 방을 선택하는 함수 호출
                                >
                                    <td>{index + 1}</td>
                                    <td>
                                        <button
                                            className="room-link"
                                            onClick={() => handleJoinRoom(room)} // 클릭 시 방 입장
                                        >
                                            {room.title} (ID: {room.id})
                                        </button>
                                    </td>
                                    <td
                                        className={
                                            room.status === "playing"
                                                ? "playing"
                                                : "waiting"
                                        }
                                    >
                                        {room.status === "playing"
                                            ? "PLAYING"
                                            : "WAITING"}
                                    </td>
                                    <td>
                                        {room.current_players}/
                                        {room.max_players}
                                    </td>
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
