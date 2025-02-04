import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import WebRTC from "./Webrtc";

function RoomPage() {
    const { roomId } = useParams();
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [items, setItems] = useState([]); // ✅ 백엔드에서 불러올 단어 목록
    const userId = 1; // ✅ 예제 유저 ID (실제 로그인 구현 시 변경 필요)

    useEffect(() => {
        fetch("http://localhost:8081/game/items") // ✅ 백엔드에서 단어 목록 가져오기
            .then((response) => response.json())
            .then((data) => setItems(data))
            .catch((error) =>
                console.error("❌ 단어 목록 불러오기 실패:", error)
            );
    }, []);

    const startGame = () => {
        fetch(`http://localhost:8081/game/start/${roomId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
        })
            .then((response) => response.json())
            .then(() => {
                setIsGameStarted(true);
            })
            .catch((error) => console.error("Error starting game:", error));
    };

    // ✅ 사용자 선택을 서버로 보내기
    const handleChoice = (choice) => {
        setSelectedItem(choice); // UI에서 선택한 항목을 표시

        fetch(`http://localhost:8081/game/choice/${roomId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, choice }),
        })
            .then((response) => response.text()) // 서버에서 문자열 응답
            .then((message) => {
                alert(`✅ 선택 완료: ${choice}\n서버 응답: ${message}`);
            })
            .catch((error) => console.error("❌ 선택 전송 실패:", error));
    };

    return (
        <div>
            <h1>방 ID: {roomId}</h1>

            {/* ✅ WebRTC 추가 */}
            <WebRTC />

            {/* ✅ 게임 시작 버튼 */}
            {!isGameStarted ? (
                <button onClick={startGame}>게임 시작</button>
            ) : (
                <div>
                    <h2>🎮 사물 맞추기 게임</h2>
                    <p>상대방의 입모양을 보고 어떤 단어인지 맞춰보세요!</p>
                    <div>
                        {items.map((item) => (
                            <button
                                key={item}
                                onClick={() => handleChoice(item)} // ✅ 사용자가 버튼을 클릭하면 서버로 전송
                                style={{
                                    backgroundColor:
                                        selectedItem === item
                                            ? "lightblue"
                                            : "white",
                                }}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default RoomPage;
