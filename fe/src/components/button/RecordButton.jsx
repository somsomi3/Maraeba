import { useState, useRef } from "react";
import { flaskApi } from "../../utils/api";
import "./RecordButton.css";
import recordIcon from "../../assets/icons/record.png";
import stopIcon from "../../assets/icons/pause.png";
import { useSelector } from "react-redux";

const RecordButton = ({ onMatchUpdate, pronunciation }) => {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const { audioType } = useSelector((state) => state.browser);

    // 🔴 **녹음 시작**
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mimeType = `audio/${audioType}`;

            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType }); // ✅ webm 사용
    
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
    
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType }); // ✅ webm으로 전송
                await analyzePronunciation(audioBlob); // ✅ AI 서버에 전송
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

    // 📡 **AI 서버로 음성 데이터 전송**
    const analyzePronunciation = async (wavBlob) => {
        try {
            const formData = new FormData();
            formData.append("file", wavBlob, "recording.wav");
            formData.append("text", pronunciation || "아아");

            const response = await flaskApi.post("/ai/compare", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log("✅ AI 분석 응답:", response.data);

            const isMatch = response.data.match || false;
            const feedbackMsg = response.data.feedback || "잘했어요🙂";
        
            onMatchUpdate(isMatch, feedbackMsg);
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
