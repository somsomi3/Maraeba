import logging

def setup_logger():
    """Gunicorn 로그를 가져와서 Flask 전역 로거로 설정"""
    gunicorn_logger = logging.getLogger('gunicorn.error')

    # Flask 기본 로거에 Gunicorn 핸들러 추가
    logger = logging.getLogger()  # 루트 로거 가져오기
    logger.handlers = gunicorn_logger.handlers  # Gunicorn 핸들러 사용
    logger.setLevel(gunicorn_logger.level)  # Gunicorn 로그 레벨 적용

    return logger

# 전역 로거 설정
logger = setup_logger()
