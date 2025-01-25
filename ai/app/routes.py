import os
from flask import Blueprint, request, jsonify
from stt import recognize_speech_from_file

api_bp = Blueprint('api', __name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@api_bp.route('/stt', methods=['POST'])
def stt_endpoint():
    print("Request files:", request.files)

    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)

        recognized_text = recognize_speech_from_file(file_path)  # 함수 호출
        os.remove(file_path)

        return jsonify({"recognized_text": recognized_text})
