import librosa
import torch
import numpy as np
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
from scipy.spatial.distance import euclidean
from dtw import dtw

# Wav2Vec2 모델 로드 (음소 벡터 추출용)
model_name = "jonatasgrosman/wav2vec2-large-xlsr-53-english"
processor = Wav2Vec2Processor.from_pretrained(model_name)
model = Wav2Vec2ForCTC.from_pretrained(model_name).to("cuda" if torch.cuda.is_available() else "cpu")

def extract_phoneme_vectors(file_path):
    """ 음소(Phoneme) 단위 벡터를 추출하는 함수 """
    audio, rate = librosa.load(file_path, sr=16000)
    audio, _ = librosa.effects.trim(audio)  # 🔹 침묵 제거

    input_values = processor(audio, return_tensors="pt", sampling_rate=16000).input_values.to("cuda" if torch.cuda.is_available() else "cpu")
    
    with torch.no_grad():
        logits = model(input_values).logits  # 모델 출력 (CTC 예측값)

    # 🔹 Softmax 적용 제거 (logits 직접 사용)
    phoneme_vectors = logits.squeeze().cpu().numpy()

    return phoneme_vectors

# 두 개의 음소 벡터 추출
phoneme1 = extract_phoneme_vectors("audio/아1.wav")
phoneme2 = extract_phoneme_vectors("audio/이.wav")

# ✅ DTW를 사용하여 발음 유사도 계산 (음소 벡터 기반 비교)
alignment = dtw(phoneme1, phoneme2, dist_method=euclidean)
dtw_dist = alignment.distance / alignment.index1.shape[0]  # 길이 정규화

print(dtw_dist)
# ✅ DTW 거리 → 유사도로 변환 (퍼센트 값)
MAX_DTW_DIST = 100  # 🔹 DTW 거리 기준 최대값 조정
# dtw_similarity = max(0, 100 - (dtw_dist / MAX_DTW_DIST) * 100)

# print(f"🔹 발음 유사도 (DTW 거리 기반 - 음소 확률 벡터): {dtw_similarity:.2f}%")
