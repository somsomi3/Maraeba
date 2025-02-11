import requests

url = "http://localhost:5000/recognize"
file_path = "./audio/빵.wav"

with open(file_path, "rb") as f:
    files = {"file": f}  # Key 이름이 반드시 'file'
    response = requests.post(url, files=files)

print(response.json())
