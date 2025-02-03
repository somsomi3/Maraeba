import speech_recognition as sr
from pydub import AudioSegment
import whisper

# 한 글자는 인식이 안되어서 이어붙이기
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

    results = {}

    try:
        with sr.AudioFile(audio_file_path) as source:
            audio = recognizer.record(source)

        # Google STT
        try:
            google_text = recognizer.recognize_google(audio, language="ko-KR")
            google_result = "".join(google_text.split())  # 모든 공백 제거
            results["Google STT"] = google_result
        except sr.UnknownValueError:
            results["Google STT"] = "오디오를 이해하지 못했습니다."
        except sr.RequestError as e:
            results["Google STT"] = f"음성 인식 서비스 오류: {e}"

        # Whisper STT
        try:
            whisper_model = whisper.load_model("large", device="cpu")  # 작은 모델 사용
            whisper_result = whisper_model.transcribe(audio_file_path, language="korean", task="transcribe", temperature=0)  # 한글만 변환, 일관된 결과 유지
            text = "".join(whisper_result["text"].split())  # 모든 공백 제거
            print(text)
            results["Whisper STT"] = text

        except Exception as e:
            results["Whisper STT"] = f"Whisper 오류: {e}"

    except Exception as e:
        results["Error"] = f"파일 처리 오류: {e}"

    return results
