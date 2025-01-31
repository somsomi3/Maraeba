import axios from 'axios';

// Redis API 인스턴스 생성
const redisApi = axios.create({
  baseURL: import.meta.env.VITE_REDIS_API_URL, // Redis 서버의 API URL (이 URL은 REST API 형태로 Redis와 상호작용하는 서버여야 함)
  headers: {
    'Content-Type': 'application/json', // 기본 헤더 설정
  },
});

// 요청 인터셉터 (공통)
const addAuthToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// 응답 인터셉터 (공통)
const handleResponseError = async (error) => {
  const originalRequest = error.config;
  
  // Access 토큰 만료 시 토큰 재발급 처리
  if (
    error.response &&
    error.response.status === 401 && // 인증 실패
    !originalRequest._retry // 이미 재시도 여부 확인
  ) {
    originalRequest._retry = true; // 재시도 여부 설정

    const refreshToken = localStorage.getItem('refreshToken'); // Refresh 토큰 가져오기
    if (refreshToken) {
        try {
            // 비동기 요청을 사용하여 새 Access 토큰을 받음
            const res = await axios.post(`${import.meta.env.VITE_SPRING_API_URL}/auth/token`, { refreshToken });
            const newAccessToken = res.data.token; // 새 Access 토큰
            localStorage.setItem('token', newAccessToken); // 로컬 스토리지에 저장
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`; // 요청 헤더 업데이트
            return axios(originalRequest); // 원래 요청 다시 보내기
          } catch (refreshError) {
            // Refresh 토큰 실패 시 처리
            console.error('토큰 재발급 실패:', refreshError);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login'; // 로그인 페이지로 리다이렉트
            return Promise.reject(refreshError);
          }
        }
      }
  
  // 그 외의 오류 처리
  return Promise.reject(error);
};

// 요청 인터셉터 추가
redisApi.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));

// 응답 인터셉터 추가
redisApi.interceptors.response.use((response) => response, handleResponseError);

// Redis와 상호작용하는 함수 예시
const getRedisData = async (key) => {
  try {
    const response = await redisApi.get(`/redis/data/${key}`); // Redis에 GET 요청
    return response.data;
  } catch (error) {
    console.error('Redis API 요청 실패:', error);
    throw error;
  }
};

// Redis에 데이터 설정 예시
const setRedisData = async (key, value) => {
  try {
    const response = await redisApi.post('/redis/data', { key, value }); // Redis에 POST 요청
    return response.data;
  } catch (error) {
    console.error('Redis API 요청 실패:', error);
    throw error;
  }
};

export { redisApi, getRedisData, setRedisData };
