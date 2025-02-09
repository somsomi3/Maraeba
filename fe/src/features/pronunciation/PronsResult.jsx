import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { springApi } from "../../utils/api";
import pororo from "../../assets/images/pororo.png"
import "./PronsResult.css";
import { useSelector } from "react-redux";

const PronsResult = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]); // 모든 학습 기록
  const [latestRecord, setLatestRecord] = useState(null); // 최근 학습 기록
  const [classTitleMap, setClassTitleMap] = useState({}); // classId -> title 매핑
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    // 🟢 PronsMain에서 저장된 제목을 localStorage에서 가져와 classTitleMap에 저장
    const fetchClassTitles = async () => {
      try {
        const response = await springApi.get("/prons");
        if (response.data && response.data.classes) {
          const titleMap = {};
          response.data.classes.forEach((item) => {
            titleMap[item.id] = item.title;
          });
          setClassTitleMap(titleMap);
        }
      } catch (err) {
        console.error("❌ 수업 목록 불러오기 실패:", err);
      }
    };

    // 🟢 학습 기록 가져오기
    const fetchHistory = async () => {
      try {
        const response = await springApi.get(`/prons/history?page=${page}&size=10`, {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Redux에서 가져온 토큰 사용
          },
        });


        console.log("✅ API 응답 데이터:", response.data);

        if (response.data && response.data.histories) {
          const records = response.data.histories.content;
          setHistory(records); // 모든 기록 저장
          setTotalPages(response.data.histories.total_pages);

          // 🟢 가장 최근 기록 가져오기
          if (records.length > 0) {
            setLatestRecord(records[0]); // 가장 최신 기록 저장
          }
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

    fetchClassTitles();
    fetchHistory();
  }, [page]);

  // 🔴 다시하기 버튼: 새로운 세션 시작
  const handleRestart = async () => {
    const classId = latestRecord?.class_id;
    if (!classId) {
      alert("클래스 ID가 없습니다.");
      return;
    }

    try {
      console.log(`📡 새 세션 시작 요청: /prons/start/class/${classId}`);
      const response = await springApi.post(`/prons/start/class/${classId}`);
      const sessionId = response.data.session_id;

      console.log("✅ 새 세션 생성 완료, session_id:", sessionId);
      localStorage.setItem("session_id", sessionId);

      navigate(`/prons/class/${classId}/seq/1`); // 첫 번째 학습 화면으로 이동
    } catch (error) {
      console.error("❌ 세션 시작 실패:", error);
      alert("새로운 학습 세션을 시작할 수 없습니다.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="prons-result-container">
      <h1>📊 학습 결과</h1>

      {/* ✅ 최근 학습 결과 */}
      {latestRecord && (
        <div className="current-session-result">
          <div className="profile">
                <img src={pororo} alt="" />
            </div> {/* 둥근 이미지 자리 */}
          <div className="session-info">
            <h2>{classTitleMap[latestRecord.class_id] || "학습 제목"}</h2>
            <p className="session-score">유사도: {(latestRecord.average_correct_rate*100).toFixed(0)}점</p>
            <div className="session-buttons">
              <button onClick={handleRestart}>다시하기</button>
              <button onClick={() => navigate("/prons")}>학습 끝내기</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ 학습 기록 히스토리 */}
      <h2 className="history-title">결과 히스토리</h2>
      {loading ? (
        <p>🔄 학습 기록을 불러오는 중...</p>
      ) : error ? (
        <p>❌ 학습 기록을 불러오는 데 실패했습니다.</p>
      ) : history.length > 0 ? (
        <table className="history-table">
          <thead>
            <tr>
              <th>수업 제목</th>
              <th>유사도</th>
              <th>수업 날짜</th>
            </tr>
          </thead>
          <tbody>
            {history.map((record, index) => (
              <tr key={index}>
                <td>{classTitleMap[record.class_id] || `Class ${record.class_id}`}</td>
                <td>{(record.average_correct_rate*100).toFixed(0)}점</td>
                <td>{formatDate(record.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>📢 학습 기록이 없습니다.</p>
      )}

    </div>
  );
};

export default PronsResult;
