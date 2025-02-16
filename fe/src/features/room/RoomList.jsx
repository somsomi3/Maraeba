import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { springApi } from "../../utils/api.js";
import { useSelector } from "react-redux";
import CreateRoomPopup from "../room/CreatePopup";
import "./WaitingRoom.css";

const RoomList = () => {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const navigate = useNavigate();
    const token = useSelector((state) => state.auth.token);
    const userId = useSelector((state) => state.auth.userId);

    // 방 목록 불러오기
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

    // 페이지 첫 로드 시 & 10초마다 자동 갱신
    useEffect(() => {
        fetchRooms();
        const interval = setInterval(() => {
            fetchRooms();
        }, 10000);
        return () => clearInterval(interval);
        // eslint-disable-next-line
    }, []);

    // 방 클릭 (행 선택)
    const handleJoinRoomTitle = async (room) => {
        if (!userId) {
            alert("로그인 후 이용해주세요.");
            return;
        }
        if (room.user_cnt >= 2) {
            alert("❌ 이 방은 최대 인원(2명)에 도달했습니다.");
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
            const response = await springApi.post("/rooms/join", {
                user_id: userId,
                room_id: room.id,
                room_password: password || null,
            });

            if (!response.data) {
                alert("방 참가에 실패했습니다.");
                return;
            }

            const { host } = response.data;
            alert(host ? "방장으로 입장했어요!" : "참가자로 입장했어요!");

            // 방 상세 페이지(WebRTC 화면)으로 이동
            navigate(`/room/${room.id}`);
        } catch (error) {
            alert(error.response?.data?.message || "방 참가에 실패했습니다.");
        }
    };

    // 방 참여
    const handleJoinRoom = async () => {
        if (!selectedRoom) {
            alert("입장할 방을 선택하세요.");
            return;
        }
        if (!userId) {
            alert("로그인 후 이용해주세요.");
            return;
        }
        if (selectedRoom.user_cnt >= 2) {
            alert("❌ 이 방은 최대 인원(2명)에 도달했습니다.");
            return;
        }

        let password = "";
        if (selectedRoom.room_password) {
            password = prompt("방 비밀번호를 입력하세요:");
            if (!password) {
                alert("비밀번호가 필요합니다.");
                return;
            }
        }

        try {
            const response = await springApi.post("/rooms/join", {
                user_id: userId,
                room_id: selectedRoom.id,
                room_password: password || null,
            });

            if (!response.data) {
                alert("방 참가에 실패했습니다.");
                return;
            }

            const { host } = response.data;
            alert(host ? "방장으로 입장했어요!" : "참가자로 입장했어요!");

            // 방 상세 페이지(WebRTC 화면)으로 이동
            navigate(`/room/${selectedRoom.id}`);
        } catch (error) {
            alert(error.response?.data?.message || "방 참가에 실패했습니다.");
        }
    };

    // 방 이름 클릭 시 바로 입장
    // const handleSelectRoomAndJoin = (room) => {
    //     setSelectedRoom(room);
    //     // setState로 바로 반영되길 기대할 수 없어서,
    //     // Promise.then(...) 또는 setTimeout 등의 방식도 고려할 수 있지만,
    //     // 여기선 단순히 joinRoom 함수를 직접 호출해도 무방함
    //     setTimeout(() => handleJoinRoom(), 0);
    // };

    return (
        <div className="waiting-room">
            {/* 방 생성 팝업 */}
            <CreateRoomPopup
                isOpen={isPopupOpen}
                onClose={() => setIsPopupOpen(false)}
            />

            <h1 className="title">방 목록</h1>

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
                    {loading ? "🔄 불러오는 중..." : "🔄 새로고침"}
                </button>

                <button
                    className="join-room-btn"
                    onClick={handleJoinRoom}
                    disabled={!selectedRoom}
                >
                    입장하기
                </button>
            </div>

            <div className="room-list-container">
                {loading ? (
                    <p>⏳ 방 목록을 불러오는 중...</p>
                ) : rooms.length > 0 ? (
                    <table className="room-table">
                        <thead>
                            <tr>
                                <th>번호</th>
                                <th>방 이름</th>
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
                                    onClick={() => setSelectedRoom(room)}
                                >
                                    <td>{index + 1}</td>
                                    <td>
                                        <button
                                            className="room-link"
                                            onClick={(e) => {
                                                e.stopPropagation(); // tr onClick 중복 방지
                                                setSelectedRoom(room);
                                                handleJoinRoomTitle(room);
                                            }}
                                        >
                                            {room.title}
                                        </button>
                                    </td>
                                    <td>{room.room_password ? "🔒" : "🔓"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="no-rooms">방이 아직 없어요!</p>
                )}
            </div>
        </div>
    );
};

export default RoomList;
