import os
from flask import Blueprint, request, jsonify, send_file
from flask_cors import CORS
from stt import recognize_speech_from_file
from tts import text_to_speech

import tempfile
import time
import torch
import torchaudio
import logging
import re
from model import decode, get_pretrained_model

api_bp = Blueprint('api', __name__)
CORS(api_bp)

torch.set_num_threads(1)
torch.set_num_interop_threads(1)
torch._C._jit_set_profiling_executor(False)
torch._C._jit_set_profiling_mode(False)
torch._C._set_graph_executor_optimize(False)

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

        # 임시 파일로 저장
        with tempfile.NamedTemporaryFile(delete=False) as temp:
            temp.write(file.read())
            temp_path = temp.name
        
        # WAV 변환
        file_path = convert_to_wav(temp_path)

        # 함수 호출
        recognized_text = recognize_speech_from_file(file_path)

        return jsonify({"recognized_text": recognized_text})
    
# 한 글자 stt
@api_bp.route('/stt/single', methods=['POST'])
def stt_single_endpoint():

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty file name"}), 400

    decoding_method = "modified_beam_search"
    num_active_paths = 15

    # 임시 파일로 저장
    with tempfile.NamedTemporaryFile(delete=False) as temp:
        temp.write(file.read())
        temp_path = temp.name

    try:
        result = process_audio(decoding_method, num_active_paths, temp_path)
        os.remove(temp_path)  # 처리 후 임시 파일 삭제

        recognized_text = "".join(re.findall(r"[가-힣]", result.get("text", "")))
        return jsonify({"recognized_text": recognized_text})
    except Exception as e:
        logging.error(f"Error processing audio: {str(e)}")
        return jsonify({"error": str(e)}), 500

# 한 글자 음성 텍스트 비교
@api_bp.route('/compare', methods=['POST'])
def compare():

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    if "text" not in request.form:
        return jsonify({"error": "No text provided"}), 400

    file = request.files["file"]
    text = request.form["text"].strip()  # 입력받은 텍스트
    if file.filename == "":
        return jsonify({"error": "Empty file name"}), 400

    decoding_method = "modified_beam_search"
    num_active_paths = 15

    # 임시 파일로 저장
    with tempfile.NamedTemporaryFile(delete=False) as temp:
        temp.write(file.read())
        temp_path = temp.name

    try:
        result = process_audio(decoding_method, num_active_paths, temp_path)
        os.remove(temp_path)  # 처리 후 임시 파일 삭제

        # 인식된 글자
        recognized_text = "".join(re.findall(r"[가-힣]", result.get("text", "")))

        # 제시된 글자
        clean_text = "".join(re.findall(r"[가-힣]", text))

        # 동일 여부
        is_match = recognized_text == clean_text
        
        return jsonify({
            "recognized_text": recognized_text,
            "match": is_match
        })
    except Exception as e:
        logging.error(f"Error processing audio: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
@torch.no_grad()
def process_audio(decoding_method: str, num_active_paths: int, in_filename: str):
    """음성 파일을 처리하고 텍스트로 변환"""
    logging.info(f"Processing file: {in_filename}")

    # WAV 변환
    filename = convert_to_wav(in_filename)

    start_time = time.time()

    # 사전 학습된 한국어 모델 가져오기
    recognizer = get_pretrained_model(
        repo_id="k2-fsa/sherpa-onnx-zipformer-korean-2024-06-24",
        decoding_method=decoding_method,
        num_active_paths=num_active_paths,
    )

    # 음성 인식 수행
    text = decode(recognizer, filename)

    end_time = time.time()

    # 음성 길이 및 처리 시간 계산
    metadata = torchaudio.info(filename)
    duration = metadata.num_frames / 16000
    processing_time = end_time - start_time

    # 결과 반환
    return {
        "text": text,
        "duration": round(duration, 3),
        "processing_time": round(processing_time, 3),
        "rtf": round(processing_time / duration, 3),
    }
    
def convert_to_wav(in_filename: str) -> str:
    """음성 파일을 16kHz 모노 WAV 파일로 변환"""
    out_filename = f"{in_filename}.wav"
    os.system(
        f"ffmpeg -hide_banner -loglevel error -i '{in_filename}' -ar 16000 -ac 1 '{out_filename}' -y"
    )
    return out_filename