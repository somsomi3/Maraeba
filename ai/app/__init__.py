from flask import Flask

def create_app():
    app = Flask(__name__)

    # 라우트 등록
    from app.routes import api_bp
    app.register_blueprint(api_bp)

    return app
