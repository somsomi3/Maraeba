import requests

url = "http://3.39.252.223:5000/ai/stt"
file_path = "./test/audio.wav"

with open(file_path, "rb") as f:
    files = {"file": f}  # Key 이름이 반드시 'file'
    response = requests.post(url, files=files)

print(response.json())
