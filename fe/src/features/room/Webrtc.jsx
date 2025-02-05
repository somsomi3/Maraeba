import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ useNavigate 사용
const API_URL = "http://localhost:8081";
const Webrtc = () => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const peerConnectionRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const webSocketRef = useRef(null);

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
    // ✅ 로그인 확인 및 WebSocket 연결
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
        //         if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
        //             console.log("✅ WebSocket 이미 연결됨");
        //             return;
        //         }

        webSocketRef.current = new WebSocket(
            `wss://i12e104.p.ssafy.io:8081/WebRTC/signaling?token=${token}`
        );

        webSocketRef.current.onopen = () => {
            console.log("✅ WebSocket 연결됨 (Signaling)");
        };

        webSocketRef.current.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            console.log("📩 WebSocket 메시지 수신:", message);

            if (message.type === "offer") {
                await handleOffer(message);
            } else if (message.type === "answer") {
                await handleAnswer(message);
            } else if (message.type === "candidate") {
                await handleCandidate(message);
            }
        };

        webSocketRef.current.onclose = () => {
            console.log("🔴 WebSocket 연결 종료");
        };
    };

    // ✅ 카메라 & 마이크 접근 및 로컬 스트림 설정
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
        } catch (error) {
            console.error("❌ 미디어 접근 실패:", error);
        }
    };

    // ✅ WebRTC 연결 초기화
    const createPeerConnection = () => {
        peerConnectionRef.current = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        peerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate) {
                sendToServer({ type: "candidate", candidate: event.candidate });
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

    // ✅ Offer 생성 및 전송
    const createOffer = async () => {
        createPeerConnection();
        try {
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);
            sendToServer({ type: "offer", sdp: offer.sdp });
        } catch (error) {
            console.error("❌ Offer 생성 실패:", error);
        }
    };

    // ✅ Offer 수신 처리
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
            sendToServer({ type: "answer", sdp: answer.sdp });
        } catch (error) {
            console.error("❌ Offer 처리 실패:", error);
        }
    };

    // ✅ Answer 수신 처리
    const handleAnswer = async (message) => {
        try {
            await peerConnectionRef.current.setRemoteDescription(
                new RTCSessionDescription({
                    type: "answer",
                    sdp: message.sdp,
                })
            );
        } catch (error) {
            console.error("❌ Answer 처리 실패:", error);
        }
    };

    // ✅ ICE Candidate 처리
    const handleCandidate = async (message) => {
        try {
            if (message.candidate) {
                await peerConnectionRef.current.addIceCandidate(
                    new RTCIceCandidate(message.candidate)
                );
            }
        } catch (error) {
            console.error("❌ ICE Candidate 추가 실패:", error);
        }
    };

    // ✅ WebSocket 메시지 전송
    const sendToServer = (message) => {
        if (
            webSocketRef.current &&
            webSocketRef.current.readyState === WebSocket.OPEN
        ) {
            webSocketRef.current.send(JSON.stringify(message));
        } else {
            console.error(
                "❌ WebSocket이 연결되지 않음, 메시지 전송 실패:",
                message
            );
        }
    };

    return (
        <div style={styles.container}>
            <h3>WebRTC 테스트</h3>
            <div style={styles.videoContainer}>
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={styles.video}
                />
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    style={styles.video}
                />
            </div>
            <div style={styles.buttonContainer}>
                <button onClick={startMedia} style={styles.button}>
                    🎥 미디어 시작
                </button>
                <button onClick={createOffer} style={styles.button}>
                    📡 연결 요청 (Offer)
                </button>
            </div>
        </div>
    );
};

// ✅ 스타일 추가
const styles = {
    container: { textAlign: "center", padding: "20px" },
    videoContainer: { display: "flex", justifyContent: "center", gap: "10px" },
    video: {
        width: "300px",
        height: "200px",
        border: "1px solid #ccc",
        background: "black",
    },
    buttonContainer: { marginTop: "10px" },
    button: {
        padding: "10px",
        margin: "5px",
        background: "#007BFF",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
};

export default Webrtc;
