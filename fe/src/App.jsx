import "./App.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setBrowserInfo } from "./store/browserSlice";
import { Login } from "./features/auth";

function App() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    useEffect(() => {
        if (isAuthenticated) {
            console.log("✅ 로그인 상태 감지 → /main으로 이동");
            navigate("/main"); // ✅ 로그인 상태라면 자동 이동
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {

        // ✅ 먼저 `localStorage`에서 브라우저 정보 가져오기
        const savedBrowserInfo = JSON.parse(localStorage.getItem("browserInfo"));

        if (savedBrowserInfo) {
            console.log("🟢 기존 브라우저 정보 복원:", savedBrowserInfo);
            dispatch(setBrowserInfo(savedBrowserInfo));
            return; // ✅ 기존 정보가 있으면 새로 감지할 필요 없음
        }

        // ✅ 브라우저 환경 감지
        let browser = "unknown";
        let audioType = "webm"; // 기본값

        if (/Android/i.test(navigator.userAgent)) {
            browser = "android";
            audioType = "webm";
        } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            browser = "ios";
            audioType = "mp4a-latm"; // iOS는 mp4가 안정적
        } else if (navigator.userAgent.includes("Chrome")) {
            browser = "chrome";
            audioType = "webm";
        } else if (navigator.userAgent.includes("Safari")) {
            browser = "safari";
            audioType = "mp4";
        }

        console.log(`🌐 감지된 브라우저: ${browser}, 오디오 타입: ${audioType}`);

        // ✅ Redux, localStorage에 저장
        const newBrowserInfo = { browser, audioType };
        dispatch(setBrowserInfo(newBrowserInfo));
        localStorage.setItem("browserInfo", JSON.stringify(newBrowserInfo));
    }, [dispatch]);

    return (
        <div className="app-container">
            <Login />
        </div>
    );
}

export default App;
