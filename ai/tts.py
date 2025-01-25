import uuid
import os
from gtts import gTTS

OUTPUT_FOLDER = "outputs"
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def text_to_speech(text):
    # 고유 식별자 기반 음성파일 생성성
    unique_filename = f"{uuid.uuid4()}.mp3"
    audio_file_path = os.path.join(OUTPUT_FOLDER, unique_filename)

    # mp3 파일로 변환
    tts = gTTS(text=text, lang="ko")
    tts.save(audio_file_path)
    return audio_file_path
