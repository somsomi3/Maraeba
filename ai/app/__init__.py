from flask import Flask
from flask_cors import CORS
from model import get_pretrained_model
import logging
from logger import logger

def create_app():
    app = Flask(__name__)
    
    # CORS 설정: 특정 Origin만 허용 (ex. http://localhost:5173)
    CORS(app, resources={r"/*": {
        "origins": ["http://localhost:5173"],  # 프론트엔드 주소 명확히 지정
        "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],  # 필요한 헤더 명시
        "supports_credentials": True  # 쿠키, 인증 정보 포함 허용
    }})

    # 라우트 등록
    from app.routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/ai')

    # 모델 로딩 시작 로그
    logger.info("Loading pre-trained STT model...")

    try:
        get_pretrained_model(
            repo_id="k2-fsa/sherpa-onnx-zipformer-korean-2024-06-24",
            decoding_method="modified_beam_search",
            num_active_paths=15,
        )
        # 모델 로딩 완료 로그
        logger.info("Pre-trained STT model loaded successfully!")
    except Exception as e:
        logger.error(f"Error loading STT model: {str(e)}")

    return app