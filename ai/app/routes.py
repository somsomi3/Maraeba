import os
from flask import Blueprint, request, jsonify, send_file
from flask_cors import CORS
from stt import recognize_speech_from_file
from tts import text_to_speech

import tempfile
import time
import torch
import torchaudio
from logger import logger
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
    logger.info(f"[TTS] 요청 받음: {data}")

    if not data or 'text' not in data:
        logger.warning("[TTS] No text provided")
        return jsonify({"error": "No text provided"}), 400

    text = data['text'].strip()
    if not text:
        logger.warning("[TTS] Empty text")
        return jsonify({"error": "Text is empty"}), 400

    try:
        audio_buffer = text_to_speech(text)
        logger.info("[TTS] 변환 성공")
        return send_file(audio_buffer, mimetype="audio/mp3", as_attachment=False)
    except Exception as e:
        logger.error(f"[TTS] 변환 실패: {str(e)}")
        return jsonify({"error": f"TTS conversion failed: {str(e)}"}), 500

# 음성 -> 텍스트 변환 요청
@api_bp.route('/stt', methods=['POST'])
def stt_endpoint():
    logger.info("[STT] 요청 받음")

    if 'file' not in request.files:
        logger.warning("[STT] No file in request")
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    if file.filename == '':
        logger.warning("[STT] No selected file")
        return jsonify({"error": "No selected file"}), 400

    try:
        with tempfile.NamedTemporaryFile(delete=False) as temp:
            temp.write(file.read())
            temp_path = temp.name

        file_path = convert_to_wav(temp_path)
        recognized_text = recognize_speech_from_file(file_path)
        os.remove(temp_path)  # 임시 파일 삭제

        logger.info(f"[STT] 변환 완료: {recognized_text}")
        return jsonify({"recognized_text": recognized_text})
    except Exception as e:
        logger.error(f"[STT] 변환 실패: {str(e)}")
        return jsonify({"error": str(e)}), 500

# 한 글자 STT
@api_bp.route('/stt/single', methods=['POST'])
def stt_single_endpoint():
    logger.info("[STT Single] 요청 받음")

    if "file" not in request.files:
        logger.warning("[STT Single] No file uploaded")
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        logger.warning("[STT Single] Empty file name")
        return jsonify({"error": "Empty file name"}), 400

    decoding_method = "modified_beam_search"
    num_active_paths = 15

    try:
        with tempfile.NamedTemporaryFile(delete=False) as temp:
            temp.write(file.read())
            temp_path = temp.name

        result = process_audio(decoding_method, num_active_paths, temp_path)
        os.remove(temp_path)

        recognized_text = "".join(re.findall(r"[가-힣]", result.get("text", "")))
        logger.info(f"[STT Single] 변환 완료: {recognized_text}")

        return jsonify({"recognized_text": recognized_text})
    except Exception as e:
        logger.error(f"[STT Single] 변환 실패: {str(e)}")
        return jsonify({"error": str(e)}), 500

# 한 글자 음성 텍스트 비교
@api_bp.route('/compare', methods=['POST'])
def compare():
    logger.info("[Compare] 요청 받음")

    if "file" not in request.files:
        logger.warning("[Compare] No file uploaded")
        return jsonify({"error": "No file uploaded"}), 400

    if "text" not in request.form:
        logger.warning("[Compare] No text provided")
        return jsonify({"error": "No text provided"}), 400

    file = request.files["file"]
    text = request.form["text"].strip()
    if file.filename == "":
        logger.warning("[Compare] Empty file name")
        return jsonify({"error": "Empty file name"}), 400

    decoding_method = "modified_beam_search"
    num_active_paths = 15

    try:
        with tempfile.NamedTemporaryFile(delete=False) as temp:
            temp.write(file.read())
            temp_path = temp.name

        result = process_audio(decoding_method, num_active_paths, temp_path)
        os.remove(temp_path)

        recognized_text = "".join(re.findall(r"[가-힣]", result.get("text", "")))
        clean_text = "".join(re.findall(r"[가-힣]", text))

        is_match = recognized_text == clean_text

        logger.info(f"[Compare] 비교 완료: {recognized_text} vs {clean_text} → {'✔ 일치' if is_match else '❌ 불일치'}")

        return jsonify({"recognized_text": recognized_text, "match": is_match})
    except Exception as e:
        logger.error(f"[Compare] 처리 실패: {str(e)}")
        return jsonify({"error": str(e)}), 500

@torch.no_grad()
def process_audio(decoding_method: str, num_active_paths: int, in_filename: str):
    """음성 파일을 처리하고 텍스트로 변환"""
    logger.info(f"[Process Audio] 파일 처리 시작: {in_filename}")

    filename = convert_to_wav(in_filename)
    start_time = time.time()

    recognizer = get_pretrained_model(
        repo_id="k2-fsa/sherpa-onnx-zipformer-korean-2024-06-24",
        decoding_method=decoding_method,
        num_active_paths=num_active_paths,
    )

    text = decode(recognizer, filename)

    end_time = time.time()
    metadata = torchaudio.info(filename)
    duration = metadata.num_frames / 16000
    processing_time = end_time - start_time

    logger.info(f"[Process Audio] 변환 완료 (RTF: {round(processing_time / duration, 3)})")

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
    logger.info(f"[Convert] {in_filename} → {out_filename} 변환 완료")
    return out_filename
