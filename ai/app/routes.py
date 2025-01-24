from flask import Blueprint, jsonify

api_bp = Blueprint('api', __name__)

@api_bp.route('/', methods=['GET'])
def hello_api():
    return jsonify({"message": "Hello!"})
