import librosa
import torch
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor

# Wav2Vec2 모델 로드
model_name = "jonatasgrosman/wav2vec2-large-xlsr-53-english"
processor = Wav2Vec2Processor.from_pretrained(model_name)
model = Wav2Vec2ForCTC.from_pretrained(model_name).to("cuda" if torch.cuda.is_available() else "cpu")

def transcribe_audio(file_path):
    """ 음성을 텍스트로 변환하는 함수 """
    audio, rate = librosa.load(file_path, sr=16000)
    audio, _ = librosa.effects.trim(audio)  # 🔹 침묵 제거
    input_values = processor(audio, return_tensors="pt", sampling_rate=16000).input_values.to("cuda" if torch.cuda.is_available() else "cpu")
    
    with torch.no_grad():
        logits = model(input_values).logits

    # 예측된 텍스트 변환
    prediction = torch.argmax(logits, dim=-1)
    transcription = processor.batch_decode(prediction)[0]

    return transcription.strip()

# 두 개의 음성 파일을 변환
text1 = transcribe_audio("audio/아1.wav")
text2 = transcribe_audio("audio/이.wav")

# 결과 출력
print(f"🔹 변환된 텍스트 1: {text1}")
print(f"🔹 변환된 텍스트 2: {text2}")
