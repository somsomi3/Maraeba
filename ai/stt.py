import speech_recognition as sr
from pydub import AudioSegment

# 한 글자는 인식이 안되어서 이어붙이기기
def duplicate_and_merge_audio(input_audio, silence_duration=300):
    sound = AudioSegment.from_wav(input_audio)
    silence = AudioSegment.silent(duration=silence_duration)

    # 원본 + 복제본 이어붙이기
    combined = sound + silence + sound  

    combined.export(input_audio, format="wav")
    return


def recognize_speech_from_file(audio_file_path):
    recognizer = sr.Recognizer()

    duplicate_and_merge_audio(audio_file_path)
    
    try:
        with sr.AudioFile(audio_file_path) as source:
            audio = recognizer.record(source)

        text = recognizer.recognize_google(audio, language="ko-KR")

        # 결과의 절반만 사용
        half_length = len(text) // 2
        return text[:half_length]

    except sr.UnknownValueError:
        return "오디오를 이해하지 못했습니다."
    except sr.RequestError as e:
        return f"음성 인식 서비스 오류: {e}"
