import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { springApi } from "../../utils/api.js";
import { useSelector } from "react-redux";
import CreateRoomPopup from "../room/CreatePopup";
import "./RoomList.css";
import GoBackButton from "../../components/button/GoBackButton";
import HomeButton from "../../components/button/HomeButton";
import backgroundImage from"../../assets/background/waitingRoom_Bg.webp";

const PAGE_SIZE = 5; // 한 화면에 보여줄 최대 방 개수

const RoomList = () => {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    // 페이지네이션 관련 상태
    const [currentPage, setCurrentPage] = useState(1);

    const navigate = useNavigate();
    const token = useSelector((state) => state.auth.token);
    const userId = useSelector((state) => state.auth.userId);

    // 방 목록 불러오기
    const fetchRooms = async () => {
        try {
            setLoading(true);
            const response = await springApi.get("/rooms/list");
            // 🔹 서버에서 받아온 데이터를 id 기준으로 내림차순 정렬 후 상태 저장
            const sortedData = [...response.data].sort((a, b) => b.id - a.id);
            setRooms(sortedData);
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
        }, 10000000);
        return () => clearInterval(interval);
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (rooms.length > 0) {
            setRooms([...rooms].sort((a, b) => b.id - a.id));
        }
    }, [rooms]);

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

        // ---- [페이지네이션 전용 로직 추가] ----

    // 1) 가장 최근 생성된 방부터 보여주려면, ID가 큰 순서대로 정렬 or created_at 등으로 정렬
    const sortedRooms = [...rooms].sort((a, b) => b.id - a.id);

    // 2) 총 페이지 수 계산
    const totalPages = Math.ceil(sortedRooms.length / PAGE_SIZE);

    // 3) 현재 페이지에 해당하는 목록만 잘라서 보여주기
    const startIndex = (currentPage - 1) * PAGE_SIZE; 
    const endIndex = startIndex + PAGE_SIZE; 
    const currentPageRooms = sortedRooms.slice(startIndex, endIndex);

    // 4) 페이지 변경 함수
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };


    return (
        <div className="waiting-room-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
            <GoBackButton />
            <HomeButton />
            <div className="waiting-room">
                {/* 방 생성 팝업 */}
                <CreateRoomPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
    
                <h1 className="title">방 목록</h1>
    
                <div className="room-actions">
                    <button className="create-room-btn" onClick={() => setIsPopupOpen(true)}>
                        방 만들기
                    </button>
    
                    <button className="refresh-room-btn" onClick={fetchRooms} disabled={loading}>
                        {loading ? "🔄 불러오는 중..." : "🔄 새로고침"}
                    </button>
    
                    <button className="join-room-btn" onClick={handleJoinRoom} disabled={!selectedRoom}>
                        입장하기
                    </button>
                </div>
    
                <div className="room-list-container">
                    {loading ? (
                        <p>⏳ 방 목록을 불러오는 중...</p>
                    ) : rooms.length > 0 ? (
                        <>
                            <table className="room-table">
                                <thead>
                                    <tr>
                                        <th>번호</th>
                                        <th>방장</th>
                                        <th>방 이름</th>
                                        <th>인원 수</th>
                                        <th>비밀번호</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentPageRooms.map((room, index) => (
                                        <tr
                                            key={room.id}
                                            className={selectedRoom?.id === room.id ? "selected" : ""}
                                            onClick={() => setSelectedRoom(room)}
                                        >
                                            {/* 화면에 표시할 번호: 최신순이라도 1,2,3... 등 순서대로 매기기 */}
                                            <td>{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                                            <td>
                                                {room.host_username}
                                                <span className="small-text">({room.host_user_id})</span>
                                            </td>
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
                                            <td>{room.user_cnt}/2</td>
                                            <td>{room.room_password ? "🔒" : "🔓"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    ) : (
                        <p className="no-rooms">방이 아직 없어요!</p>
                    )}
                </div>
    
                {/* 페이지네이션 UI (room-list-container 바깥으로 이동) */}
                <div className="pagination">
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)} 
                        disabled={currentPage === 1}
                    >
                        ◀ 이전
                    </button>
    
                    <span>
                        {currentPage} / {totalPages}
                    </span>
    
                    <button 
                        onClick={() => handlePageChange(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                    >
                        다음 ▶
                    </button>
                </div>
            </div>
        </div>
    );
    
};

export default RoomList;
