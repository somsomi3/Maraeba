import naver from '../../assets/icons/naver_login.png'

const NaverLogin = () => {

  const handleNaverLogin = () => {

    const NAVER_AUTH_URL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${import.meta.env.VITE_NAVER_CLIENT_ID}&state=${import.meta.env.VITE_NAVER_STATE_STRING}&redirect_uri=${import.meta.env.VITE_NAVER_REDIRECT_URI}`;

    window.location.href = NAVER_AUTH_URL;
};

  return (
    <button className="naverbtn" onClick={handleNaverLogin}>
      <img src={naver} alt="네이버 로그인" className="naver" />
    </button>
  );
};

export default NaverLogin;
