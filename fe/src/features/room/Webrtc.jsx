import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; // useNavigate 사용
import { useParams } from "react-router-dom";
import { springApi } from "../../utils/api.js"; // React Router에서 useParams를 사용
import { useSelector } from "react-redux";
import "./Webrtc.css";
// import rtc from '../../assets/images/rtc.png';

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
    const [items, setItems] = useState([]); // 빈 배열로 초기화
    const [choice, setChoice] = useState([]); // 빈 배열로 초기화
    const [answer, setAnswer] = useState([]); // 빈 배열로 초기화
    const [answerChoice, setAnswerChoice] = useState([]); // 빈 배열로 초기화
    
    
    const [correctAnswer, setCorrectAnswer] = useState(null); // 정답 저장
    const [isHost, setIsHost] = useState(false); // 방장 여부 상태 추가

    const token = useSelector((state) => state.auth.token); // Redux에서 토큰 가져오기
    const userId = useSelector((state) => state.auth.userId);

    const { roomId } = useParams(); // URL에서 roomId 가져오기
    const navigate = useNavigate();


    useEffect(() => {
        if (!roomId) {
            console.error("🚨 roomId가 없습니다. 방장 여부 확인을 중단합니다.");
            return;
        }
        fetchHostStatus();
    }, [roomId]);

    useEffect(() => {
        if (roomId) {
            fetchHostStatus(); // ✅ 방장 여부 확인 API 호출
        }
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
    }, [token, roomId]);// ✅ Redux의 토큰 값이 변경될 때마다 실행

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
                } else if(receivedMessage.type === "items"){
                    await  handleItems(receivedMessage);
                } else if (receivedMessage.type === "answer") {
                    await handleAnswer(receivedMessage);
                } else if (receivedMessage.type === "choice"){
                    await handleChoice(receivedMessage);
                } else if (receivedMessage.type === "candidate") {
                    await handleCandidate(receivedMessage);
                } else if (receivedMessage.type === "answerChoice") {
                    await handleAnswerChoice(receivedMessage);
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

    const fetchHostStatus = async () => {
        try {
            const response = await springApi.post(`/rooms/join/${roomId}`, {
                user: userId,
                room: roomId,
                // room_password: password || null,
            });

            if (!response || !response.data) {
                throw new Error("🚨 서버 응답이 없습니다.");
            }

            const isHostValue = response.data.host || false;
            setIsHost(isHostValue);
            console.log("응답에서 받은 host 값:", response.data.host);
            console.log("setIsHost에 저장된 값:", isHostValue);
            console.log("방장 여부:", response.data.host ? "방장" : "참가자");
            
        } catch (error) {
            console.error("방장 여부 확인 실패:", error.message);
        }
    };

    // 메시지가 변경될 때 실행되는 자동 스크롤 useEffect
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]); // messages가 변경될 때마다 실행

    // useEffect(() => {
    //     const fetchItems = async () => {
    //         try {
    //             setLoading(true);
    //             const response = await springApi.get("/rgames/item"); // 단어 목록 API 호출
    //             setItems(response.data);
    //             // console.log("출력출력",response.data);
    //         } catch (error) {
    //             console.error("❌ 단어 목록 불러오기 실패:", error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //
    //     fetchItems();
    // }, []);
    

    const connectWebSocket = (token, roomId) => {
        if (!roomId) {
            console.error("❌ 방 ID(roomId)가 없습니다.");
            return;
        }

        if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
            console.warn("WebSocket이 이미 연결되어 있음");
            return;
        }

        webSocketRef.current = new WebSocket(
            `wss://i12e104.p.ssafy.io:8081/WebRTC/signaling?token=${token}&roomId=${roomId}`
            // `ws://localhost:8081/WebRTC/signaling?token=${token}&roomId=${roomId}`
        );

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

        webSocketRef.current.onmessage = (event) => {
            const receivedMessage = JSON.parse(event.data);
            console.log("📩 WebSocket 메시지 수신:", receivedMessage);

            if (receivedMessage.type === "gameStart") {
                console.log("📌 참가자가 받은 단어 목록:", receivedMessage.items);
                setItems(receivedMessage.items);
            }

            if (receivedMessage.type === "answerSelected") {
                console.log("📌 참가자가 받은 정답:", receivedMessage.answer);
                setCorrectAnswer(receivedMessage.answer);
            }

            if (receivedMessage.type === "userChoice") {
                console.log(`📌 참가자가 선택한 단어: ${receivedMessage.choice}`);
                setChoice(receivedMessage.choice);
            }
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
                type: "chat", // 메시지 타입 추가
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
                "/webrtcs/messages",
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
                    urls: "turn:3.39.252.223:3478?transport=tcp",
                    username: `${import.meta.env.VITE_USERNAME_URL}`,
                    credential: `${import.meta.env.VITE_PASSWORD_URL}`,
                    // urls: "stun:stun.l.google.com:19302",

                },
            ],
        });

        peerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate) {
                sendToServer({
                    type: "candidate",
                    candidate: event.candidate,
                    room_id: roomId, // 방 ID 추가
                    user_id: userId, // 사용자 ID 추가
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
                room_id: roomId, // 방 ID 추가
                user_id: userId, // 사용자 ID 추가
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
                room_id: roomId, // 방 ID 추가
                user_id: userId, // 사용자 ID 추가
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
            console.error("roomId가 없습니다. 메시지를 보낼 수 없습니다.");
            return;
        }

        if (
            webSocketRef.current &&
            webSocketRef.current.readyState === WebSocket.OPEN
        ) {
            const messageWithRoom = { ...message, roomId }; // roomId 추가
            webSocketRef.current.send(JSON.stringify(messageWithRoom));
        } else {
            console.error(
                "WebSocket이 연결되지 않음, 메시지 전송 실패:",
                message
            );
        }
    };

    //items수신
    // WebSocket으로 수신한 items 데이터를 저장하는 함수
    const handleItems = async (message) => {
        console.log("조건 확인 : message.items = ",(message.items));
        console.log("조건 확인 : Array.isArray(message.items)",(Array.isArray(message.items)));
        if (message.items && Array.isArray(message.items)) {
            console.log("📩 WebSocket을 통해 수신한 단어 목록:", message.items);
            setItems(message.items); // 상태 업데이트
            
        } else {
            console.error("🚨 수신한 items 데이터가 올바르지 않음:", message);
        }
    };

    //choice수신
    const handleChoice = async (message) => {
        console.log("조건 확인 : message.choice = ",(message.choice));
        console.log("조건 확인 : isHost = ",(isHost));
        
        if (message.choice) {
            
            console.log("📩 WebSocket을 통해 수신한 단어 목록:", message.choice);
            setChoice(message.choice); // 상태 업데이트

        } else {
            console.error("수신한 choice 데이터가 올바르지 않음:", message);
        }
    };

    //answer수신
    const handleAnswerChoice = async (message) => {
        
        console.log("조건 확인 : message.answerChoice = ",(message.answer_choice));
        console.log("조건 확인 : isHost = ",(isHost));

        if (message.answer_choice) {

            console.log("📩 WebSocket을 통해 수신한 단어 목록:", message.answer_choice);
            setAnswerChoice(message.answer_choice); // 상태 업데이트
            setCorrectAnswer(message.answer_choice);

        } else {
            console.error("수신한 answerChoice 데이터가 올바르지 않음:", message);
        }
    };
    

    //음소거 
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
            console.error("방 나가기 실패:", error);
            alert("방 나가기 실패!");
        }
    };
    // 게임 시작
    const startGame = async () => {
        if (!isHost) {
            alert("방장만 게임을 시작할 수 있습니다.");
            return;
        }
        try {
            const response = await springApi.post(`/rgames/start/${roomId}`, { userId });
            if (response.status === 200) {
                setIsGameStarted(true);
            }
        } catch (error) {
            console.error("게임 시작 오류:", error);
        }
    };
    
    // 단어 목록 불러오기
    const fetchGameWords = async () => {
        try {
            console.log(`게임 단어 요청: color=${correctAnswer}`);
            const response = await springApi.get(`/rgames/item`);

            console.log("API 응답 데이터:", response.data);

            if (response.status === 200 && typeof response.data === "object") {
                const wordsArray = Object.values(response.data);
                setItems(wordsArray);
                console.log("변환된 단어 목록:", wordsArray);
                sendItems();


            } else {
                console.error("서버 응답이 올바르지 않습니다:", response.data);
                setItems([]);
            }
        } catch (error) {
            console.error("단어 목록 불러오기 실패:", error);
            setItems([]);
        }
    };

    //게임 정답 전송 items?
    const sendItems = () => {
        if (isHost===true &&
            webSocketRef.current &&
            webSocketRef.current.readyState === WebSocket.OPEN
        ) {
            if (!userId) {
                console.error("사용자 ID 없음");
                return;
            }
            console.log("Items 보낸다");
            const messageObject = {
                type: "items", // 메시지 타입 추가
                user_id: userId, // 사용자 ID
                items: items,
                room_id: roomId, // 방 ID
                sentAt: new Date().toISOString(), // 메시지 보낸 시간
            };

            console.log("📡 메시지 전송!!!!!!!:", messageObject);
            webSocketRef.current.send(JSON.stringify(messageObject));

        } else {
            console.error("WebSocket 연결이 닫혀 있음!");
        }
    };

    
    //참가자 선택상황 choice 전송
    const sendChoice = (choice) => {
        setChoice(choice);
        
        if (isHost=== false &&
            webSocketRef.current &&
            webSocketRef.current.readyState === WebSocket.OPEN
        ) {
            if (!userId) {
                console.error("사용자 ID 없음");
                return;
            }
            console.log("Choice 보낸다");
            const messageObject = {
                type: "choice", // 메시지 타입 추가
                user_id: userId, // 사용자 ID
                choice: choice,
                room_id: roomId, // 방 ID
                sentAt: new Date().toISOString(), // 메시지 보낸 시간
            };

            console.log("📡 메시지 전송!!!!!!!:", messageObject);
            webSocketRef.current.send(JSON.stringify(messageObject));

        } else {
            console.error("WebSocket 연결이 닫혀 있거나 참가자가 아님!");
        }
    };
    
    
    // 빨간 테두리 전송
    const sendAnswerChoice = (answerChoice) => {
        setCorrectAnswer(answerChoice);
        setAnswerChoice(answerChoice);
    
        if (isHost=== true &&
            webSocketRef.current &&
            webSocketRef.current.readyState === WebSocket.OPEN
        ) {
            if (!userId) {
                console.error("사용자 ID 없음");
                return;
            }
            console.log("AnswerChoice 보낸다");
            const messageObject = {
                type: "answerChoice", // 메시지 타입 추가
                user_id: userId, // 사용자 ID
                answer_choice: answerChoice,
                room_id: roomId, // 방 ID
                sentAt: new Date().toISOString(), // 메시지 보낸 시간
            };

            console.log("📡 메시지 전송!!!!!!!:", messageObject);
            webSocketRef.current.send(JSON.stringify(messageObject));

        } else {
            console.error("WebSocket 연결이 닫혀 있거나 host가 아님!");
        }
    };
    
    
    // // 방장이 정답 선택 (빨간 테두리 표시)
    // const handleAnswerChoice = async (answer) => {
    //     if (!isHost) {
    //         alert("방장만 정답을 선택할 수 있습니다.");
    //         return;
    //     }
    //     setCorrectAnswer(answer);
    //
    //     // try {
    //     //     await springApi.post(`/rgames/answer/${roomId}`, { userId, answer });
    //     //
    //     //     if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
    //     //         const answerMessage = {
    //     //             type: "answerSelected",
    //     //             roomId: roomId,
    //     //             answer: answer,
    //     //         };
    //     //         webSocketRef.current.send(JSON.stringify(answerMessage));
    //     //         console.log("정답 전송 완료:", answerMessage);
    //     //     }
    //     // } catch (error) {
    //     //     console.error( 정답 선택 실패:", error);
    //     // }
    // };

    // items가 변경될 때 실행되는 useEffect
    useEffect(() => {
        if (items.length > 0) {
            console.log("items 값 변경됨:", items);

            // 방장이면 WebSocket을 통해 참가자들에게 전송
            if (isHost) {
                console.log("📡 WebSocket으로 단어 목록 전송:", items);
                sendItems();
            }
        }
    }, [items]); // items 변경 감지
    const colors = ["빨강", "주황", "노랑", "초록", "파랑", "보라"]; // 인덱스별 색상 지정
 
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
                                setIsGameStarted(true); // ✅ 게임 시작 상태 변경
                                fetchGameWords(); // ✅ 단어 목록 불러오기 실행
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
                                        <div key={index} className="answer-button-wrapper">
                                            <button
                                                onClick={() => sendAnswerChoice(word)}
                                                className="answer-button"
                                                style={{
                                                    backgroundColor: correctAnswer === word ? "red" : "white",
                                                    color: correctAnswer === word ? "white" : "black",
                                                    border: correctAnswer === word ? "3px solid red" : "1px solid black",
                                                }}
                                            >
                                                {colors[index]}
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="loading-message">📌 단어 목록을 불러오는 중...</p>
                                )}
                            </div>
                        </div>

                    )}
                </div>
                </div>
                <div className="video-container">
    
                    {/* 상대방 화면을 크게, 내 화면을 작게 배치 */}
                    {/* 상대방 화면을 크게, 내 화면을 작게 배치 */}
                    <div className="video-wrapper">
                        {/* 상대방 화면 */}
                        <div className="video-box">
                            <div className="video-label">상대방 화면</div>
                            <video ref={remoteVideoRef} autoPlay playsInline className="large-video" />
                        </div>

                        {/* 본인 화면 (왕관 or 크리스마스 리스 추가) */}
                        <div className="video-box small-video-container">
                            <div className="video-label">본인 화면</div>

                            {/* 🏆 왕관 or 🎄 크리스마스 리스 추가 */}
                            <div className="role-badge">
                                {isHost ? "👑" : "🎄"}
                            </div>

                            <video ref={localVideoRef} autoPlay playsInline muted className="small-video" />
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
                                className={msg.user_id === userId ? "my-message" : "other-message"}// 내 메시지는 오른쪽, 상대방은 왼쪽
                            >
                                <strong>user{msg.user_id}:</strong> {msg.message}
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
                                    backgroundColor: choice === word ? "lightblue" : "white",
                                    border: correctAnswer === word ? "3px solid red" : "1px solid black",
                                }}
                            >
                                {word}
                            </button>
                        ))
                    ) : (
                        <p className="loading-message">📌 단어 목록을 불러오는 중...</p>
                    )}
                </div>
            </div>


        </div>
    );
};



export default Webrtc;
