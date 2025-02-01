import React, { useEffect, useRef, useState } from "react";

const API_URL = "http://localhost:8081";

// 🔹 JWT 토큰 가져오기 (로그인 여부 확인용)
const getAccessToken = () => {
    return localStorage.getItem("token");
};

const WebRTC = () => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const peerConnectionRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const webSocketRef = useRef(null);

    // 🔹 통화 로그 기록용 상태
    const [callId, setCallId] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);

    useEffect(() => {
        startWebSocket();
        return () => {
            if (webSocketRef.current) {
                webSocketRef.current.close();
            }
        };
    }, []);

    // ✅ WebSocket 연결
    const startWebSocket = () => {
        webSocketRef.current = new WebSocket("ws://localhost:8081/WebRTC/signaling");

        webSocketRef.current.onopen = () => {
            console.log("✅ WebSocket 연결됨 (Signaling)");
        };

        webSocketRef.current.onmessage = async (event) => {
            const message = JSON.parse(event.data);

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

    // ✅ 통화 시작 시간 기록
    const startCallLog = () => {
        const newCallId = Math.random().toString(36).substr(2, 9);
        setCallId(newCallId);
        setStartTime(Date.now());
        console.log("📌 통화 시작 - Call ID:", newCallId, "Start Time:", Date.now());
    };
const getWebRTCStats = async (peerConnection) => {
    if (!peerConnection) {
        console.warn("⚠️ WebRTC 연결이 존재하지 않음 (기본값 반환)");
        return { packet_loss: 0, jitter: 0, latency: 0, bitrate: 0 };
    }

    try {
        const stats = await peerConnection.getStats();
        let packet_loss = 0, jitter = 0, latency = 0, bitrate = 0;

        stats.forEach(report => {
            if (report.type === "remote-inbound-rtp") {
                jitter = report.jitter || 0;
                latency = report.roundTripTime ? report.roundTripTime * 1000 : 0;
                packet_loss = report.packetsLost ? report.packetsLost / report.packetsReceived : 0;
            }
            if (report.type === "outbound-rtp" && report.kind === "video") {
                bitrate = report.bytesSent ? (report.bytesSent * 8) / (report.timestamp / 1000) : 0;
            }
        });

        return { packet_loss, jitter, latency, bitrate };
    } catch (error) {
        console.error("❌ WebRTC 통화 품질 데이터 가져오기 실패:", error);
        return { packet_loss: 0, jitter: 0, latency: 0, bitrate: 0 };
    }
};
    
    

    // ✅ 통화 종료 후 서버로 로그 전송
    const endCallLog = async () => {
        if (!callId || !startTime) {
            console.error("❌ 통화 시작 시간이 기록되지 않음");
            return;
        }
       // ✅ 1초 후에 WebRTC 품질 데이터를 가져오도록 설정 (ICE 연결이 완료될 때까지 기다림)
       setTimeout(async () => {
           const { packet_loss, jitter, latency, bitrate } = await getWebRTCStats(peerConnectionRef.current);
   
           const logData = {
               call_id: callId || Math.random().toString(36).substr(2, 9),
               start_time: startTime || Date.now(),
               end_time: Date.now(),
               packet_loss,
               jitter,
               latency,
               bitrate
           };
   
           console.log("📌 통화 종료 - Call ID:", callId, "End Time:", new Date().toISOString());
   
           const accessToken = getAccessToken();
   
           try {
               const response = await fetch(`${API_URL}/webrtc/logs`, {
                   method: "POST",
                   headers: {
                       "Content-Type": "application/json",
                       ...(accessToken && { "Authorization": `Bearer ${accessToken}` }) 
                   },
                   body: JSON.stringify(logData)
               });
   
               const data = await response.json();
               if (!response.ok) {
                   console.error("❌ 로그 저장 실패:", data);
               } else {
                   console.log("✅ 로그 저장 성공:", data);
               }
           } catch (error) {
               console.error("❌ 서버 요청 오류:", error);
           }
       }, 1000); // ✅ 1초 후에 실행하여 데이터가 정상적으로 수집되도록 함
   };

    // ✅ 카메라 & 마이크 접근 및 로컬 스트림 설정
    const startMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            startCallLog(); // ✅ 통화 시작 시간 기록
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
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription({
                type: "offer",
                sdp: message.sdp
            }));
            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);
            sendToServer({type: "answer", sdp: answer.sdp});
        } catch (error) {
            console.error("❌ Offer 처리 실패:", error);
        }
    };

    // ✅ Answer 수신 처리
    const handleAnswer = async (message) => {
        try {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription({
                type: "answer",
                sdp: message.sdp
            }));
        } catch (error) {
            console.error("❌ Answer 처리 실패:", error);
        }
    };

    // ✅ ICE Candidate 처리
    const handleCandidate = async (message) => {
        try {
            if (message.candidate) {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(message.candidate));
            }
        } catch (error) {
            console.error("❌ ICE Candidate 추가 실패:", error);
        }
    };
    // ✅ WebSocket 메시지 전송
    const sendToServer = (message) => {
        if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
            webSocketRef.current.send(JSON.stringify(message));
        }
    };

    return (
        <div style={styles.container}>
            <h3>WebRTC 테스트</h3>
            <div style={styles.videoContainer}>
                <video ref={localVideoRef} autoPlay playsInline style={styles.video} />
                <video ref={remoteVideoRef} autoPlay playsInline style={styles.video} />
            </div>
            <div style={styles.buttonContainer}>
                <button onClick={startMedia} style={styles.button}>🎥 미디어 시작</button>
                <button onClick={createOffer} style={styles.button}>📡 연결 요청 (Offer)</button>
                <button onClick={endCallLog} style={styles.button}>📜 통화 종료 (로그 저장)</button>
            </div>
        </div>
    );
};

// ✅ 스타일 추가
const styles = {
    container: { textAlign: "center", padding: "20px" },
    videoContainer: { display: "flex", justifyContent: "center", gap: "10px" },
    video: { width: "300px", height: "200px", border: "1px solid #ccc", background: "black" },
    buttonContainer: { marginTop: "10px" },
    button: { padding: "10px", margin: "5px", background: "#007BFF", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }
};

export default WebRTC;
