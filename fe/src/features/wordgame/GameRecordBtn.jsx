import { useState, useRef } from "react";
import { flaskApi } from "../../utils/api";
import "./GameRecordBtn.css";
import recordIcon from "../../assets/icons/record.png";
import stopIcon from "../../assets/icons/pause.png";
import PropTypes from "prop-types";

const GameRecordBtn = ({ onAccuracyUpdate, pronunciation, onAudioCapture }) => {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    GameRecordBtn.propTypes = {
        onAccuracyUpdate: PropTypes.func, // 필수 X (AI 인식 결과 업데이트)
        pronunciation: PropTypes.string,  // 필수 O
        gameData: PropTypes.shape({
            foodName: PropTypes.string,
            item1: PropTypes.string,
            item2: PropTypes.string,
        }),
        audioBlob: PropTypes.instanceOf(Blob),
        onAudioCapture: PropTypes.func,  // 선택적 props로 변경
    };

    // 🔴 **녹음 시작**
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                if (audioChunksRef.current.length === 0) {
                    console.error("❌ 녹음된 오디오가 없습니다.");
                    return;
                }

                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                console.log("📂 생성된 오디오 Blob:", audioBlob);

                const wavBlob = await convertToWav(audioBlob);
                await analyzePronunciation(wavBlob);

                // ✅ 부모 컴포넌트에 WAV 파일 전달
                if (onAudioCapture) {
                    onAudioCapture(wavBlob);
                }
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error("❌ 오디오 녹음 오류:", error);
        }
    };

    // ⏹ **녹음 중지**
    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    // ✅ **WebM -> WAV 변환 함수**
    const convertToWav = async (blob) => {
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await new AudioContext().decodeAudioData(arrayBuffer);
        return encodeWav(audioBuffer);
    };

    // ✅ **WAV 인코딩 함수**
    const encodeWav = (audioBuffer) => {
        const numOfChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const numOfFrames = audioBuffer.length;
        const bitDepth = 16;
        const byteRate = sampleRate * numOfChannels * (bitDepth / 8);
        const blockAlign = numOfChannels * (bitDepth / 8);
        const wavHeader = new DataView(new ArrayBuffer(44));

        // RIFF Chunk
        wavHeader.setUint32(0, 0x52494646, false); // "RIFF"
        wavHeader.setUint32(4, 36 + numOfFrames * numOfChannels * 2, true); // 파일 크기
        wavHeader.setUint32(8, 0x57415645, false); // "WAVE"

        // FMT Chunk
        wavHeader.setUint32(12, 0x666d7420, false); // "fmt "
        wavHeader.setUint32(16, 16, true); // Subchunk1Size
        wavHeader.setUint16(20, 1, true); // PCM 포맷
        wavHeader.setUint16(22, numOfChannels, true); // 채널 수
        wavHeader.setUint32(24, sampleRate, true); // 샘플링 레이트
        wavHeader.setUint32(28, byteRate, true); // 바이트 레이트
        wavHeader.setUint16(32, blockAlign, true); // 블록 정렬
        wavHeader.setUint16(34, bitDepth, true); // 비트 깊이

        // Data Chunk
        wavHeader.setUint32(36, 0x64617461, false); // "data"
        wavHeader.setUint32(40, numOfFrames * numOfChannels * 2, true); // 오디오 데이터 크기

        const pcmData = new Int16Array(numOfFrames * numOfChannels);
        for (let channel = 0; channel < numOfChannels; channel++) {
            const channelData = audioBuffer.getChannelData(channel);
            for (let i = 0; i < numOfFrames; i++) {
                pcmData[i * numOfChannels + channel] =
                    Math.max(-1, Math.min(1, channelData[i])) * 0x7fff;
            }
        }

        return new Blob([wavHeader, new DataView(pcmData.buffer)], { type: "audio/wav" });
    };

    // 📡 **AI 서버로 음성 데이터 전송**
    const analyzePronunciation = async (wavBlob) => {
        try {
            const formData = new FormData();
            formData.append("file", wavBlob, "recording.wav");
            formData.append("text", pronunciation || "아아");

            console.log("🎤 전송할 FormData:");
            for (let pair of formData.entries()) {
                console.log(`${pair[0]}:`, pair[1]);
            }

            const response = await flaskApi.post("/ai/compare", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log("✅ AI 분석 응답:", response.data);

            const recognizedText = response.data.recognized_text;
            if (!recognizedText || recognizedText === "오디오를 이해하지 못했습니다.") {
                console.warn("⚠️ STT 변환 실패: 다시 시도해야 합니다.");
                return;
            }

            // ✅ 부모 컴포넌트로 분석 결과 전달
            if (typeof onAccuracyUpdate === "function") {
                onAccuracyUpdate({ recognizedText });
            }
        } catch (error) {
            console.error("❌ AI 요청 오류:", error.response ? error.response.data : error);
        }
    };

    return (
        <button className="record-button" onClick={isRecording ? stopRecording : startRecording}>
            <img src={isRecording ? stopIcon : recordIcon} alt="녹음 버튼" />
        </button>
    );
};

export default GameRecordBtn;
