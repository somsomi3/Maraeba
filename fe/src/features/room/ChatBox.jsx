import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8081";

const ChatBox = ({ roomId }) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const webSocketRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = getToken();
        if (token) {
            connectWebSocket(token);
        } else {
            console.error("❌ JWT 토큰 없음: 로그인 필요");
            navigate("/login");
        }

        return () => {
            if (webSocketRef.current) {
                webSocketRef.current.close();
                console.log("🔴 WebSocket 연결 종료 및 정리 완료");
            }
        };
    }, []);

    const getToken = () => localStorage.getItem("token");

    // ✅ WebSocket 연결
    const connectWebSocket = (token) => {
        if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
            console.warn("⚠️ WebSocket이 이미 연결되어 있음");
            return;
        }

        webSocketRef.current = new WebSocket(`ws://localhost:8081/WebRTC/signaling?token=${token}`);

        webSocketRef.current.onopen = () => {
            console.log("✅ WebSocket 연결 성공");
        };

        webSocketRef.current.onmessage = (event) => {
            try {
                const receivedMessage = JSON.parse(event.data);
                setMessages((prev) => [...prev, receivedMessage]);
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

            setMessages((prev) => [...prev, messageObject]);
            setMessage("");
        } else {
            console.error("❌ WebSocket 연결이 닫혀 있음!");
        }
    };

    return (
        <div style={styles.container}>
            <h3>💬 채팅</h3>
            <div style={styles.chatBox}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={msg.sender === "나" ? styles.myMessage : styles.otherMessage}>
                        <strong>{msg.sender}:</strong> {msg.text}
                    </div>
                ))}
            </div>
            <div style={styles.inputContainer}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="메시지 입력..."
                    style={styles.input}
                />
                <button onClick={sendMessage} style={styles.sendButton}>전송</button>
            </div>
        </div>
    );
};

// ✅ 스타일 추가
const styles = {
    container: { padding: "10px", width: "300px", border: "1px solid #ccc", borderRadius: "8px", background: "#f9f9f9" },
    chatBox: { height: "200px", overflowY: "auto", padding: "5px", background: "white", borderRadius: "5px", marginBottom: "10px" },
    inputContainer: { display: "flex", gap: "5px" },
    input: { flex: 1, padding: "5px", border: "1px solid #ccc", borderRadius: "5px" },
    sendButton: { padding: "5px 10px", background: "#007BFF", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" },
    myMessage: { textAlign: "right", background: "#dcf8c6", padding: "5px", borderRadius: "5px", marginBottom: "5px" },
    otherMessage: { textAlign: "left", background: "#f1f1f1", padding: "5px", borderRadius: "5px", marginBottom: "5px" },
};

export default ChatBox;
