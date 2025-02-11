# Python 3.8
FROM python:3.8

# 작업 디렉토리 설정
WORKDIR /app

# OS 패키지 업데이트 및 ffmpeg 설치
RUN apt-get update && apt-get install -y ffmpeg

# pip 최신화
RUN pip install --upgrade pip

# 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Flask 애플리케이션 소스 코드 복사
COPY . .

# Flask 애플리케이션이 사용하는 포트 5000 열기
EXPOSE 5000

# Gunicorn으로 Flask 서버 실행
CMD ["gunicorn", "--preload", "-w", "4", "-b", "0.0.0.0:5000", "run:app"]
