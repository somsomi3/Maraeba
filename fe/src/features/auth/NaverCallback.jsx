import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { springApi } from "../../utils/api";
import { useDispatch } from "react-redux";
import { login } from "../../store/authSlice";

const NaverCallback = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const state = urlParams.get("state"); // 네이버는 state 값도 함께 보냄

        if (code) {
            console.log("✅ 네이버 인가코드:", code);
            console.log("✅ 네이버 state 값:", state);

            // ✅ 백엔드로 인가 코드 전송 (springApi 사용)
            springApi
                .post("/auth/naver/callback", { code, state }) // 🔹 state 값도 같이 전송
                .then(({ data }) => {
                    console.log("✅ 백엔드 응답:", data);

                    if (data.access_token) {
                        dispatch(login(data.access_token)); // ✅ Redux에 토큰 저장
                        navigate("/main"); // ✅ 메인 페이지로 이동
                    } else {
                        console.error("❌ 토큰 없음, 로그인 실패");
                        alert("로그인 실패: 토큰을 받을 수 없습니다.");
                        navigate("/");
                    }
                })
                .catch((error) => {
                    console.error("❌ 네이버 로그인 실패:", error);
                    alert("네이버 로그인에 실패했습니다.");
                    navigate("/");
                });
        } else {
            console.error("❌ 네이버 인가코드 없음");
            navigate("/");
        }
    }, [navigate, dispatch]);

    return <div>네이버 로그인 중...</div>;
};

export default NaverCallback;
