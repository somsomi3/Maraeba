import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// import { useSelector } from 'react-redux';
import { springApi } from '../../utils/api'; 
import './PronsFirst.css';
import GoBackButton from '../../components/button/GoBackButton';
import PausePopup from '../../components/popup/PausePopup';
import CuteLoading from '../../components/loading/CuteLoading';

// ✅ .env에서 STATIC_API_URL 가져오기
const STATIC_API_URL = import.meta.env.VITE_STATIC_API_URL;

const PronsFirst = () => {
    const navigate = useNavigate();
    const { class_id, seq_id } = useParams();
    const [data, setData] = useState(null);
    const [tutoialSrc, setTutorialSrc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);


    useEffect(() => {
        const fetchPronunciationData = async () => {
            try {
                const response = await springApi.get(`/prons/class/${class_id}/seq/${seq_id}`);
                const { tutorial_video_url, id: pronId } = response.data.data;

                localStorage.setItem("pron_id", pronId);

                if (tutorial_video_url) {
                    setTutorialSrc(STATIC_API_URL+tutorial_video_url);
                } else {
                    setTutorialSrc(null)
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

    const goToPractice = () => {
        navigate(`/prons/class/${class_id}/seq/${seq_id}/prac`);
    };

    return (
        <div className="prons-first-container">
            <GoBackButton />
            <PausePopup onExit={() => navigate('/prons')} title="수업을 끝낼까요?" />
           
            {/* 데이터 로딩 중 표시 */}
            {loading ? (
                <div className="loading-container">
                    <CuteLoading />
                </div>
            ) : (

                <>
                    <div className="tutorial-container">
                        {/* ✅ 입모양 비디오 가져오기 */}
                        {tutoialSrc ? (
                            <video className="tutorial-video" controls autoPlay loop muted>
                                <source src={tutoialSrc} type="video/mp4" />
                                지원되지 않는 브라우저입니다.
                            </video>
                        ) : (
                            <p>튜토리얼 비디오 없음</p>
                        )}

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
