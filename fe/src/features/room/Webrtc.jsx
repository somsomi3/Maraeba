import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { springApi } from "../../utils/api.js";
import GoBackButton from "../../components/button/GoBackButton";
import "./Webrtc.css";
import backgroundImage from "../../assets/background/Webrtc_Bg.webp";
// import rtc from '../../assets/images/rtc.png';
import tutoPorong from "../../assets/images/tuto_porong.png";

const Webrtc = () => {
    // ===================================================
    //                      상태 & 참조
    // ===================================================

    const localStreamRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const chatBoxRef = useRef(null);
    const webSocketRef = useRef(null);

    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
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
    // 정답/오답 팝업 상태 관리
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState(""); // 🔵 팝업 메시지

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
    const [tutorialStep, setTutorialStep] = useState(null);

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
    }, [roomId, token]);

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

            connectWebSocket(token, roomId, responseUsername);
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
        // connectWebSocket(token, roomId);

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
    const connectWebSocket = (token, roomId, username) => {
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
                username: username || "없음",
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
            console.warn("⚠️ WebSocket 연결 종료됨.");
            // console.warn("⚠️ WebSocket 연결 종료됨. 5초 후 재연결 시도...");
            // setTimeout(() => {
            //     connectWebSocket(token, roomId);
            // }, 5000);
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
                endMedia(); // 미디어 종료 보장
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

        const { type, username, user_id, participants } = receivedMessage || {};

        // leave 메시지 처리 추가
        if (type === "leave") {
            console.log("🚪 leave 메시지 수신:", receivedMessage);
            // 만약 떠난 사용자가 나와 다른 사용자라면, 다른 사용자 정보 초기화
            if (user_id !== userId) {
                setOtherUsername(null);
                setRemoteStream(null);
            }
            return;
        }

        // cameraOff 메시지 처리: remote 측에서 내 카메라가 꺼졌음을 알림
        if (type === "cameraOff") {
            console.log("📴 cameraOff 메시지 수신");
            setRemoteStream(null);
            return;
        }

        // 내 user_id와 다르고, join 메시지라면 다른 참여자의 username으로 처리
        if (type === "join") {
            if (username && user_id !== userId) {
                console.log("새로운 사용자 입장:", username);
            }
            return;
        }

        if (type === "roomInfo") {
            // 새로 입장한 사용자가 방의 기존 참가자 정보를 받음
            if (participants && participants.length > 0) {
                const firstParticipant = participants[0];
                setOtherUsername(firstParticipant.username);
            } else {
                // 참가자가 없으면 "없음"으로 초기화
                setOtherUsername(null);
            }
            return;
        }

        if (type === "userJoined") {
            // 이미 입장해 있던 사용자가 새 사용자 정보를 브로드캐스트하면
            if (username && user_id !== userId) {
                setOtherUsername(username);
            }
            return;
        }

        // ping (연결 유지를 위한 것)이면 바로 return
        if (type === "pong") {
            console.log("📡 WebSocket pong 수신");
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
            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            const now = new Date();
            now.setHours(now.getHours() + 9); // UTC -> KST 변환

            const formattedTime = now.toISOString().slice(0, 19); // 한국 시간 기준 ISO 문자열 저장

            setStartTime(formattedTime); // 시작시간 저장
            console.log("미디어 시작:", now);
        } catch (error) {
            console.error("미디어 접근 실패:", error);
        }
    };

    // cameraOff 메시지 전송 함수
    const sendCameraOff = () => {
        if (
            webSocketRef.current &&
            webSocketRef.current.readyState === WebSocket.OPEN
        ) {
            const msg = {
                type: "cameraOff",
                room_id: roomId,
                user_id: userId,
            };
            webSocketRef.current.send(JSON.stringify(msg));
            console.log("🚫 cameraOff 메시지 전송:", msg);
        }
    };

    const endMedia = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
            localStreamRef.current = null;
        }
        setLocalStream(null);
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }

        const now = new Date();
        now.setHours(now.getHours() + 9); // UTC → KST 변환

        const formattedTime = now.toISOString().slice(0, 19); // 한국 시간 기준 ISO 문자열 저장
        setEndTime(formattedTime);
        console.log("미디어 종료:", formattedTime);

        saveWebRTCLog(startTime, formattedTime); // 로그 저장 실행
        // signaling 메시지 전송하여 remote 측에서 cameraOff 처리
        sendCameraOff();
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
            if (localStreamRef.current) {
                const localTrackIds = localStreamRef.current
                    .getTracks()
                    .map((track) => track.id);
                const incomingTrackIds = event.streams[0]
                    .getTracks()
                    .map((track) => track.id);
                const isLocalStream = incomingTrackIds.every((id) =>
                    localTrackIds.includes(id)
                );
                if (isLocalStream) {
                    console.log("루프백 스트림 무시");
                    return;
                }
            }
            const stream = event.streams[0];
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;
            }
            setRemoteStream(stream);
            event.track.onended = () => {
                console.log("Remote track ended");
                setRemoteStream(null);
            };
        };

        // 로컬 스트림 트랙 추가
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                peerConnectionRef.current.addTrack(
                    track,
                    localStreamRef.current
                );
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

        // 한국 시간(KST) 변환
        const now = new Date();
        now.setHours(now.getHours() + 9); // UTC -> KST 변환
        const formattedTime = now.toISOString(); // ISO 형식으로 변환

        const messageObject = {
            type: "chat",
            user_id: userId,
            username: myUsername,
            message: message.trim(),
            room_id: roomId,
            sentAt: formattedTime, // 한국 시간으로 변환된 값 사용
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

            // 미디어 스트림이 살아있다면 종료
            if (localStream) {
                localStream.getTracks().forEach((track) => {
                    track.stop();
                    console.log(
                        "Track stopped:",
                        track.label,
                        track.readyState
                    );
                });
                setLocalStream(null);
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

            if (peerConnectionRef.current) {
                const senders = peerConnectionRef.current.getSenders();
                senders.forEach((sender) => {
                    try {
                        peerConnectionRef.current.removeTrack(sender);
                    } catch (err) {
                        console.warn("removeTrack error:", err);
                    }
                });
                peerConnectionRef.current.close();
                peerConnectionRef.current = null;
            }

            // 미디어 레코더 중지
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

    const startTutorial = () => {
        if (tutorialStep === null) {
            setTutorialStep(1);
        }
    };

    const completeTutorial = () => {
        setTutorialStep(null);
    };

    const PorongSpeech = ({ text, position = "center", onNext }) => (
        <div className={`webrtc-porong-container ${position}`}>
            <img src={tutoPorong} alt="포롱이" className="porong-image" />
            <div className="webrtc-porong-speech-bubble">
                {text.split("\n").map((line, index) => (
                    <span key={index}>
                        {line}
                        <br />
                    </span>
                ))}
                {onNext && (
                    <button
                        onClick={onNext}
                        className="webrtc-porong-nextbutton"
                    >
                        다음
                    </button>
                )}
            </div>
        </div>
    );

    /**
     * items가 변경될 때마다
     * - 방장이면 다른 참가자에게도 전송
     */
    useEffect(() => {
        if (isHost && items.length > 0) {
            sendItems();
        }
    }, [items]); // items 변경 감지

    // 🔵 correctAnswer가 변경될 때마다 실행
    useEffect(() => {
        // 참가자 (isHost가 false)일 때만 확인
        if (!isHost && choice && correctAnswer) {
            if (choice === correctAnswer) {
                setPopupMessage("정답입니다! 🎉");
            } else {
                setPopupMessage("오답입니다! ❌");
            }
            setShowPopup(true); // 팝업 보이기

            // 2초 후에 팝업 자동으로 닫기
            setTimeout(() => {
                setShowPopup(false);
            }, 2000);
        }
    }, [correctAnswer, choice, isHost]); // correctAnswer가 변경될 때마다 실행

    // ===================================================
    //                      렌더링
    // ===================================================
    return (
        <div
            className="webrtc-container"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <button className="restart-tutorial-btn" onClick={startTutorial}>
                ▶ 튜토리얼
            </button>
            {/* 🔴 정답/오답 팝업 UI 추가 (alert처럼) */}
            {showPopup && (
                <div className="popup-alert">
                    <div className="popup-message">{popupMessage}</div>
                </div>
            )}
            <div className="webrtc-game-overlay">
                {/* 왼쪽 - 상대방(큰 화면) + 내 화면(작은 화면) */}
                <GoBackButton />
                {/* ✅ 비디오 컨테이너 + 채팅 컨테이너를 가로 정렬 */}
                <div className="video-chat-wrapper">
                    <div className="video-container">
                        <div className="video-wrapper">
                            {/* 상대방 화면 */}
                            <div className="video-box">
                                <div className="video-label">상대방 화면</div>
                                <video
                                    ref={remoteVideoRef}
                                    autoPlay
                                    playsInline
                                    className={`large-video ${
                                        tutorialStep === 1
                                            ? "cooking-highlight"
                                            : ""
                                    }`}
                                    style={{
                                        display: remoteStream
                                            ? "block"
                                            : "none",
                                    }}
                                    aria-label="상대방 비디오"
                                />
                                {!remoteStream && (
                                    <div className="remote-fallback">
                                        {otherUsername ? otherUsername : "없음"}
                                    </div>
                                )}
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
                                    className={`small-video ${
                                        tutorialStep === 1
                                            ? "cooking-highlight"
                                            : ""
                                    }`}
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

                    {/* 🟢 튜토리얼 1단계: 비디오 컨테이너 설명 */}
                    {tutorialStep === 1 && (
                        <PorongSpeech
                            text="여기서 상대방과 영상 통화를 할 수 있어요!"
                            position="webrtc-near-video"
                            onNext={() => setTutorialStep(2)}
                        />
                    )}

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
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center", // 문구와 버튼 수직 정렬
                            gap: "1rem", // 문구와 버튼 사이 간격
                        }}
                    >
                        <p
                            className={
                                tutorialStep === 2 ? "cooking-highlight" : ""
                            }
                        >
                            입모양을 보고, 색상이 들어간 정답을 말하세요!
                        </p>
                    </div>
                    {/* 🛠️ 로그 추가: items 상태 확인 */}
                    {console.log("📌 렌더링 중 items 상태:", items)}

                    {/* 🟢 튜토리얼 2단계: 게임 설명 */}
                    {tutorialStep === 2 && (
                        <PorongSpeech
                            text="게임이 시작되면 정답을 말해야 해요!"
                            position="webrtc-near-game"
                            onNext={() => setTutorialStep(3)}
                        />
                    )}

                    <div
                        className={`game-buttons ${
                            tutorialStep === 3 ? "cooking-highlight" : ""
                        }`}
                    >
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

                    {/* 🟢 튜토리얼 3단계: 게임 버튼 강조 */}
                    {tutorialStep === 3 && (
                        <PorongSpeech
                            text="여기에서 정답을 선택할 수 있어요!"
                            position="webrtc-near-buttons"
                            onNext={() => setTutorialStep(4)}
                        />
                    )}

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

                    {/* 🟢 튜토리얼 4단계: 음성 녹음 버튼 강조
                        {tutorialStep === 4 && (
                            <PorongSpeech
                                text="이 버튼을 눌러 정답을 음성으로 말해요!"
                                position="webrtc-near-record"
                                onNext={() => setTutorialStep(5)}
                            />
                        )} */}

                    {/* 게임 시작 버튼 (방장만 보이도록 설정) */}
                    {isHost && (
                        <button
                            onClick={() => {
                                console.log("🎮 게임 시작 버튼 클릭됨!"); // 🔥 디버깅 로그 추가
                                startGame(); // ✅ 단어 목록 불러오기 실행
                            }}
                            className={`start-game-button ${
                                tutorialStep === 4 ? "cooking-highlight" : ""
                            }`}
                        >
                            게임 시작
                        </button>
                    )}

                    {/* 🟢 튜토리얼 5단계: 게임 시작 버튼 강조 */}
                    {tutorialStep === 4 && (
                        <PorongSpeech
                            text="게임을 시작해 보세요!"
                            position="webrtc-near-start"
                            onNext={completeTutorial}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Webrtc;
