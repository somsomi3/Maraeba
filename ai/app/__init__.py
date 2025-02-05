from flask import Flask
from flask_cors import CORS
import torch
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor

# Wav2Vec2 모델 로드
MODEL_NAME = "jonatasgrosman/wav2vec2-large-xlsr-53-english"
processor = Wav2Vec2Processor.from_pretrained(MODEL_NAME)
model = Wav2Vec2ForCTC.from_pretrained(MODEL_NAME).to("cuda" if torch.cuda.is_available() else "cpu")

def create_app():
    app = Flask(__name__)
    CORS(app)

    # 라우트 등록
    from app.routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/ai')

    return app