import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { springApi } from "../../utils/api";
import "./PronunciationDetailChart.css";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CLASS_IDS = [1, 2, 3]; // ✅ 사용할 class_id 리스트
const CLASS_TITLES = { 1: "모음", 2: "이중 모음", 3: "자음" }; // ✅ 클래스별 제목

const PronunciationDetailChart = () => {
    const [selectedClass, setSelectedClass] = useState(1); // ✅ 기본 선택된 class_id (모음)
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const response = await springApi.get(`/prons/stat/detail/${selectedClass}`);
                console.log(`✅ 클래스 ${selectedClass} 통계 데이터:`, response.data.stats);
                setStats(response.data.stats || []);
                setError(null);
            } catch (err) {
                console.error(`❌ 클래스 ${selectedClass} 데이터 불러오기 실패:`, err);
                setError("학습 데이터를 불러올 수 없습니다.");
                setStats([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [selectedClass]);

    return (
        <div className="pronunciation-detail-chart">
            {/* <h2>📊 클래스별 발음 학습 통계</h2> */}

            {/* ✅ 클래스 선택 탭 */}
            <div className="class-tabs">
                {CLASS_IDS.map((classId) => (
                    <button
                        key={classId}
                        className={selectedClass === classId ? "active" : ""}
                        onClick={() => setSelectedClass(classId)}
                    >
                        {CLASS_TITLES[classId]}
                    </button>
                ))}
            </div>

            {/* ✅ 차트 렌더링 */}
            {loading ? (
                <p className="chart-loading">📡 데이터를 불러오는 중...</p>
            ) : error ? (
                <p className="chart-error">{error}</p>
            ) : stats.length > 0 ? (
                <Bar
                    data={{
                        labels: stats.map((stat) => stat.pronunciation),
                        datasets: [
                            {
                                label: "정확도 (%)",
                                data: stats.map((stat) => stat.average_correct_rate * 100),
                                backgroundColor: "#f4bc68",
                                borderRadius: 6,
                            },
                        ],
                    }}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100,
                                title: { display: true, text: "정확도 (%)" },
                                grid: { display: false },
                            },
                            x: {
                                title: { display: true, text: "발음" },
                                grid: { display: false },
                            },
                        },
                    }}
                />
            ) : (
                <p className="no-data-message">📢 학습 데이터가 없습니다.</p>
            )}
        </div>
    );
};

export default PronunciationDetailChart;
