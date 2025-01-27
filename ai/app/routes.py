import os
from flask import Blueprint, request, jsonify, send_file
from stt import recognize_speech_from_file
from tts import text_to_speech
from ipa import word_to_ipa
from similarity import calculate_similarities

api_bp = Blueprint('api', __name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# 음성 유사도 비교
@api_bp.route('/compare', methods=['POST'])
def compare_endpoint():

    # request 누락시
    if 'file' not in request.files or 'text' not in request.form:
        return jsonify({"error": "File or text missing from request"}), 400

    file = request.files['file']
    correct_text = request.form['text'].strip()

    if file.filename == '' or not correct_text:
        return jsonify({"error": "Empty file or text provided"}), 400

    try:
        # 음성파일 임시 저장
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)

        # 함수 호출
        recognized_text = recognize_speech_from_file(file_path)

        # 임시 음성파일 삭제
        os.remove(file_path)

        # 변환된 텍스트와 정답 텍스트를 IPA 기호로 각각 변환하기
        recognized_ipa = word_to_ipa(recognized_text)
        correct_ipa = word_to_ipa(correct_text)

        # 변환한 IPA 기호의 유사도를 계산하고 반환하기
        similarities = calculate_similarities(recognized_ipa, correct_ipa)
        
        return jsonify({
            "recognized_text": recognized_ipa,
            "similarities": similarities 
        })
    except Exception as e:
        return jsonify({"error": f"Error during comparison: {str(e)}"}), 500

# 텍스트 -> 음성 변환 요청
@api_bp.route('/tts', methods=['POST'])
def tts_endpoint():
    data = request.get_json()

    # request 누락시
    if not data or 'text' not in data:
        return jsonify({"error": "No text provided"}), 400

    text = data['text'].strip()
    if not text:
        return jsonify({"error": "Text is empty"}), 400
    
    try:
        # TTS 함수 호출 (메모리 버퍼 반환)
        audio_buffer = text_to_speech(text)

        # 메모리 버퍼를 바로 응답으로 반환
        return send_file(
            audio_buffer,
            mimetype="audio/mp3",
            as_attachment=False,
        )
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
