import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { springApi } from "../../utils/api.js";
import GoBackButton from "../../components/button/GoBackButton";
import "./Webrtc.css";
import backgroundImage from "../../assets/background/Webrtc_Bg.webp";
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
    const [myUsername, setMyUsername] = useState();
    const [otherUsername, setOtherUsername] = useState();

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

    const [isRecording, setIsRecording] = useState(false); // 녹음 중인지 여부
    const [feedbackMessage, setFeedbackMessage] = useState(""); // 피드백 메시지

    // 음성 녹음을 통한 단어 선택(참가자)
    const mediaRecorderRef = useRef(null); // MediaRecorder 참조
    const audioChunksRef = useRef([]); // 녹음된 음성 데이터 조각

    // ===================================================
    //                  음성 녹음 기능
    // ===================================================
    // 🎤 녹음 시작
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            const mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, {
                    type: "audio/webm",
                });
                audioChunksRef.current = [];
                await sendAudioToServer(audioBlob); // 녹음된 오디오를 서버로 전송
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setIsRecording(true);

            // 4초 후 자동 녹음 종료
            setTimeout(() => {
                stopRecording();
            }, 4000);
        } catch (error) {
            console.error("마이크 권한 요청 실패:", error);
        }
    };

    // 🎤 녹음 종료
    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
        // 🛑 녹음 스트림(마이크) 해제
        if (localStream) {
            localStream.getTracks().forEach((track) => track.stop());
            setLocalStream(null);
        }
    };

    // ===================================================
    //          녹음된 음성을 백엔드로 전송
    // ===================================================

    const sendAudioToServer = async (audioBlob) => {
        const formData = new FormData();
        formData.append("audio", audioBlob, "audio.webm");

        try {
            if (!token)
                throw new Error("Access Token이 없습니다. 로그인하세요.");

            const response = await springApi.post(
                `/rgames/upload-voice/${roomId}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                }
            );

            if (response.status === 200) {
                const result = response.data;
                console.log("AI 변환된 단어:", result);

                // 🟢 변환된 단어가 `items` 목록 중 하나인지 확인
                if (result && items.includes(result)) {
                    console.log("올바른 단어, 버튼 자동 선택:", result);

                    // UI에서 해당 버튼을 클릭한 것처럼 보이게 설정
                    setChoice(result);

                    // WebSocket을 통해 상대방에게도 선택 정보 전송
                    sendChoice(result);
                } else {
                    console.warn("⚠️ 변환된 단어가 목록에 없습니다:", result);
                    setFeedbackMessage("❌ 올바른 단어를 말해주세요.");
                }
            }
        } catch (error) {
            console.error("❌ 음성 전송 오류:", error);
        }
    };

    // ===================================================
    //                 초기 방장 여부 확인
    // ===================================================
    useEffect(() => {
        if (!roomId) {
            console.error("🚨 roomId가 없습니다. 방장 여부 확인 불가");
            navigate("/room/RoomList");
            return;
        }
        fetchHostStatus(); // 서버에 방 참가 요청하여 방장 여부 확인
    }, [roomId]);

    const fetchHostStatus = async () => {
        try {
            const response = await springApi.post(`/rooms/valid`, {
                user_id: userId,
                room_id: roomId,
            });

            if (!response || !response.data) {
                throw new Error("🚨 서버 응답이 없습니다.");
            }

            console.log("응답: ", response.data);

            if (response.data.user_cnt > 2) {
                console.error("최대 인원 수 초과");
                navigate("/room/RoomList");
            }

            const isHostValue = response.data.is_host || false;
            setIsHost(isHostValue);

            //사용자 이름 저장
            const responseUsername = response.data.username;
            setMyUsername(responseUsername);

            console.log("🚀 방장 여부:", isHostValue ? "방장" : "참가자");
            console.log("유저 응답 : ", responseUsername);
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
                const leaveMessage = {
                    type: "leave",
                    room_id: roomId,
                    user_id: userId,
                };
                webSocketRef.current.send(JSON.stringify(leaveMessage));
                console.log("🚀 방 퇴장 메시지 전송:", leaveMessage);
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
            // `wss://i12e104.p.ssafy.io:8081/WebRTC/signaling?token=${token}&roomId=${roomId}`
            `ws://localhost:8081/WebRTC/signaling?token=${token}&roomId=${roomId}`
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
                // {
                //     urls: "turn:3.39.252.223:3478?transport=tcp",
                //     username: import.meta.env.VITE_USERNAME_URL,
                //     credential: import.meta.env.VITE_PASSWORD_URL,
                // },
                { urls: "stun:stun.l.google.com:19302" },
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
        if (!message.trim()) {
            console.error("❌ 메시지가 비어 있음");
            return;
        }
        if (!myUsername) {
            console.error("❌ 사용자 이름 없음! (아직 로딩 중일 가능성 있음)");
            return;
        }
        if (
            !webSocketRef.current ||
            webSocketRef.current.readyState !== WebSocket.OPEN
        ) {
            console.error("❌ WebSocket 연결이 닫혀 있음");
            return;
        }

        if (!userId) {
            console.error("사용자 ID 없음");
            return;
        }
        if (!myUsername) {
            console.error("사용자 이름 없음!");
            return;
        }
        const messageObject = {
            type: "chat",
            user_id: userId,
            username: myUsername,
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
                "/webrtcs/message",
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

            // 🛑 마이크 & 카메라 스트림 종료
            if (localStream) {
                localStream.getTracks().forEach((track) => track.stop());
                setLocalStream(null);
            }
            // 🛑 WebRTC PeerConnection 닫기
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
                peerConnectionRef.current = null;
            }
            // 🛑 MediaRecorder 정리
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
                mediaRecorderRef.current = null;
            }

            navigate("/room/RoomList");
        },
        [didLeave, userId, roomId, navigate, localStream]
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
            const response = await springApi.post("/webrtcs/log", logData, {
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
        if (!word) {
            console.error("🚨 `sendChoice()` 호출 시 word가 undefined입니다!");
            return;
        }

        if (!isHost) {
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

    // ===================================================
    //                      렌더링
    // ===================================================
    return (
        <div
            className="webrtc-container"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <div className="webrtc-game-overlay">
                {/* 왼쪽 - 상대방(큰 화면) + 내 화면(작은 화면) */}
                <GoBackButton />
                {/* ✅ 비디오 컨테이너 + 채팅 컨테이너를 가로 정렬 */}
                <div className="video-chat-wrapper">
                    <div className="video-answer-wrapper">
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
                    </div>

                    <div className="video-container">
                        <div className="video-wrapper">
                            {/* 상대방 화면 */}
                            <div className="video-box">
                                <div className="video-label">상대방 화면</div>
                                <video
                                    ref={remoteVideoRef}
                                    autoPlay
                                    playsInline
                                    className="large-video"
                                    aria-label="상대방 비디오"
                                />
                            </div>

                            {/* 본인 화면 */}
                            <div className="video-box small-video-container">
                                <div className="video-label">본인 화면</div>
                                <div className="role-badge">
                                    {isHost ? "👑" : "🎄"}
                                </div>
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="small-video"
                                    aria-label="내 비디오"
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

                    {/* 채팅 컨테이너 */}
                    <div className="chat-container" role="region">
                        <div ref={chatBoxRef} className="chat-box">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={
                                        msg.username === myUsername
                                            ? "my-message"
                                            : "other-message"
                                    }
                                >
                                    <strong>{msg.username}: </strong>
                                    {msg.message}
                                </div>
                            ))}
                        </div>

                        {/* 입력창 */}
                        <div className="input-container">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault(); // 폼 자동 제출 방지
                                        sendMessage();
                                    }
                                }}
                                placeholder="메시지 입력..."
                                className="input"
                            />
                            <button
                                onClick={sendMessage}
                                className="send-button"
                            >
                                전송
                            </button>
                        </div>
                    </div>
                </div>

                {/* 오른쪽 - 게임 UI */}
                <div className="webrtc-game-container">
                    <h2>🎮 사물 맞추기 게임</h2>
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center", // 문구와 버튼 수직 정렬
                            gap: "1rem", // 문구와 버튼 사이 간격
                        }}
                    >
                        <p style={{ margin: 0 }}>
                            입모양을 보고, 색상이 들어간 정답을 말하세요!
                        </p>
                        {/* 말하기/그만하기 버튼 */}
                        {!isHost && (
                            <button
                                className={`voice-record-button ${
                                    isRecording ? "recording" : ""
                                }`}
                                onClick={
                                    isRecording ? stopRecording : startRecording
                                }
                            >
                                {isRecording ? "그만하기" : "말하기"}
                            </button>
                        )}
                    </div>
                    {/* 🛠️ 로그 추가: items 상태 확인 */}
                    {console.log("📌 렌더링 중 items 상태:", items)}

                    <div className="game-buttons">
                        {items.length > 0 ? (
                            items.map((word, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        if (isHost) {
                                            sendAnswerChoice(word); // 방장은 정답을 선택하면 참가자에게 전송됨
                                        } else {
                                            setChoice(word); // 참가자는 클릭 시 UI에만 반영 (방장에게 전송 X)
                                        }
                                    }}
                                    onDoubleClick={() =>
                                        !isHost && sendChoice(word)
                                    } // 참가자가 음성으로 선택한 경우만 방장에게 전송
                                    className={`game-button 
                    ${choice === word ? "selected" : ""} 
                    ${correctAnswer === word ? "correct" : ""}`} // 정답(방장이 선택한 것)은 참가자에게 강조
                                    aria-label={`게임 버튼: ${word}`}
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
                </div>
            </div>
        </div>
    );
};

export default Webrtc;
