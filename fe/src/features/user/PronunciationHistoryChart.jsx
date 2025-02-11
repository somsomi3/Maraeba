import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { springApi } from "../../utils/api";
import "./PronunciationHistoryChart.css";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CLASS_IDS = [1, 2, 3]; // ✅ 사용할 class_id 리스트

const PronunciationHistoryChart = () => {
    const [historyData, setHistoryData] = useState({});
    const [classTitles, setClassTitles] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const classResponse = await springApi.get("/prons");
                if (!classResponse.data || !classResponse.data.classes) {
                    throw new Error("클래스 목록을 불러오지 못했습니다.");
                }

                const classList = classResponse.data.classes;
                const titleMap = {};
                classList.forEach(cls => {
                    titleMap[cls.id] = cls.title;
                });
                setClassTitles(titleMap);

                const results = {};
                for (const classId of Object.keys(titleMap)) {
                    console.log(`📢 Fetching history for class_id: ${classId}`);

                    try {
                        const historyResponse = await springApi.get(`/prons/history/class/${classId}`);

                        console.log(`✅ Success for class_id: ${classId}`, historyResponse.data.histories);

                        results[classId] = Array.isArray(historyResponse.data.histories)
                            ? historyResponse.data.histories
                            : [];
                    } catch (err) {
                        console.error(`❌ Error fetching history for class_id: ${classId}`, err);
                        results[classId] = []; // 오류 발생 시 빈 배열 설정
                    }
                }

                setHistoryData(results);
            } catch (err) {
                console.error("❌ 데이터 불러오기 실패:", err);
                setError("학습 기록을 불러올 수 없습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        console.log("📊 historyData 변경됨:", historyData);
    }, [historyData]);

    if (loading) return <p className="chart-loading"> 학습 데이터를 불러오는 중...</p>;
    if (error) return <p className="chart-error">{error}</p>;

    return (
        <div className="chart-container">
            <div className="chart-wrapper-container">
                {CLASS_IDS.map((classId) => (
                    <div key={classId} className="chart-wrapper">
                        <h3>{classTitles[classId] || `클래스 ${classId}`}</h3>
                        {historyData[classId] && historyData[classId].length > 0 ? (
                            <Bar
                                data={{
                                    labels: historyData[classId]
                                        .slice() // 원본 데이터 변경 방지
                                        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) // ✅ 날짜 오름차순 정렬
                                        .map((entry) => new Date(entry.created_at).toLocaleDateString()),

                                    datasets: [
                                        {
                                            label: `${classTitles[classId] || `클래스 ${classId}`}`,
                                            data: historyData[classId]
                                                .slice()
                                                .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) // ✅ 날짜 오름차순 정렬
                                                .map((entry) => entry.average_correct_rate * 100),
                                            backgroundColor: "#f4bc68",
                                            borderRadius: 6,
                                        },
                                    ],

                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: false,
                                        },
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            max: 100,
                                            title: {
                                                display: true,
                                                text: "정확도 (%)",
                                            },
                                            grid: {
                                                display: false, 
                                            },
                                        },
                                        x: {
                                            title: {
                                                display: true,
                                                text: "날짜",
                                            },
                                            grid: {
                                                display: false, 
                                            },
                                        },
                                    },
                                }}
                            />
                        ) : (
                            <p className="no-data-message">📢 학습 데이터가 없습니다.</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PronunciationHistoryChart;
