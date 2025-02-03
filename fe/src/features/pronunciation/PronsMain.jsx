import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { springApi } from "../../utils/api";
import "./PronsMain.css";
import pronstitle from "../../assets/images/pronstitle.png";
import HomeButton from "../../components/button/HomeButton";
const PronsMain = () => {
  const navigate = useNavigate();
  const [classData, setClassData] = useState([]); // 초기값을 빈 배열로 설정
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await springApi.get("/prons");
        console.log("백엔드 응답:", response.data);

        if (Array.isArray(response.data)) {
          setClassData(response.data); // 응답이 배열이면 그대로 저장
        } else if (response.data && Array.isArray(response.data.classes)) {
          setClassData(response.data.classes); // `classes` 내부 배열 가져오기
        } else {
          setClassData([]); // 응답이 올바르지 않으면 빈 배열로 설정
        }
      } catch (error) {
        console.error("❌ 발음 학습 목록 불러오기 실패:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleStart = (classId) => {
    console.log(`🔹 Navigating to class_id: ${classId}`);
    navigate(`/prons/class/${classId}/seq/1`);
  };

  return (
    <div className="prons-container">
      <HomeButton />
      <img src={pronstitle} alt="Pronunciation Title" className="pronstitle-image" />

      {loading ? (
        <p>데이터를 불러오는 중...</p>
      ) : error ? (
        <p>발음 수업 정보를 불러오는 데 실패했습니다.</p>
      ) : (
        <div className="card-slider">
          {classData.length > 0 ? (
            classData.map((item) => (
              <div className="card" key={item.id}>
                <h2>{item.title}</h2>
                <span className="emoji">🔤</span>
                <p>{item.description}</p>
                <div className="divider"></div>
                <p>발음의 입모양을 익혀보고 소리내어 읽어봐요!</p>
                <button
                  className="start-button"
                  onClick={() => handleStart(item.id)}
                >
                  시작하기
                </button>
              </div>
            ))
          ) : (
            <p>📢 수업 정보가 없습니다.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PronsMain;
