import React, {Component} from "react";
import {useNavigate} from "react-router-dom"; // ✅ useNavigate 사용

class ChatBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: "",
            messages: JSON.parse(localStorage.getItem("chatMessages")) || [],
        };
        this.webSocket = null;
        this.reconnectInterval = null;
    }

    componentDidMount() {
        this.connectWebSocket();
    }

    componentWillUnmount() {
        if (this.webSocket) {
            this.webSocket.close();
        }
        clearInterval(this.reconnectInterval);
    }

    // ✅ WebSocket 연결 함수
    connectWebSocket = () => {
        if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
            return; // 이미 연결된 경우 중복 연결 방지
        }

        this.webSocket = new WebSocket("ws://localhost:8081/WebRTC/signaling");

        this.webSocket.onopen = () => {
            console.log("✅ WebSocket 연결 성공");
            clearInterval(this.reconnectInterval); // 🔄 재연결 시도 중이면 해제
        };

        this.webSocket.onmessage = (event) => {
            console.log("📩 받은 메시지:", event.data);
            try {
                const receivedMessage = JSON.parse(event.data);
                this.setState((prevState) => {
                    const updatedMessages = [...prevState.messages, receivedMessage];
                    localStorage.setItem("chatMessages", JSON.stringify(updatedMessages)); // ✅ 메시지 저장
                    return {messages: updatedMessages};
                });
            } catch (e) {
                console.error("📩 JSON 파싱 오류:", e);
            }
        };

        this.webSocket.onerror = (error) => {
            console.error("❌ WebSocket 오류:", error);
        };

        this.webSocket.onclose = () => {
            console.log("🔴 WebSocket 연결 종료 → 5초 후 재연결 시도...");
            this.reconnectInterval = setTimeout(this.connectWebSocket, 5000); // ✅ 5초 후 재연결
        };
    };

    // ✅ 메시지 전송 함수
    sendMessage = () => {
        if (this.state.message.trim() && this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
            const messageObject = {sender: "나", text: this.state.message};
            this.webSocket.send(JSON.stringify(messageObject));
            this.setState((prevState) => {
                const updatedMessages = [...prevState.messages, messageObject];
                localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));
                return {messages: updatedMessages, message: ""};
            });
        }
    };
    // ✅ 엔터 키 이벤트 핸들러 추가
    handleKeyPress = (event) => {
        if (event.key === "Enter") {
            this.sendMessage();
        }
    };

    render() {
        return (
            <div style={styles.chatBox}>
                <h3 style={styles.title}>채팅</h3>
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
                        onChange={(e) => this.setState({message: e.target.value})}
                        onKeyDown={this.handleKeyPress} // ✅ 엔터 키 이벤트 추가
                        placeholder="실시간 채팅!!"
                        style={styles.input}
                    />
                    <div style={styles.buttonContainer}>
                        <button onClick={this.sendMessage} style={styles.button}>
                            전송
                        </button>
                        <button onClick={() => this.props.navigate("/main")} style={styles.buttonSecondary}>
                            메인으로
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

// ✅ 스타일 개선 (버튼 가로 정렬 추가)
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
        display: "flex", // ✅ 버튼과 입력창을 가로로 정렬
        alignItems: "center",
        padding: "10px",
        gap: "5px", // ✅ 버튼 간격 조정
    },
    input: {
        flex: 1,
        padding: "8px",
        border: "1px solid #ccc",
        borderRadius: "4px",
    },
    buttonContainer: {
        display: "flex", // ✅ 버튼을 가로 정렬
        gap: "5px", // ✅ 버튼 간격 추가
    },
    button: {
        padding: "8px 12px",
        background: "#007BFF",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        whiteSpace: "nowrap", // ✅ 버튼 내 텍스트 한 줄 유지
    },
    buttonSecondary: {
        padding: "8px 12px",
        background: "#6c757d",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        whiteSpace: "nowrap", // ✅ 버튼 내 텍스트 한 줄 유지
    },
};

// ✅ useNavigate를 사용하는 고차 컴포넌트로 감싸기
const ChatBoxWithNavigate = (props) => {
    const navigate = useNavigate();
    return <ChatBox {...props} navigate={navigate}/>;
};

export default ChatBoxWithNavigate;
