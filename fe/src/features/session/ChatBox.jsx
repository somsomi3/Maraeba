import React, { useState, useEffect, useRef } from "react";

const ChatBox = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [webSocket, setWebSocket] = useState(null);
  const chatContainerRef = useRef(null);

  // WebSocket 연결
  useEffect(() => {
    const ws = new WebSocket("ws:// /WebRTC/signaling");

    ws.onopen = () => {
      console.log("✅ WebSocket 연결 성공");
      setWebSocket(ws);
    };

    ws.onmessage = (event) => {
      console.log("📩 받은 메시지:", event.data);
      const receivedMessage = JSON.parse(event.data); // JSON 메시지 파싱
      setMessages((prev) => [...prev, receivedMessage]);
    };

    ws.onerror = (error) => {
      console.error("❌ WebSocket 오류:", error);
    };

    ws.onclose = () => {
      console.log("🔴 WebSocket 연결 종료");
    };

    return () => {
      ws.close(); // 컴포넌트가 언마운트되면 WebSocket 연결 해제
    };
  }, []);

  // 메시지 전송
  const sendMessage = () => {
    if (message.trim() && webSocket && webSocket.readyState === WebSocket.OPEN) {
      const messageObject = { sender: "나", text: message };
      webSocket.send(JSON.stringify(messageObject)); // 메시지를 WebSocket으로 전송
      setMessages((prev) => [...prev, messageObject]);
      setMessage("");
    }
  };

  // Enter 키로 메시지 전송
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  // 새로운 메시지가 추가되면 자동으로 스크롤
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div style={styles.chatBox}>
      <h3 style={styles.title}>채팅</h3>

      {/* 메시지 출력 영역 */}
      <div style={styles.messageContainer} ref={chatContainerRef}>
        {messages.map((msg, idx) => (
          <div key={idx} style={styles.message}>
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>

      {/* 입력 필드 및 전송 버튼 */}
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="실시간 채팅!!"
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.button}>
          전송
        </button>
      </div>
    </div>
  );
};

// 간단한 스타일 추가
const styles = {
  chatBox: {
    width: "300px",
    margin: "20px auto",
    border: "1px solid #ccc",
    borderRadius: "8px",
    overflow: "hidden",
    fontFamily: "'Arial', sans-serif",
  },
  title: {
    textAlign: "center",
    background: "#007BFF",
    color: "white",
    margin: 0,
    padding: "10px 0",
    fontSize: "16px",
  },
  messageContainer: {
    height: "200px",
    overflowY: "auto",
    padding: "10px",
    background: "#f9f9f9",
    borderBottom: "1px solid #ccc",
  },
  message: {
    margin: "5px 0",
  },
  inputContainer: {
    display: "flex",
    alignItems: "center",
    padding: "10px",
  },
  input: {
    flex: 1,
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    marginRight: "10px",
  },
  button: {
    padding: "8px 12px",
    background: "#007BFF",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default ChatBox;
