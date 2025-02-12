import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; // useNavigate 사용
import { useParams } from "react-router-dom";
import { springApi } from "../../utils/api.js"; // React Router에서 useParams를 사용

import { useSelector } from "react-redux";

const Webrtc = () => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const peerConnectionRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const webSocketRef = useRef(null);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    const chatBoxRef = useRef(null); // 채팅창을 참조하는 useRef 추가
    const [isMuted, setIsMuted] = useState(false); // 음소거 상태 추가
    const [startTime, setStartTime] = useState(null); // 통화 시작 시간 저장
    const [endTime, setEndTime] = useState(null); // endTime 상태 정의
    const [loading, setLoading] = useState(false);
    const [isGameStarted, setIsGameStarted] = useState(false); // 게임 시작 여부 상태 추가
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    const token = useSelector((state) => state.auth.token); // ✅ Redux에서 토큰 가져오기
    const userId = useSelector((state) => state.auth.userId);

    const { roomId } = useParams(); // URL에서 roomId 가져오기
    const navigate = useNavigate();
    useEffect(() => {
        if ((token, roomId)) {
            // const decodedUserId = getUserIdFromToken(token);
            //     setUserId(decodedUserId); // ✅ 상태에 저장
            connectWebSocket(token, roomId);
        } else {
            console.error("JWT 토큰 없음: 로그인 필요");
        }

        // 뒤로가기 버튼 감지 및 방 나가기 처리
        const handleBackButton = () => {
            handleLeaveRoom().then(() => {
                navigate(-1); // 방 나가기 요청 후 뒤로가기
            });
        };

        window.onpopstate = handleBackButton; // 뒤로가기 클릭 이벤트 처리

        return () => {
            window.onpopstate = null; // 클린업: 컴포넌트가 언마운트될 때
        };
        // }, []);
    }, [token]); // ✅ Redux의 토큰 값이 변경될 때마다 실행

    // WebSocket 메시지 수신 처리
    useEffect(() => {
        if (!webSocketRef.current) return;

        const handleMessage = async (event) => {
            try {
                const receivedMessage = JSON.parse(event.data);
                // "ping" 메시지는 로그만 남기고 무시
                if (receivedMessage.type === "ping") {
                    console.log("📡 WebSocket 유지: Ping 메시지 수신");
                    return; // 채팅 메시지 목록에 추가하지 않음
                }
                console.log("📩 WebSocket 메시지 수신:", receivedMessage);

                if (receivedMessage.type === "offer") {
                    await handleOffer(receivedMessage);
                } else if (receivedMessage.type === "answer") {
                    await handleAnswer(receivedMessage);
                } else if (receivedMessage.type === "candidate") {
                    await handleCandidate(receivedMessage);
                } else {
                    // ✅ 메시지 상태 업데이트 (새로운 배열 생성)
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        receivedMessage,
                    ]);
                    console.log("📝 업데이트된 메시지 상태:", messages);
                }
            } catch (e) {
                console.error("JSON 파싱 오류:", e);
            }
        };

        webSocketRef.current.onmessage = handleMessage;

        //기존 소켓 연결 끊어짐 방지(WebSocket 연결 유지: 30초마다 'ping' 메시지 보내기)
        const pingInterval = setInterval(() => {
            if (
                webSocketRef.current &&
                webSocketRef.current.readyState === WebSocket.OPEN
            ) {
                webSocketRef.current.send(JSON.stringify({ type: "ping" }));
                console.log("📡 WebSocket 유지: Ping 전송");
            }
        }, 30000); // 30초마다 실행

        return () => {
            if (webSocketRef.current) {
                webSocketRef.current.onmessage = null;
            }
            clearInterval(pingInterval); // 컴포넌트 언마운트 시 핑 메시지 중단
        };
    }, []);

    // 메시지가 변경될 때 실행되는 자동 스크롤 useEffect
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]); // messages가 변경될 때마다 실행

    useEffect(() => {
        const fetchItems = async () => {
            try {
                setLoading(true);
                const response = await springApi.get("/game/items"); // 단어 목록 API 호출
                setItems(response.data);
            } catch (error) {
                console.error("❌ 단어 목록 불러오기 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    // JWT 토큰 가져오기
    //날림! 로컬에서 가져오는거

    // WebSocket 연결
    const connectWebSocket = (token, roomId) => {
        if (!roomId) {
            console.error("❌ 방 ID(roomId)가 없습니다.");
            return;
        }

        if (
            webSocketRef.current &&
            webSocketRef.current.readyState === WebSocket.OPEN
        ) {
            console.warn("WebSocket이 이미 연결되어 있음");
            return;
        }

        webSocketRef.current = new WebSocket(
            `wss://i12e104.p.ssafy.io:8081/WebRTC/signaling?token=${token}&roomId=${roomId}`
        );

        webSocketRef.current.onopen = () => {
            console.log(`✅ WebSocket 연결됨 (방 ID: ${roomId})`);

            // ✅ 방 입장 메시지 전송 (방에 참여하기 위해)
            const joinMessage = {
                type: "join",
                room_id: roomId, // 방 번호
                user_id: userId, // 사용자 ID
            };
            webSocketRef.current.send(JSON.stringify(joinMessage));
            console.log("🚀 방 입장 메시지 전송:", joinMessage);
        };

        webSocketRef.current.onclose = () => {
            console.log("WebSocket 연결 종료됨. 5초 후 재연결 시도...");
            setTimeout(() => {
                connectWebSocket(token, roomId);
            }, 5000);
        };
    };

    // 메시지 전송
    const sendMessage = () => {
        if (
            message.trim() &&
            webSocketRef.current &&
            webSocketRef.current.readyState === WebSocket.OPEN
        ) {
            if (!userId) {
                console.error("사용자 ID 없음");
                return;
            }

            const messageObject = {
                type: "chat", // ✅ 메시지 타입 추가
                user_id: userId, // 사용자 ID
                message: message.trim(),
                room_id: roomId, // 방 ID
                sentAt: new Date().toISOString(), // 메시지 보낸 시간
            };

            console.log("📡 메시지 전송:", messageObject);
            webSocketRef.current.send(JSON.stringify(messageObject));

            // 전송된 메시지 저장 (DB에 저장)
            saveMessageToDB(messageObject); // DB 저장

            setMessages((prev) => [...prev, messageObject]); // UI 업데이트
            setMessage(""); // 메시지 입력란 초기화
        } else {
            console.error("WebSocket 연결이 닫혀 있음!");
        }
    };

    // DB 저장 함수
    const saveMessageToDB = async (messageObject) => {
        const requestPayload = {
            // sender: messageObject.sender,  // sender 정보
            message: messageObject.message, // 메시지 내용
            room_id: messageObject.room_id, // 방 ID
            sent_at: messageObject.sent_at, // 보낸 시간
            user_id: messageObject.user_id, // 사용자 ID
        };
        console.log("Request Payload:", requestPayload);

        // user_id가 없으면 에러 처리
        if (!requestPayload.user_id) {
            console.error("필수 파라미터 누락: user_id가 없습니다.");
            return;
        }

        try {
            const response = await springApi.post(
                "/webrtc/messages",
                requestPayload,
                {}
            );
            console.log("메시지 저장 성공:", response.data);
        } catch (error) {
            console.error("메시지 저장 실패:", error);
        }
    };

    // 카메라 & 마이크 접근 및 로컬 스트림 설정

    const startMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            const now = new Date().toISOString().slice(0, 19); //로그 저장을 위해 현재 시간 기록
            setStartTime(now); // 시작시간 저장
            console.log("미디어 시작:", now);
        } catch (error) {
            console.error("미디어 접근 실패:", error);
        }
    };
    const endMedia = async () => {
        if (localStream) {
            localStream.getTracks().forEach((track) => track.stop());
            setLocalStream(null);
            localVideoRef.current.srcObject = null;

            const now = new Date().toISOString().slice(0, 19); // 종료 시간 기록
            setEndTime(now);
            console.log("미디어 종료:", now);
            saveWebRTCLog(startTime, now); //로그 저장 실행
        }
    };

    // WebRTC 연결 초기화
    const createPeerConnection = () => {
        peerConnectionRef.current = new RTCPeerConnection({
            iceServers: [
                {
                    // urls: "stun:stun.l.google.com:19302",
                    urls: "turn:3.39.252.223:3478?transport=tcp",
                    username: `${import.meta.env.VITE_USERNAME_URL}`,
                    credential: `${import.meta.env.VITE_PASSWORD_URL}`,
                },
            ],
        });

        peerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate) {
                sendToServer({
                    type: "candidate",
                    candidate: event.candidate,
                    room_id: roomId, // ✅ 방 ID 추가
                    user_id: userId, // ✅ 사용자 ID 추가
                });
            }
        };

        peerConnectionRef.current.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        if (localStream) {
            localStream.getTracks().forEach((track) => {
                peerConnectionRef.current.addTrack(track, localStream);
            });
        }
    };

    // Offer 생성 및 전송
    const createOffer = async () => {
        createPeerConnection();
        try {
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);
            sendToServer({
                type: "offer",
                sdp: offer.sdp,
                room_id: roomId, // ✅ 방 ID 추가
                user_id: userId, // ✅ 사용자 ID 추가
            });
        } catch (error) {
            console.error("Offer 생성 실패:", error);
        }
    };

    // Offer 수신 처리
    const handleOffer = async (message) => {
        createPeerConnection();
        try {
            await peerConnectionRef.current.setRemoteDescription(
                new RTCSessionDescription({
                    type: "offer",
                    sdp: message.sdp,
                })
            );
            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);
            sendToServer({
                type: "answer",
                sdp: answer.sdp,
                room_id: roomId, // ✅ 방 ID 추가
                user_id: userId, // ✅ 사용자 ID 추가
            });
        } catch (error) {
            console.error("Offer 처리 실패:", error);
        }
    };

    // Answer 수신 처리
    const handleAnswer = async (message) => {
        try {
            await peerConnectionRef.current.setRemoteDescription(
                new RTCSessionDescription({
                    type: "answer",
                    sdp: message.sdp,
                })
            );
        } catch (error) {
            console.error("Answer 처리 실패:", error);
        }
    };

    // ICE Candidate 처리
    const handleCandidate = async (message) => {
        try {
            if (message.candidate) {
                await peerConnectionRef.current.addIceCandidate(
                    new RTCIceCandidate(message.candidate)
                );
            }
        } catch (error) {
            console.error("ICE Candidate 추가 실패:", error);
        }
    };

    // WebSocket 메시지 전송
    const sendToServer = (message) => {
        if (!roomId) {
            console.error("❌ roomId가 없습니다. 메시지를 보낼 수 없습니다.");
            return;
        }

        if (
            webSocketRef.current &&
            webSocketRef.current.readyState === WebSocket.OPEN
        ) {
            const messageWithRoom = { ...message, roomId }; // ✅ roomId 추가
            webSocketRef.current.send(JSON.stringify(messageWithRoom));
        } else {
            console.error(
                "WebSocket이 연결되지 않음, 메시지 전송 실패:",
                message
            );
        }
    };
    const toggleMute = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!isMuted);
            }
        }
    };

    const saveWebRTCLog = async (startTime, endTime) => {
        console.log("저장할 사용자 ID:", userId); //user_id 값이 있는지 확인

        if (!userId) {
            console.error("사용자 ID 없음! 로그 저장 불가.");
            return;
        }

        const logData = {
            room_id: roomId, // 방 ID?
            user_id: userId, // 사용자 ID
            start_time: startTime,
            end_time: endTime,
        };

        console.log("📩 서버로 보낼 로그 데이터:", logData); //실제 전송 데이터 확인

        try {
            const response = await springApi.post("/webrtc/logs", logData, {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });

            if (response.status === 200) {
                console.log("WebRTC 로그 저장 성공");
            } else {
                console.error("WebRTC 로그 저장 실패");
            }
        } catch (error) {
            console.error("로그 저장 중 오류 발생:", error);
        }
    };
    // 방 나가기 요청
    const handleLeaveRoom = async () => {
        if (!userId) {
            alert("사용자 정보가 없습니다. 로그인 후 다시 시도해주세요.");
            return;
        }

        try {
            const response = await springApi.post(`/rooms/leave/${roomId}`, {
                user: userId,
                room: roomId,
            });
            if (response.status === 200) {
                alert("방에서 나갔습니다.");
                navigate("/room/RoomList"); // 방 목록 화면으로 이동
            }
        } catch (error) {
            console.error("❌ 방 나가기 실패:", error);
            alert("방 나가기 실패!");
        }
    };
    // 게임 시작
    const startGame = async () => {
        if (!userId) {
            alert("사용자 정보가 없습니다. 로그인 후 다시 시도해주세요.");
            return;
        }
        try {
            setLoading(true);
            const response = await springApi.post(`/game/start/${roomId}`, {
                userId,
            });
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

    // 사용자의 단어 선택 처리
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
    return (
        <div style={styles.container}>
            {/* 왼쪽 - 상대방(큰 화면) + 내 화면(작은 화면) */}
            <div style={styles.videoContainer}>
                <h3>WebRTC 테스트</h3>

                {/* 상대방 화면을 크게, 내 화면을 작게 배치 */}
                <div style={styles.videoWrapper}>
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        style={styles.largeVideo}
                    />
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        style={styles.smallVideo}
                    />
                </div>

                {/* 버튼을 비디오 아래로 이동 */}
                <div style={styles.buttonContainer}>
                    <button onClick={startMedia} style={styles.button}>
                        🎥 나의 화면 열기
                    </button>
                    <button onClick={createOffer} style={styles.button}>
                        📡 나의 화면 보여주기(Offer)
                    </button>
                    <button onClick={endMedia} style={styles.button}>
                        🛑 종료
                    </button>
                    <button onClick={toggleMute} style={styles.button}>
                        {isMuted ? "🔇 음소거 해제" : "🎤 음소거"}
                    </button>
                </div>
            </div>

            {/* 오른쪽 - 채팅 창 및 입력창 */}
            <div style={styles.chatContainer}>
                <h3>채팅</h3>
                <div ref={chatBoxRef} style={styles.chatBox}>
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            style={
                                msg.user_id === userId
                                    ? styles.myMessage
                                    : styles.otherMessage
                            } // 내 메시지는 오른쪽, 상대방은 왼쪽
                        >
                            <strong>user{msg.user_id}:</strong> {msg.message}
                        </div>
                    ))}
                </div>

                {/* 입력창과 전송 버튼을 채팅 아래로 이동 */}
                <div style={styles.inputContainer}>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="메시지 입력..."
                        style={styles.input}
                    />
                    <button onClick={sendMessage} style={styles.sendButton}>
                        전송
                    </button>
                </div>
            </div>
            {/* 방 나가기 버튼 추가 */}
            <div style={styles.leaveButtonContainer}>
                <button onClick={handleLeaveRoom} style={styles.leaveButton}>
                    방 나가기
                </button>
            </div>
            {/* 게임 시작 버튼 */}
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
                    ) : (
                        <p>❌ 사용할 수 있는 단어가 없습니다.</p>
                    )}
                </div>
            )}
        </div>
    );
};

// ✅ 스타일 추가
const styles = {
    container: {
        display: "flex",
        flexDirection: "row", // 📌 가로 정렬 유지
        justifyContent: "center",
        alignItems: "flex-start",
        gap: "20px",
        height: "100vh",
        padding: "20px",
        // background: "#f0d5a3", // 기존 배경색 유지
    },

    /** 🎥 왼쪽 - 화상 채팅 */
    videoContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        background: "transparent", // ✅ 노란 박스 제거
        padding: "20px",
        borderRadius: "10px",
    },

    /** ✅ 상대방(큰 화면) + 내 화면(작은 화면)을 배치 */
    videoWrapper: {
        display: "flex",
        flexDirection: "row",
        gap: "10px",
        alignItems: "center",
    },

    /** ✅ 상대방(큰 화면) */
    largeVideo: {
        width: "500px", // 상대방 화면 크게
        height: "300px",
        border: "2px solid #333",
        background: "black",
    },

    /** ✅ 내 화면(작은 화면) */
    smallVideo: {
        width: "200px", // 내 화면 작게
        height: "120px",
        border: "2px solid #999",
        background: "black",
    },

    buttonContainer: {
        display: "flex", // ✅ 가로 정렬
        justifyContent: "center", // ✅ 가운데 정렬
        gap: "15px", // ✅ 버튼 간격
        marginTop: "10px",
    },

    button: {
        padding: "10px",
        background: "#007BFF",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "background 0.2s",
    },

    buttonHover: {
        background: "#0056b3",
    },

    /** 💬 오른쪽 - 채팅 영역 */
    chatContainer: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "400px",
        height: "400px",
        padding: "10px",
        background: "#fff",
        borderRadius: "10px",
        border: "1px solid #ddd",
    },

    chatBox: {
        flex: "1",
        overflowY: "auto",

        background: "#f9f9f9",
        padding: "10px",
        borderRadius: "10px",
        border: "1px solid #ddd",
        display: "flex",
        flexDirection: "column",

        scrollBehavior: "smooth",
    },

    /** ✅ 입력창과 전송 버튼을 채팅 아래로 이동 */

    inputContainer: {
        display: "flex",
        width: "100%",
        gap: "10px",
        alignItems: "center",
    },

    input: {
        flex: "1",
        padding: "10px",
        borderRadius: "20px",
        border: "1px solid #ccc",
        outline: "none",

        fontSize: "14px",
    },

    sendButton: {
        padding: "10px 15px",
        borderRadius: "20px",
        background: "#007BFF",
        color: "white",
        border: "none",
        cursor: "pointer",
    },
    myMessage: {
        alignSelf: "flex-end", // 내 메시지는 오른쪽
        backgroundColor: "#007BFF",
        color: "white",
        borderRadius: "10px",
        padding: "5px 10px",
        marginBottom: "5px",
        maxWidth: "80%",
        wordBreak: "break-word",
    },

    otherMessage: {
        alignSelf: "flex-start", // 상대방 메시지는 왼쪽
        backgroundColor: "#f1f1f1",
        color: "black",
        borderRadius: "10px",
        padding: "5px 10px",
        marginBottom: "5px",
        maxWidth: "80%",
        wordBreak: "break-word",
    },
    leaveButtonContainer: {
        marginTop: "20px",
        display: "flex",
        justifyContent: "center",
    },
    leaveButton: {
        padding: "10px 20px",
        backgroundColor: "#FF5733",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
};

export default Webrtc;
