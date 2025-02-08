import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { springApi, flaskApi } from '../../utils/api';
import './PronsFirst.css';
import GoBackButton from '../../components/button/GoBackButton';
import PausePopup from '../../components/popup/PausePopup';
import { VscChevronRight } from 'react-icons/vsc';
import lipshape from '../../assets/images/lipshape.png';
import tongue from '../../assets/images/tongue.png';

const PronsFirst = () => {
    const navigate = useNavigate();
    const { class_id, seq_id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [audioSrc, setAudioSrc] = useState(null);
    
    useEffect(() => {
      const fetchPronunciationData = async () => {
        try {
          const response = await springApi.get(`/prons/class/${class_id}/seq/${seq_id}`);
          setData(response.data.data || {});
          setError(false);
        } catch (error) {
          console.error('데이터 불러오기 실패:', error);
          setError(true);
        } finally {
          setLoading(false);
        }
      };
  
      fetchPronunciationData();
    }, [class_id, seq_id]);
  
    const handleExit = () => {
      navigate("/prons");
    };
  
    // 다음 연습 화면으로 이동
    const goToPractice = () => {
      navigate(`/prons/class/${class_id}/seq/${seq_id}/prac`);
    };
  
    // 텍스트를 음성으로 변환하여 재생
    const playPronunciation = async () => {
        const textToSpeak = data?.pronunciation || '발음 학습';
      
        try {
          const response = await flaskApi.post('/ai/tts', { text: textToSpeak }, { responseType: 'blob' });
          
          // Blob 객체 생성
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
        <PausePopup onExit={handleExit} />
        {/* 데이터 로딩 중 표시 */}
        {loading ? (
          <div className="loading-container">🔄 데이터 로딩 중...</div>
        ) : (
          <>
            <div className="image-container">
              <img src={lipshape} alt="입모양" className="lip-image" />
              <img src={tongue} alt="구강 내부" className="mouth-image" />
            </div>
            
            <div className="description-container">
              <h2 className="vowel-title">{data?.pronunciation || '발음 학습'}</h2>
              <p>{error ? '데이터를 불러오는 중 오류가 발생했습니다.' : data?.description}</p>
            </div>
  
            <div className="audio-container">
                <button className="audio-button" onClick={playPronunciation}>
                    🔊 음성 듣기
                </button>
                {audioSrc && <audio src={audioSrc} controls autoPlay />}
                </div>
  

            <div className="next-arrow-container" onClick={goToPractice}>
              <VscChevronRight className="next-arrow" />
            </div>
          </>
        )}
      </div>
    );
  };
  
  export default PronsFirst;
