import uuid
import os
from gtts import gTTS
from io import BytesIO

def text_to_speech(text):
    # 메모리 버퍼에 음성 저장
    audio_buffer = BytesIO()
    tts = gTTS(text=text, lang="ko")
    tts.write_to_fp(audio_buffer)  # 메모리 버퍼에 저장
    audio_buffer.seek(0)  # 버퍼의 시작 위치로 이동
    return audio_buffer
