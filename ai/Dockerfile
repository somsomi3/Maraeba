# 1. Python 3.10.11 이미지를 베이스로 사용
FROM python:3.10.11

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. requirements.txt 파일을 컨테이너로 복사
COPY requirements.txt .

# 4. 필요한 라이브러리 설치
RUN pip install --no-cache-dir -r requirements.txt

# 5. Flask 애플리케이션 소스 코드 복사
COPY . .

# 6. Flask 애플리케이션이 사용하는 포트 5000 열기
EXPOSE 5000

# 7. Gunicorn으로 Flask 서버 실행
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "run:app"]
