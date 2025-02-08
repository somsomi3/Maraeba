from flask import Flask
from flask_cors import CORS
from model import get_pretrained_model
import logging

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]}})

    # 라우트 등록
    from app.routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/ai')

    # ✅ 모델 로딩 시작 로그
    logging.info("Loading pre-trained STT model...")

    try:
        get_pretrained_model(
            repo_id="k2-fsa/sherpa-onnx-zipformer-korean-2024-06-24",
            decoding_method="modified_beam_search",
            num_active_paths=15,
        )
        # ✅ 모델 로딩 완료 로그
        logging.info("Pre-trained STT model loaded successfully!")
    except Exception as e:
        logging.error(f"Error loading STT model: {str(e)}")

    return app