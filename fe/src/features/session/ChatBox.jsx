import React, { Component } from "react";
import { useNavigate } from "react-router-dom"; // ✅ useNavigate 사용

const API_URL = "http://localhost:8081";

class ChatBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: "",
            messages: JSON.parse(localStorage.getItem("chatMessages")) || [],
            userId: null, // ✅ 사용자 ID 상태 추가
        };
        this.webSocket = null;
        this.reconnectInterval = null;
    }

    componentDidMount() {
        this.checkAuthAndConnectWebSocket();
    }

    componentWillUnmount() {
        if (this.webSocket) {
            this.webSocket.close();
        }
        clearInterval(this.reconnectInterval);
    }

    // ✅ JWT 토큰 가져오기
    getToken = () => localStorage.getItem("token");

    // ✅ 로그인 확인 및 WebSocket 연결
    checkAuthAndConnectWebSocket = async () => {
        const token = this.getToken();
        if (!token) {
            console.warn("🔴 로그인 필요: 로그인 페이지로 이동");
            this.props.navigate("/login");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/validate`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("❌ 인증 실패");

            console.log("✅ 로그인 확인됨. WebRTC WebSocket 연결 시작");
            this.connectWebSocket(token);
        } catch (error) {
            console.error("❌ 인증 실패: 로그인 페이지로 이동", error);
            localStorage.removeItem("token");
            this.props.navigate("/login");
        }
    };

    // ✅ WebSocket 연결
    connectWebSocket = (token) => {
        if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) return;

        this.webSocket = new WebSocket(`ws://localhost:8081/WebRTC/signaling?token=${token}`);

        this.webSocket.onopen = () => {
            console.log("✅ WebSocket 연결 성공");
            clearInterval(this.reconnectInterval);
        };

        this.webSocket.onmessage = (event) => {
            console.log("📩 받은 메시지:", event.data);
            try {
                const receivedMessage = JSON.parse(event.data);
                
                // ✅ 메시지를 즉시 업데이트
                this.setState((prevState) => {
                    const updatedMessages = [...prevState.messages, receivedMessage];
                    localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));
                    return { messages: updatedMessages, userId: receivedMessage.userId };
                });

                console.log("✅ 받은 사용자 ID:", receivedMessage.userId);
            } catch (e) {
                console.error("📩 JSON 파싱 오류:", e);
            }
        };

        this.webSocket.onerror = (error) => {
            console.error("❌ WebSocket 오류:", error);
        };

        this.webSocket.onclose = () => {
            console.log("🔴 WebSocket 연결 종료 → 5초 후 재연결 시도...");
            this.reconnectInterval = setTimeout(() => this.connectWebSocket(token), 5000);
        };
    };

    // ✅ 메시지 전송
    sendMessage = () => {
        if (this.state.message.trim() && this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
            const messageObject = { sender: "나", text: this.state.message };
            console.log("📡 메시지 전송:", messageObject);
            this.webSocket.send(JSON.stringify(messageObject));

            this.setState((prevState) => {
                const updatedMessages = [...prevState.messages, messageObject];
                localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));
                return { messages: updatedMessages, message: "" };
            });
        } else {
            console.error("❌ WebSocket 연결이 닫혀 있음!");
        }
    };

    // ✅ 엔터 키 이벤트 핸들러
    handleKeyPress = (event) => {
        if (event.key === "Enter") {
            this.sendMessage();
        }
    };

    render() {
        return (
            <div style={styles.chatBox}>
                <h3 style={styles.title}>채팅</h3>
                <h4>🆔 현재 로그인한 사용자 ID: {this.state.userId ? this.state.userId : "받는 중..."}</h4> {/* ✅ 사용자 ID 표시 */}
                <div style={styles.messageContainer}>
                    {this.state.messages.map((msg, idx) => (
                        <div key={idx} style={styles.message}>
                            <strong>{msg.sender}:</strong> {msg.text}
                        </div>
                    ))}
                </div>
                <div style={styles.inputContainer}>
                    <input
                        type="text"
                        value={this.state.message}
                        onChange={(e) => this.setState({ message: e.target.value })}
                        onKeyDown={this.handleKeyPress}
                        placeholder="실시간 채팅!!"
                        style={styles.input}
                    />
                    <div style={styles.buttonContainer}>
                        <button onClick={this.sendMessage} style={styles.button}>전송</button>
                        <button onClick={() => this.props.navigate("/main")} style={styles.buttonSecondary}>메인으로</button>
                    </div>
                </div>
            </div>
        );
    }
}

// ✅ 스타일 개선
const styles = {
    chatBox: {
        width: "320px",
        margin: "20px auto",
        border: "1px solid #ccc",
        borderRadius: "8px",
        overflow: "hidden",
        fontFamily: "'Arial', sans-serif",
        background: "#fff",
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
        gap: "5px",
    },
    input: {
        flex: 1,
        padding: "8px",
        border: "1px solid #ccc",
        borderRadius: "4px",
    },
    buttonContainer: {
        display: "flex",
        gap: "5px",
    },
    button: {
        padding: "8px 12px",
        background: "#007BFF",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
    },
    buttonSecondary: {
        padding: "8px 12px",
        background: "#6c757d",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
    },
};

// ✅ useNavigate를 사용하는 고차 컴포넌트로 감싸기
const ChatBoxWithNavigate = (props) => {
    const navigate = useNavigate();
    return <ChatBox {...props} navigate={navigate} />;
};

export default ChatBoxWithNavigate;
