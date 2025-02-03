from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app, origins=["*"], methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

    # 라우트 등록
    from app.routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/ai')

    return app