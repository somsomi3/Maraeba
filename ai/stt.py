import speech_recognition as sr

def recognize_speech_from_file(audio_file_path):
    recognizer = sr.Recognizer()
    
    try:
        with sr.AudioFile(audio_file_path) as source:
            audio = recognizer.record(source)

        text = recognizer.recognize_google(audio, language="ko-KR")
        return text

    except sr.UnknownValueError:
        return "오디오를 이해하지 못했습니다."
    except sr.RequestError as e:
        return f"음성 인식 서비스 오류: {e}"
