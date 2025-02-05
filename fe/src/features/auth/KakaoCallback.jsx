import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { springApi } from "../../utils/api";
import { useDispatch } from "react-redux";
import { login } from "../../store/authSlice";

const KakaoCallback = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code"); // ✅ 카카오에서 받은 인가코드 가져오기

        if (code) {
            console.log("✅ 카카오 인가코드:", code);

            // ✅ 인가코드를 백엔드로 전송
            springApi.post("/auth/kakao/callback", { code })
                .then(({ data }) => {
                    console.log("✅ 로그인 성공, 받은 Access Token:", data.access_token);

                    // Redux 상태 업데이트
                    dispatch(login(data.access_token));

                    // localStorage에 Access Token 저장
                    localStorage.setItem("token", data.access_token);

                    // 메인 페이지로 이동
                    navigate("/main");
                })
                .catch((error) => {
                    console.error("❌ 카카오 로그인 실패:", error);
                    alert("카카오 로그인에 실패했습니다.");
                    navigate("/");
                });
        } else {
            console.error("❌ 카카오 인가코드 없음");
            navigate("/");
        }
    }, [navigate, dispatch]);

    return <div>카카오 로그인 중...</div>;
};

export default KakaoCallback;