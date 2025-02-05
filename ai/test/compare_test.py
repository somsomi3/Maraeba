import requests

# Flask 서버의 URL
url = "http://localhost:5000/ai/compare/short"
file_path = "./audio/에1.wav"
correct_text = "에"

# 요청 데이터 준비
with open(file_path, "rb") as audio_file:
    files = {"file": audio_file}
    data = {"text": correct_text}

    # POST 요청 보내기
    response = requests.post(url, files=files, data=data)

# 응답 출력
print("응답 상태 코드:", response.status_code)
if response.status_code == 200:
    print("응답 데이터:", response.json())
else:
    print("에러 메시지:", response.json())
