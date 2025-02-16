import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { springApi } from "../../utils/api.js";
import "./Webrtc.css";
// import rtc from '../../assets/images/rtc.png';

const Webrtc = () => {
    // ===================================================
    //                      상태 & 참조
    // ===================================================
    const [localStream, setLocalStream] = useState(null);
    const peerConnectionRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const chatBoxRef = useRef(null);
    const webSocketRef = useRef(null);

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [isMuted, setIsMuted] = useState(false);

    // 통화 시간 기록 (로그 저장에 활용)
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);

    // 게임 관련 상태
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [items, setItems] = useState([]);
    const [choice, setChoice] = useState(null);
    const [correctAnswer, setCorrectAnswer] = useState(null);

    // 방장 여부
    const [isHost, setIsHost] = useState(false);

    // 로딩 & 나감 여부
    const [loading, setLoading] = useState(false);
    const [didLeave, setDidLeave] = useState(false);

    // Redux & Router
    const token = useSelector((state) => state.auth.token);
    const userId = useSelector((state) => state.auth.userId);
    const { roomId } = useParams();
    const navigate = useNavigate();

    // ===================================================
    //                 초기 방장 여부 확인
    // ===================================================
    useEffect(() => {
        if (!roomId) {
            console.error("🚨 roomId가 없습니다. 방장 여부 확인 불가");
            return;
        }
        fetchHostStatus(); // 서버에 방 참가 요청하여 방장 여부 확인
    }, [roomId]);

    const fetchHostStatus = async () => {
        try {
            const response = await springApi.post(`/rooms/join`, {
                user_id: userId,
                room_id: roomId,
            });

            if (!response || !response.data) {
                throw new Error("🚨 서버 응답이 없습니다.");
            }

            const isHostValue = response.data.host || false;
            setIsHost(isHostValue);
            console.log("🚀 방장 여부:", isHostValue ? "방장" : "참가자");
        } catch (error) {
            console.error("방장 여부 확인 실패:", error.message);
            navigate("/room/RoomList");
        }
    };

    // ===================================================
    //             WebSocket 연결 & 초기 설정
    // ===================================================
    useEffect(() => {
        if (!token || !roomId) {
            console.error("❌ JWT 토큰 또는 roomId가 없습니다.");
            return;
        }
        connectWebSocket(token, roomId);

        // 새로고침 / 브라우저 닫기 시 leave 메시지 전송
        const handleBeforeUnload = () => {
            if (
                webSocketRef.current &&
                webSocketRef.current.readyState === WebSocket.OPEN
            ) {
                webSocketRef.current.send(
                    JSON.stringify({
                        type: "leave",
                        room_id: roomId,
                        user_id: userId,
                    })
                );
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
        // eslint-disable-next-line
    }, [token, roomId]);

    /**
     * WebSocket 연결 설정
     */
    const connectWebSocket = (token, roomId) => {
        if (!roomId) {
            console.error("❌ 방 ID(roomId)가 없습니다.");
            return;
        }
        // 이미 연결된 소켓이 있으면 중복 연결 X
        if (
            webSocketRef.current &&
            webSocketRef.current.readyState === WebSocket.OPEN
        ) {
            console.warn("⚠️ WebSocket이 이미 연결되어 있습니다.");
            return;
        }

        // 실제 서버 주소/포트를 맞춰주세요.
        webSocketRef.current = new WebSocket(
            `wss://i12e104.p.ssafy.io:8081/WebRTC/signaling?token=${token}&roomId=${roomId}`
            // `ws://localhost:8081/WebRTC/signaling?token=${token}&roomId=${roomId}`
        );

        // 소켓 open
        webSocketRef.current.onopen = () => {
            console.log(`✅ WebSocket 연결됨 (방 ID: ${roomId})`);
            const joinMessage = {
                type: "join",
                room_id: roomId,
                user_id: userId,
            };
            webSocketRef.current.send(JSON.stringify(joinMessage));
            console.log("🚀 방 입장 메시지 전송:", joinMessage);
        };

        // 소켓 message
        webSocketRef.current.onmessage = (event) => {
            handleSocketMessage(event);
        };

        // 소켓 close
        webSocketRef.current.onclose = () => {
            console.warn("⚠️ WebSocket 연결 종료됨. 5초 후 재연결 시도...");
            setTimeout(() => {
                connectWebSocket(token, roomId);
            }, 5000);
        };
    };

    // ===================================================
    //        뒤로가기(라우트 이동) 등으로 컴포넌트가
    //                언마운트될 때 cleanup
    // ===================================================
    useEffect(() => {
        return () => {
            // 컴포넌트 언마운트 시
            if (!didLeave) {
                console.log("[cleanup] 뒤로가기 or 라우트 이동 -> sendLeave");
                sendLeave({ showAlert: false });
            }
        };
        // eslint-disable-next-line
    }, [didLeave]);

    // ===================================================
    //              WebSocket 메시지 수신 처리
    // ===================================================
    const handleSocketMessage = async (event) => {
        let receivedMessage;
        try {
            receivedMessage = JSON.parse(event.data);
        } catch (e) {
            console.error("JSON 파싱 오류:", e);
            return;
        }

        const { type } = receivedMessage || {};

        // ping (연결 유지를 위한 것)이면 바로 return
        if (type === "ping") {
            console.log("📡 WebSocket Ping 수신");
            return;
        }

        console.log("📩 WebSocket 메시지 수신:", receivedMessage);

        switch (type) {
            // WebRTC Offer/Answer/Candidate
            case "offer":
                handleOffer(receivedMessage);
                break;
            case "answer":
                handleAnswer(receivedMessage);
                break;
            case "candidate":
                handleCandidate(receivedMessage);
                break;

            // 게임 로직: 단어 목록(items), 참가자 선택(choice), 정답(answerChoice)
            case "items":
                handleItems(receivedMessage);
                break;
            case "choice":
                handleChoice(receivedMessage);
                break;
            case "answerChoice":
                handleAnswerChoice(receivedMessage);
                break;

            // 그 외(채팅 등)
            default:
                // 채팅 메시지 등
                setMessages((prev) => [...prev, receivedMessage]);
                break;
        }
    };

    // ===================================================
    //            주기적 ping 메시지 보내기
    // ===================================================
    useEffect(() => {
        const sendPing = () => {
            if (
                webSocketRef.current &&
                webSocketRef.current.readyState === WebSocket.OPEN
            ) {
                webSocketRef.current.send(JSON.stringify({ type: "ping" }));
                console.log("📡 Ping 메시지 전송");
            }
        };
        const pingInterval = setInterval(sendPing, 10000); // 10초마다 실행

        return () => {
            clearInterval(pingInterval);
        };
    }, []);

    // ===================================================
    //      채팅 메시지가 추가될 때 자동 스크롤
    // ===================================================
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    // ===================================================
    //            WebRTC (오디오/비디오) 로직
    // ===================================================
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
            const now = new Date().toISOString().slice(0, 19);
            setStartTime(now); // 시작시간 저장
            console.log("미디어 시작:", now);
        } catch (error) {
            console.error("미디어 접근 실패:", error);
        }
    };

    const endMedia = () => {
        if (localStream) {
            localStream.getTracks().forEach((track) => track.stop());
            setLocalStream(null);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = null;
            }
            const now = new Date().toISOString().slice(0, 19);
            setEndTime(now);
            console.log("미디어 종료:", now);
            saveWebRTCLog(startTime, now); //로그 저장 실행
        }
    };

    const createPeerConnection = () => {
        peerConnectionRef.current = new RTCPeerConnection({
            iceServers: [
                {
                    urls: "turn:3.39.252.223:3478?transport=tcp",
                    username: import.meta.env.VITE_USERNAME_URL,
                    credential: import.meta.env.VITE_PASSWORD_URL,
                },
                // { urls: "stun:stun.l.google.com:19302" },
            ],
        });

        // ICE Candidate 감지
        peerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate) {
                sendToServer({
                    type: "candidate",
                    candidate: event.candidate,
                    room_id: roomId,
                    user_id: userId,
                });
            }
        };

        // 원격 트랙 수신
        peerConnectionRef.current.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        // 로컬 스트림 트랙 추가
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
                room_id: roomId,
                user_id: userId,
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
                room_id: roomId,
                user_id: userId,
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

    // ===================================================
    //              WebSocket 메시지 전송 공통
    // ===================================================
    const sendToServer = (msgObj) => {
        if (!roomId) {
            console.error("roomId가 없습니다. 메시지를 보낼 수 없습니다.");
            return;
        }

        if (
            webSocketRef.current &&
            webSocketRef.current.readyState === WebSocket.OPEN
        ) {
            webSocketRef.current.send(JSON.stringify(msgObj));
        } else {
            console.error("❌ WebSocket이 닫혀 있어 메시지 전송 실패:", msgObj);
        }
    };

    // ===================================================
    //                   채팅 로직
    // ===================================================
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
                type: "chat",
                user_id: userId,
                message: message.trim(),
                room_id: roomId,
                sentAt: new Date().toISOString(),
            };
            console.log("📡 채팅 메시지 전송:", messageObject);

            webSocketRef.current.send(JSON.stringify(messageObject));

            // UI에 채팅 추가
            setMessages((prev) => [...prev, messageObject]);
            setMessage("");

            // (선택) DB에 저장
            saveMessageToDB(messageObject);
        } else {
            console.error("❌ WebSocket 연결이 닫혀 있거나 메시지가 비어있음");
        }
    };

    const saveMessageToDB = async (messageObject) => {
        const requestPayload = {
            message: messageObject.message,
            room_id: messageObject.room_id,
            sent_at: messageObject.sentAt,
            user_id: messageObject.user_id,
        };

        if (!requestPayload.user_id) {
            console.error("❌ user_id가 없어 메시지 DB 저장 불가");
            return;
        }

        try {
            const response = await springApi.post(
                "/webrtc/messages",
                requestPayload
            );
            console.log("✅ 메시지 저장 성공:", response.data);
        } catch (error) {
            console.error("메시지 저장 실패:", error);
        }
    };

    // ===================================================
    //              음소거 토글
    // ===================================================
    const toggleMute = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!isMuted);
            }
        }
    };

    // ===================================================
    //        “나가기” (수동 + 뒤로가기 cleanup)
    // ===================================================
    const sendLeave = useCallback(
        (options = { showAlert: true }) => {
            // 이미 떠났으면 중복 X
            if (didLeave) return;
            setDidLeave(true);

            if (options.showAlert) {
                alert("방에서 나갑니다.");
            }

            if (
                webSocketRef.current &&
                webSocketRef.current.readyState === WebSocket.OPEN
            ) {
                const messageObject = {
                    type: "leave",
                    user_id: userId,
                    room_id: roomId,
                    sentAt: new Date().toISOString(),
                };
                console.log("📡 방 퇴장 메시지 전송:", messageObject);
                webSocketRef.current.send(JSON.stringify(messageObject));
            }

            if (webSocketRef.current) {
                webSocketRef.current.close();
            }

            navigate("/room/RoomList");
        },
        [didLeave, userId, roomId, navigate]
    );

    // ===================================================
    //           WebRTC 사용 로그 서버 전송
    // ===================================================
    const saveWebRTCLog = async (start, end) => {
        if (!userId) {
            console.error("사용자 ID 없음! 로그 저장 불가.");
            return;
        }

        const logData = {
            room_id: roomId,
            user_id: userId,
            start_time: start,
            end_time: end,
        };
        console.log("📄 WebRTC 로그 전송:", logData);

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
            console.error("로그 저장 중 오류:", error);
        }
    };

    // ===================================================
    //               게임 관련 (items, choice)
    // ===================================================
    /**
     * 방장이 "게임 시작" 버튼 클릭
     * - 임시로 springApi 호출 후, items 로드
     */
    const startGame = async () => {
        if (!isHost) {
            alert("방장만 게임을 시작할 수 있습니다.");
            return;
        }
        try {
            const response = await springApi.post(`/rgames/start/${roomId}`, {
                userId,
            });
            if (response.status === 200) {
                setIsGameStarted(true);
            }
            setChoice(null);
            setCorrectAnswer(null);
            fetchGameWords();
        } catch (error) {
            console.error("게임 시작 오류:", error);
        }
    };

    // 단어 목록 불러오기
    const fetchGameWords = async () => {
        try {
            const response = await springApi.get(`/rgames/item`);
            console.log("📩 게임 단어 목록 응답:", response.data);

            if (response.status === 200 && typeof response.data === "object") {
                const wordsArray = Object.values(response.data);
                setItems(wordsArray);
            } else {
                console.error("🚨 서버 응답이 올바르지 않음:", response.data);
                setItems([]);
            }
        } catch (error) {
            console.error("단어 목록 불러오기 실패:", error);
            setItems([]);
        }
    };

    // 단어 목록 수신 (WebSocket)
    const handleItems = (message) => {
        const received = message.items;
        if (Array.isArray(received)) {
            setChoice(null);
            setCorrectAnswer(null);
            setItems(received);
            console.log("📝 수신한 items:", received);
            setIsGameStarted(true);
        } else {
            console.error("🚨 items 데이터가 배열이 아님:", received);
        }
    };

    // 선택(choice) 수신 (참가자)
    const handleChoice = (message) => {
        if (message.choice) {
            setChoice(message.choice);
            console.log("📝 참가자 choice 수신:", message.choice);
        } else {
            console.error("🚨 잘못된 choice 데이터:", message);
        }
    };

    // 정답(answerChoice) 수신
    const handleAnswerChoice = (message) => {
        if (message.answer_choice) {
            setCorrectAnswer(message.answer_choice);
            console.log("📝 정답(answerChoice) 수신:", message.answer_choice);
        } else {
            console.error("🚨 잘못된 answerChoice 데이터:", message);
        }
    };

    // 호스트가 단어 목록(items)을 모두에게 전송
    const sendItems = () => {
        if (!isHost || !items.length) return;
        if (
            webSocketRef.current &&
            webSocketRef.current.readyState === WebSocket.OPEN
        ) {
            const msg = {
                type: "items",
                user_id: userId,
                items,
                room_id: roomId,
                sentAt: new Date().toISOString(),
            };
            console.log("📡 items 전송:", msg);
            webSocketRef.current.send(JSON.stringify(msg));
        }
    };

    // 참가자: 단어를 골랐을 때
    const sendChoice = (word) => {
        setChoice(word);
        if (isHost) {
            console.error("❌ 방장은 choice를 보낼 수 없습니다.");
            return;
        }
        if (
            webSocketRef.current &&
            webSocketRef.current.readyState === WebSocket.OPEN
        ) {
            const msg = {
                type: "choice",
                user_id: userId,
                choice: word,
                room_id: roomId,
                sentAt: new Date().toISOString(),
            };
            console.log("📡 choice 전송:", msg);
            webSocketRef.current.send(JSON.stringify(msg));
        }
    };

    // 호스트: 정답(answerChoice)를 선택했을 때
    const sendAnswerChoice = (answerChoice) => {
        setCorrectAnswer(answerChoice);
        if (!isHost) {
            console.error("❌ 참가자는 answerChoice를 보낼 수 없습니다.");
            return;
        }
        if (
            webSocketRef.current &&
            webSocketRef.current.readyState === WebSocket.OPEN
        ) {
            const msg = {
                type: "answerChoice",
                user_id: userId,
                answer_choice: answerChoice,
                room_id: roomId,
                sentAt: new Date().toISOString(),
            };
            console.log("📡 answerChoice 전송:", msg);
            webSocketRef.current.send(JSON.stringify(msg));
        }
    };

    /**
     * items가 변경될 때마다
     * - 방장이면 다른 참가자에게도 전송
     */
    useEffect(() => {
        if (isHost && items.length > 0) {
            sendItems();
        }
    }, [items]); // items 변경 감지
    const colors = ["빨강", "주황", "노랑", "초록", "파랑", "보라"]; // 인덱스별 색상 지정

    // ===================================================
    //                      렌더링
    // ===================================================
    return (
        <div className="container">
            {/*<div className="container" style={{ backgroundImage: `url(${rtc}`}}>?*/}
            {/* 왼쪽 - 상대방(큰 화면) + 내 화면(작은 화면) */}

            {/* ✅ 비디오 컨테이너 + 채팅 컨테이너를 가로 정렬 */}
            <div className="video-chat-wrapper">
                {/* 게임 화면 */}
                {/*{isGameStarted && (*/}
                <div>
                    {/*<h2>{isHost ? "🎩 방장 화면" : "🧑‍🤝‍🧑 참가자 화면"}</h2>*/}

                    {/* 게임 시작 버튼 (방장만 보이도록 설정) */}
                    {isHost && (
                        <button
                            onClick={() => {
                                console.log("🎮 게임 시작 버튼 클릭됨!"); // 🔥 디버깅 로그 추가
                                startGame(); // ✅ 단어 목록 불러오기 실행
                            }}
                            className="start-game-button"
                        >
                            게임 시작
                        </button>
                    )}
                    <div className="host-answer-selection">
                        {isHost && (
                            <div className="host-answer-selection">
                                <h3>정답 선택</h3>
                                <div className="answer-buttons">
                                    {items.length > 0 ? (
                                        items.map((word, index) => (
                                            <div
                                                key={index}
                                                className="answer-button-wrapper"
                                            >
                                                <button
                                                    onClick={() =>
                                                        sendAnswerChoice(word)
                                                    }
                                                    className="answer-button"
                                                    style={{
                                                        backgroundColor:
                                                            correctAnswer ===
                                                            word
                                                                ? "red"
                                                                : "white",
                                                        color:
                                                            correctAnswer ===
                                                            word
                                                                ? "white"
                                                                : "black",
                                                        border:
                                                            correctAnswer ===
                                                            word
                                                                ? "3px solid red"
                                                                : "1px solid black",
                                                    }}
                                                >
                                                    {colors[index]}
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="loading-message">
                                            📌 단어 목록을 불러오는 중...
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="video-container">
                    {/* 상대방 화면을 크게, 내 화면을 작게 배치 */}
                    <div className="video-wrapper">
                        {/* 상대방 화면 */}
                        <div className="video-box">
                            <div className="video-label">상대방 화면</div>
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="large-video"
                            />
                        </div>

                        {/* 본인 화면 (왕관 or 크리스마스 리스 추가) */}
                        <div className="video-box small-video-container">
                            <div className="video-label">본인 화면</div>

                            {/* 🏆 왕관 or 🎄 크리스마스 리스 추가 */}
                            <div className="role-badge">
                                {isHost ? "👑" : "🎄"}
                            </div>

                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="small-video"
                            />
                        </div>
                    </div>

                    <div className="button-container">
                        <button onClick={startMedia} className="button">
                            🎥 나의 화면 열기
                        </button>
                        <button onClick={createOffer} className="button">
                            📡 나의 화면 보여주기
                        </button>
                        <button onClick={endMedia} className="button">
                            🛑 종료
                        </button>
                        <button onClick={toggleMute} className="button">
                            {isMuted ? "🔇 음소거 해제" : "🎤 음소거"}
                        </button>
                    </div>
                </div>
                {/* 버튼을 비디오 아래로 이동 */}

                <div className="chat-container">
                    <div ref={chatBoxRef} className="chat-box">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={
                                    msg.user_id === userId
                                        ? "my-message"
                                        : "other-message"
                                } // 내 메시지는 오른쪽, 상대방은 왼쪽
                            >
                                <strong>user{msg.user_id}:</strong>{" "}
                                {msg.message}
                            </div>
                        ))}
                    </div>

                    {/* 입력창과 전송 버튼을 채팅 아래로 이동 */}
                    <div className="input-container">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="메시지 입력..."
                            className="input"
                        />
                        <button onClick={sendMessage} className="send-button">
                            전송
                        </button>
                    </div>
                </div>
            </div>

            {/* 오른쪽 - 채팅 창 및 입력창 */}
            {/* 방 나가기 버튼 추가 */}
            <div className="game-container">
                <h2>🎮 사물 맞추기 게임</h2>
                <p>입모양을 보고, 색상이 들어간 정답을 선택하세요!</p>

                {/* 🛠️ 로그 추가: items 상태 확인 */}
                {console.log("📌 렌더링 중 items 상태:", items)}

                <div className="game-buttons">
                    {items.length > 0 ? (
                        items.map((word, index) => (
                            <button
                                key={index}
                                onClick={() => sendChoice(word)}
                                className="game-button"
                                style={{
                                    backgroundColor:
                                        choice === word ? "lightblue" : "white",
                                    border:
                                        correctAnswer === word
                                            ? "3px solid red"
                                            : "1px solid black",
                                }}
                            >
                                {word}
                            </button>
                        ))
                    ) : (
                        <p className="loading-message">
                            📌 단어 목록을 불러오는 중...
                        </p>
                    )}
                </div>

                {/* 방 나가기 버튼 */}
                {/* <div className="leave-ButtonContainer">
                    <button
                        onClick={() => sendLeave({ showAlert: true })}
                        className=".leave-button"
                    >
                        방 나가기
                    </button>
                </div> */}
            </div>
        </div>
    );
};

export default Webrtc;
