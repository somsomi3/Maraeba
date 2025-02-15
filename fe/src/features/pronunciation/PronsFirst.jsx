import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux'; // ✅ Redux에서 토큰 가져오기
import { springApi, flaskApi } from '../../utils/api'; 
import './PronsFirst.css';
import GoBackButton from '../../components/button/GoBackButton';
import PausePopup from '../../components/popup/PausePopup';
import porong from '../../assets/images/porong.png'


// ✅ .env에서 STATIC_API_URL 가져오기
const STATIC_API_URL = import.meta.env.VITE_STATIC_API_URL;

const PronsFirst = () => {
    const navigate = useNavigate();
    const { class_id, seq_id } = useParams();
    const token = useSelector((state) => state.auth.token); // ✅ Redux에서 토큰 가져오기

    const [data, setData] = useState(null);
    const [tongueImage, setTongueImage] = useState(null); // ✅ 혀 이미지 URL 상태
    const [lipVideoSrc, setLipVideoSrc] = useState(null); // ✅ 입모양 비디오 URL 상태
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [audioSrc, setAudioSrc] = useState(null);

    const showPorong = class_id === "1" && seq_id === "1"; // ✅ class 1의 seq 1에서만 true
    

    useEffect(() => {
        const fetchPronunciationData = async () => {
            try {
                const response = await springApi.get(`/prons/class/${class_id}/seq/${seq_id}`);
                console.log("✅ 가져온 데이터:", response.data.data);

                const { tongue_image_url, lip_video_url, id: pronId } = response.data.data;

                localStorage.setItem("pron_id", pronId);

                // ✅ 혀 이미지 & 입모양 비디오 가져오기 (토큰 포함 요청)
                if (tongue_image_url) {
                    fetchResource(`${STATIC_API_URL}${tongue_image_url}`, setTongueImage);
                } else {
                    setTongueImage(null);
                }

                if (lip_video_url) {
                    fetchResource(`${STATIC_API_URL}${lip_video_url}`, setLipVideoSrc);
                } else {
                    setLipVideoSrc(null);
                }

                setData(response.data.data);
                setError(false);
            } catch (error) {
                console.error('❌ 데이터 불러오기 실패:', error);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchPronunciationData();
    }, [class_id, seq_id]);

    // ✅ 공통 fetch 함수 (토큰 포함 요청)
    const fetchResource = async (url, setState) => {
        try {
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`, // ✅ 토큰 포함하여 요청
                },
            });

            if (!response.ok) {
                throw new Error("리소스 로딩 실패");
            }   

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            setState(blobUrl);
        } catch (error) {
            console.error(`❌ ${url} 가져오기 실패:`, error);
            setState(null); // 실패하면 기본값 유지
        }
    };

    const goToPractice = () => {
        navigate(`/prons/class/${class_id}/seq/${seq_id}/prac`);
    };

    // ✅ 음성 듣기 기능 유지
    const playPronunciation = async () => {
        const textToSpeak = data?.pronunciation || '발음 학습';

        try {
            const response = await flaskApi.post('/ai/tts', { text: textToSpeak }, { responseType: 'blob' });

            const audioBlob = new Blob([response.data], { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);

            setAudioSrc(audioUrl);
        } catch (error) {
            console.error('음성 변환 실패:', error);
        }
    };

    

    return (
        <div className="prons-first-container">
            <GoBackButton />
            <PausePopup onExit={() => navigate('/prons')} title="수업을 끝낼까요?" />
           
            {/* 데이터 로딩 중 표시 */}
            {loading ? (
                <div className="loading-container">🔄 데이터 로딩 중...</div>
            ) : (
                <>
                    <div className="image-container">
                        {/* ✅ 입모양 비디오 가져오기 */}
                        {lipVideoSrc ? (
                            <video className="lips-video" controls autoPlay loop muted>
                                <source src={lipVideoSrc} type="video/mp4" />
                                지원되지 않는 브라우저입니다.
                            </video>
                        ) : (
                            <p>입모양 비디오 없음</p>
                        )}

                        {/* ✅ 혀 이미지 가져오기 */}
                        {tongueImage ? (
                            <img src={tongueImage} alt="구강 내부" className="mouth-image" />
                        ) : (
                            <p>혀 이미지 없음</p>
                        )}
                    </div>

                    <div className="description-container">
                        <div className="porong-wrapper">
                            {showPorong && <img src={porong} alt="포롱이" className="porong-image" />}
                        </div>
                        <p>{error ? '데이터를 불러오는 중 오류가 발생했습니다.' : data?.description}</p>
                    </div>

                    <div className="audio container">
                        <button 
                            className="audio-button" 
                            onClick={playPronunciation}
                        >
                            🔊 음성 듣기
                        </button>
                        {audioSrc && <audio src={audioSrc} controls autoPlay />}
                    </div>

                        {/* ✅ 발음 정보 표시 */}
                            {data?.pronunciation && (
                                <div className="pronunciation-box">
                                {data.pronunciation}
                                </div>
                            )}

                    <div className="next-button" onClick={goToPractice}>
                        다음으로
                    </div>
                </>
            )}

        </div>
    );
};

export default PronsFirst;
