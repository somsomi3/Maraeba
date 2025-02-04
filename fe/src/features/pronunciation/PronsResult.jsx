import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { springApi } from "../../utils/api";
import HomeButton from "../../components/button/HomeButton";
import "./PronsResult.css";

const PronsResult = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1); // 현재 페이지
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        console.log(`📡 학습 기록 요청: /prons/history?page=${page}&size=10`);

        const response = await springApi.get(`/prons/history?page=${page}&size=10`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        console.log("✅ API 응답 데이터:", response.data);

        if (response.data && response.data.histories) {
          console.log("📌 histories.content:", response.data.histories.content);
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

  // 날짜 변환 함수
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
              <h2>📝 학습 ID: {record.class_id}</h2>
              <p>📅 날짜: {formatDate(record.created_at)}</p>
              <p>🎯 평균 유사도 점수: {(record.average_similarity * 100).toFixed(2)}%</p>
            </div>
          ))}
        </div>
      ) : (
        <p>📢 학습 기록이 없습니다.</p>
      )}

      <HomeButton />
    </div>
  );
};

export default PronsResult;
