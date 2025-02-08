import { useState, useRef } from "react";
import { flaskApi } from "../../utils/api";
import "./RecordButton.css";
import recordIcon from "../../assets/icons/record.png";
import stopIcon from "../../assets/icons/pause.png";


const RecordButton = ({ onMatchUpdate, pronunciation }) => {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

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

                // 원본 WebM Blob
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

                // ✅ WAV로 변환
                const wavBlob = await convertToWav(audioBlob);

                // 🎤 **오디오 파일 분석 요청**
                await analyzePronunciation(wavBlob);
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

    // ✅ **WebM -> WAV 변환**
    const convertToWav = async (blob) => {
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await new AudioContext().decodeAudioData(arrayBuffer);
        return encodeWav(audioBuffer);
    };

    // ✅ **WAV 인코딩**
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
        wavHeader.setUint32(4, 36 + numOfFrames * numOfChannels * 2, true);
        wavHeader.setUint32(8, 0x57415645, false); // "WAVE"

        // FMT Chunk
        wavHeader.setUint32(12, 0x666d7420, false); // "fmt "
        wavHeader.setUint32(16, 16, true); 
        wavHeader.setUint16(20, 1, true);
        wavHeader.setUint16(22, numOfChannels, true);
        wavHeader.setUint32(24, sampleRate, true);
        wavHeader.setUint32(28, byteRate, true);
        wavHeader.setUint16(32, blockAlign, true);
        wavHeader.setUint16(34, bitDepth, true);

        // Data Chunk
        wavHeader.setUint32(36, 0x64617461, false); // "data"
        wavHeader.setUint32(40, numOfFrames * numOfChannels * 2, true);

        const pcmData = new Int16Array(numOfFrames * numOfChannels);
        for (let channel = 0; channel < numOfChannels; channel++) {
            const channelData = audioBuffer.getChannelData(channel);
            for (let i = 0; i < numOfFrames; i++) {
                pcmData[i * numOfChannels + channel] = Math.max(-1, Math.min(1, channelData[i])) * 0x7fff;
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

            const response = await flaskApi.post("/ai/compare", formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log("✅ AI 분석 응답:", response.data);

            const isMatch = response.data.match || false;
            onMatchUpdate(isMatch);
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


export default RecordButton;
