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
        const code = urlParams.get("code");
    
        if (code) {
            console.log("✅ 카카오 인가코드:", code);
    
            springApi
                .post("/auth/kakao/callback", { code }, { withCredentials: true })
                .then(({ data }) => {
                    console.log("✅ 백엔드 응답:", data);
    
                    if (data.access_token) {
                        dispatch(login(data.access_token));
                        navigate("/main");
                    } else {
                        console.error("❌ 토큰 없음, 로그인 실패");
                        alert("로그인 실패: 토큰을 받을 수 없습니다.");
                        navigate("/");
                    }
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
