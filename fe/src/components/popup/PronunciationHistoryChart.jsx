import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { springApi } from "../../utils/api";
import "./PronunciationHistoryChart.css";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PronunciationHistoryChart = () => {
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await springApi.get("/prons/history?page=0&size=10");
                const { content } = response.data.histories;

                // 날짜 오름차순 정렬
                const sortedData = content.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

                setHistoryData(sortedData);
            } catch (err) {
                console.error("❌ 학습 기록을 불러오는 중 오류 발생:", err);
                setError("학습 기록을 불러올 수 없습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    // 차트 데이터 변환
    const chartData = {
        labels: historyData.map((entry) => new Date(entry.created_at).toLocaleDateString()), // 날짜 라벨
        datasets: [
            {
                label: "발음 평균 정확도",
                data: historyData.map((entry) => entry.average_correct_rate * 100), // 정확도 (0~1 -> 0~100%)
                backgroundColor: "#ff9800",
                borderRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                title: {
                    display: true,
                    text: "정확도 (%)",
                },
            },
            x: {
                title: {
                    display: true,
                    text: "날짜",
                },
            },
        },
    };

    if (loading) return <p className="chart-loading">📊 학습 데이터를 불러오는 중...</p>;
    if (error) return <p className="chart-error">{error}</p>;

    return (
        <div className="chart-container">
            <div className="chart-wrapper">
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
};

export default PronunciationHistoryChart;
