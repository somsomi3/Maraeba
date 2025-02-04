import kakao from "../../assets/icons/kakao_login.png"
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { login } from "../../store/authSlice";
import { springApi } from "../../utils/api";

const KakaoLoginButton = () => {
  const dispatch = useDispatch();

  const handleKakaoLogin = async () => {
    try {
      // ✅ 백엔드에 카카오 로그인 요청 (Spring API 사용)
      const response = await springApi.get("/auth/kakao");
      const { redirect_uri } = response.data;

      if (!redirect_uri) {
        alert("카카오 로그인 URL을 가져오지 못했습니다.");
        return;
      }

      console.log("✅ 카카오 로그인 URL:", redirect_uri);

      // 🔹 팝업 창으로 카카오 로그인 페이지 열기
      const popup = window.open(
        redirect_uri,
        "kakaoLoginPopup",
        "width=500,height=600"
      );

      if (!popup) {
        alert("팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해주세요.");
        return;
      }

      // 🔹 팝업 창에서 JWT 토큰을 받아서 저장
      const checkPopup = setInterval(() => {
        try {
          if (!popup || popup.closed) {
            clearInterval(checkPopup);
            console.log("✅ 팝업이 닫혔습니다. 로그인 성공 여부 확인");

            // 🔹 부모 창(localStorage)에 저장된 토큰 확인
            const accessToken = localStorage.getItem("token");
            const refreshToken = localStorage.getItem("refreshToken");

            if (accessToken && refreshToken) {
              console.log("✅ 로그인 성공, Redux 상태 업데이트");

              // Redux 상태 업데이트
              dispatch(login(accessToken));

              // 메인 페이지로 이동
              window.location.href = "/main";
            } else {
              alert("카카오 로그인이 완료되지 않았습니다.");
            }
          }
        } catch (error) {
          console.error("❌ 팝업 로그인 체크 오류:", error);
        }
      }, 1000);
    } catch (error) {
      console.error("❌ 카카오 로그인 요청 실패:", error);
      alert("카카오 로그인 요청에 실패했습니다.");
    }
  };

  return (
    <button className="kakaobtn" onClick={handleKakaoLogin}>
      <img src={kakao} alt="카카오 로그인" className="kakao" />
    </button>
  );
};

export default KakaoLoginButton;
