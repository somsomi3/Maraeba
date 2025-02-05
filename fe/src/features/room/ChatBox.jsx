import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8081";

const ChatBox = ({ roomId }) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState(JSON.parse(localStorage.getItem("chatMessages")) || []);
    const [userId, setUserId] = useState(null);
    const webSocketRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = getToken();
        if (token) {
            connectWebSocket(token);
        } else {
            console.error("❌ JWT 토큰 없음: 로그인 필요");
        }

        return () => {
            if (webSocketRef.current) {
                webSocketRef.current.close();
            }
        };
    }, []);

    // ✅ JWT 토큰 가져오기
    const getToken = () => localStorage.getItem("token");

    const checkAuthAndConnectWebSocket = async () => {
        const token = getToken();
        if (!token) {
            console.warn("🔴 로그인 필요: 로그인 페이지로 이동");
            navigate("/login");
            return;
        }

        try {
            // ✅ 백엔드에 인증 요청
            const response = await fetch(`${API_URL}/validate`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("❌ 인증 실패");

            console.log("✅ 로그인 확인됨. WebRTC WebSocket 연결 시작");
            connectWebSocket(token);
        } catch (error) {
            console.error("❌ 인증 실패: 로그인 페이지로 이동", error);
            localStorage.removeItem("token");
            navigate("/login");
        }
    };

    // ✅ WebSocket 연결
    const connectWebSocket = (token) => {
        if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) return;

        webSocketRef.current = new WebSocket(`ws://i12e104.p.ssafy.io:8081/WebRTC/signaling?token=${token}`);

        webSocketRef.current.onopen = () => {
            console.log("✅ WebSocket 연결 성공");
        };

        webSocketRef.current.onmessage = (event) => {
            try {
                const receivedMessage = JSON.parse(event.data);
                setMessages((prev) => {
                    const updatedMessages = [...prev, receivedMessage];
                    localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));
                    return updatedMessages;
                });
            } catch (e) {
                console.error("📩 JSON 파싱 오류:", e);
            }
        };

        webSocketRef.current.onerror = (error) => {
            console.error("❌ WebSocket 오류:", error);
        };

        webSocketRef.current.onclose = () => {
            console.log("🔴 WebSocket 연결 종료");
        };
    };

    // ✅ 메시지 전송
    const sendMessage = () => {
        if (message.trim() && webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
            const messageObject = { sender: "나", text: message };
            console.log("📡 메시지 전송:", messageObject);
            webSocketRef.current.send(JSON.stringify(messageObject));

            setMessages((prev) => {
                const updatedMessages = [...prev, messageObject];
                localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));
                return updatedMessages;
            });

            setMessage("");
        } else {
            console.error("❌ WebSocket 연결이 닫혀 있음!");
        }
    };

    return (
        <div>
            <h3>채팅</h3>
            <div>
                {messages.map((msg, idx) => (
                    <div key={idx}>
                        <strong>{msg.sender}:</strong> {msg.text}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="메시지 입력..."
            />
            <button onClick={sendMessage}>전송</button>
        </div>
    );
};

export default ChatBox;
