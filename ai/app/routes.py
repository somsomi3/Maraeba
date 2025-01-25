import os
from flask import Blueprint, request, jsonify, after_this_request, send_file
from stt import recognize_speech_from_file
from tts import text_to_speech

api_bp = Blueprint('api', __name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# 텍스트 -> 음성 변환 요청
@api_bp.route('/tts', methods=['POST'])
def tts_endpoint():
    data = request.get_json()

    # request 누락시
    if not data or 'text' not in data:
        return jsonify({"error": "No text provided"}), 400

    text = data['text']
    try:
        # TTS 함수 호출
        audio_file_path = text_to_speech(text)

        # 파일을 바로 응답으로 반환
        @after_this_request
        def remove_file(response):
            if os.path.exists(audio_file_path):
                os.remove(audio_file_path)
                print(f"Deleted file: {audio_file_path}")
            return response

        return send_file(audio_file_path, mimetype="audio/mp3", as_attachment=True, download_name="output.mp3")
    except Exception as e:
        return jsonify({"error": f"TTS conversion failed: {str(e)}"}), 500

# 음성 -> 텍스트 변환 요청
@api_bp.route('/stt', methods=['POST'])
def stt_endpoint():

    # request 누락시
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        # 음성파일 임시 저장
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)

        # 함수 호출
        recognized_text = recognize_speech_from_file(file_path)

        # 임시 음성파일 삭제
        os.remove(file_path)

        return jsonify({"recognized_text": recognized_text})
