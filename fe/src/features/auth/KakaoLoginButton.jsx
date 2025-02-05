import kakao from "../../assets/icons/kakao_login.png";
import { useDispatch } from "react-redux";
import { login } from "../../store/authSlice";
import { springApi } from "../../utils/api";

const KakaoLoginButton = () => {
  const dispatch = useDispatch();

  const handleKakaoLogin = async () => {
    try {
      // ✅ 1. 백엔드에서 카카오 로그인 URL 요청
      const response = await springApi.get("/auth/kakao");

      if (!response.data || !response.data.redirect_uri) {
        alert("카카오 로그인 URL을 가져오지 못했습니다.");
        return;
      }

      console.log("✅ 카카오 로그인 URL:", response.data.redirect_uri);

      // ✅ 2. 팝업 창에서 카카오 로그인 실행
      const popup = window.open(
        response.data.redirect_uri,
        "kakaoLoginPopup",
        "width=500,height=600"
      );

      if (!popup) {
        alert("팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해주세요.");
        return;
      }

      // ✅ 3. 일정 간격으로 팝업 닫힘 확인 (백엔드 로그인 완료 후 응답 확인)
      const checkPopup = setInterval(async () => {
        if (popup.closed) {
          clearInterval(checkPopup);
          console.log("✅ 팝업이 닫혔습니다. 로그인 성공 여부 확인 중...");

          // ✅ 4. 백엔드에서 Access Token 요청 (카카오 로그인 완료 후)
          try {
            const tokenResponse = await springApi.get("/auth/kakao/token", {
              withCredentials: true, // Refresh Token 포함
            });

            if (tokenResponse.data && tokenResponse.data.access_token) {
              console.log("✅ 로그인 성공! Access Token:", tokenResponse.data.access_token);

              // ✅ 5. Redux 상태 업데이트 및 localStorage 저장
              dispatch(login(tokenResponse.data.access_token));
              localStorage.setItem("accessToken", tokenResponse.data.access_token);

              // ✅ 6. 로그인 성공 후 메인 페이지로 이동
              window.location.href = "/main";
            } else {
              alert("카카오 로그인이 완료되지 않았습니다.");
            }
          } catch (error) {
            console.error("❌ Access Token 요청 실패:", error);
          }
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
