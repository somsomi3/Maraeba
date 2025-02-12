import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Webrtc from "./Webrtc.jsx";
import ChatBox from "./ChatBox.jsx";

import { springApi } from "../../utils/api.js";

function RoomPage() {
    const { roomId } = useParams();
    const navigate = useNavigate(); // 페이지 이동을 위한 navigate 훅
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const userId = 1; // ✅ 실제 로그인 시스템이 있다면 변경 필요

    useEffect(() => {
        const fetchItems = async () => {
            try {
                setLoading(true);
                const response = await springApi.get("/game/items"); // ✅ 단어 목록 API 호출
                setItems(response.data);
            } catch (error) {
                console.error("❌ 단어 목록 불러오기 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    // ✅ 게임 시작
    const startGame = async () => {
        try {
            setLoading(true);
            const response = await springApi.post(`/game/start/${roomId}`, { userId });
            if (response.status === 200) {
                setIsGameStarted(true);
            } else {
                console.error("❌ 게임 시작 실패:", response.data);
            }
        } catch (error) {
            console.error("❌ 게임 시작 오류:", error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ 사용자의 단어 선택 처리
    const handleChoice = async (choice) => {
        try {
            setSelectedItem(choice);

            const response = await springApi.post(`/game/choice/${roomId}`, {
                userId,
                choice,
            });

            alert(`✅ 선택 완료: ${choice}\n서버 응답: ${response.data}`);
        } catch (error) {
            console.error("❌ 선택 전송 실패:", error);
        }
    };

    // ✅ 방 나가기 요청
    const handleLeaveRoom = async () => {
        try {
            setLoading(true);
            const response = await springApi.post(`/rooms/leave/${roomId}`, { userId });
            if (response.status === 200) {
                alert("방에서 나갔습니다.");
                navigate("/rooms/list");  // 방 목록 화면으로 이동
            }
        } catch (error) {
            console.error("❌ 방 나가기 실패:", error);
            alert("방 나가기 실패!");
        } finally {
            setLoading(false);
        }
    };

    // ✅ 컴포넌트 unmount 시 방 나가기 요청
    useEffect(() => {
        // 뒤로가기 버튼이나 브라우저를 떠날 때 방을 나가게 처리
        return () => {
            handleLeaveRoom(); // 페이지가 나갈 때 자동으로 방을 떠난다
        };
    }, [roomId]); // roomId가 변경될 때마다 실행

    return (
        <div>
            <h1>방 ID: {roomId}</h1>

            {/* ✅ WebRTC 추가 */}
            <Webrtc roomId={roomId} />
            <ChatBox roomId={roomId} />

            {/* ✅ 게임 시작 버튼 */}
            {!isGameStarted ? (
                <button onClick={startGame} disabled={loading}>
                    {loading ? "게임 시작 중..." : "게임 시작"}
                </button>
            ) : (
                <div>
                    <h2>🎮 사물 맞추기 게임</h2>
                    <p>상대방의 입모양을 보고 어떤 단어인지 맞춰보세요!</p>
                    {loading ? (
                        <p>⏳ 단어 불러오는 중...</p>
                    ) : items.length > 0 ? (
                        <div>
                            {items.map((item) => (
                                <button
                                    key={item}
                                    onClick={() => handleChoice(item)}
                                    style={{
                                        backgroundColor: selectedItem === item ? "lightblue" : "white",
                                    }}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p>❌ 사용할 수 있는 단어가 없습니다.</p>
                    )}
                </div>
            )}

            {/* ✅ 방 나가기 버튼 */}
            <button onClick={handleLeaveRoom} disabled={loading}>
                {loading ? "나가는 중..." : "나가기"}
            </button>
        </div>
    );
}

export default RoomPage;
