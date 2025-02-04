import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { springApi } from "../../utils/api";
import HomeButton from "../../components/button/HomeButton";
import "./PronsResult.css";

const PronsResult = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [classTitle, setClassTitle] = useState(""); // 🔹 학습 제목
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const title = localStorage.getItem("class_title");
    if (title) {
      setClassTitle(title);
    }
  }, []);
  

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        
        const response = await springApi.get(`/prons/history?page=${page}&size=10`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        console.log("✅ API 응답 데이터:", response.data);

        if (response.data && response.data.histories) {

          setHistory(response.data.histories.content);
          setTotalPages(response.data.histories.total_pages);
        } else {
          setHistory([]);
          setTotalPages(1);
        }

        setError(false);
      } catch (err) {
        console.error("❌ 학습 기록 불러오기 실패:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [page]);

  useEffect(() => {
    return () => {
      const session_id = localStorage.getItem("session_id");

      if (!session_id) {
        console.warn("⚠️ 세션 ID 없음. 이미 종료되었을 가능성이 있음.");
        return;
      }

      console.log(`📡 수업 세션 종료 요청: /prons/session/${session_id}`);

      springApi
        .delete(`/prons/session/${session_id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then(() => {
          console.log("✅ 수업 세션 종료 완료");
        })
        .catch((err) => {
          console.error("❌ 수업 세션 종료 실패:", err);
        });
    };
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="prons-result-container">
      <h1>📊 학습 결과</h1>
      {loading ? (
        <p>🔄 학습 기록을 불러오는 중...</p>
      ) : error ? (
        <p>❌ 학습 기록을 불러오는 데 실패했습니다.</p>
      ) : history.length > 0 ? (
        <div className="history-list">
          {history.map((record, index) => (
            <div key={index} className="history-item">
              <p>{classTitle}</p>
              <p>📅 날짜: {formatDate(record.created_at)}</p>
              <p>🎯 평균 유사도 점수: {(record.average_similarity).toFixed(2)}%</p>
            </div>
          ))}
        </div>
      ) : (
        <p>📢 학습 기록이 없습니다.</p>
      )}

      <button className="exit-button" onClick={() => navigate("/prons")}>
        🔙 학습 메인으로
      </button>
    </div>
  );
};

export default PronsResult;
