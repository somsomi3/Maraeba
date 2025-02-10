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
        const error = urlParams.get("error"); // ✅ 네이버 로그인 실패 시 포함됨
        const errorDescription = urlParams.get("error_description");

        if (error) {
            console.error("❌ 네이버 로그인 실패:", error, errorDescription);
            alert(`네이버 로그인 실패: ${errorDescription || "알 수 없는 오류 발생"}`);
            navigate("/");
            return;
        }

        if (code) {
            console.log("✅ 네이버 인가코드:", code);

            springApi
                .post("/auth/naver/callback", { code }) 
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
