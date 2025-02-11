import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise ValueError("API 키가 설정되지 않았습니다. .env 파일을 확인하세요.")

# OpenAI API 키 설정
client = OpenAI(api_key=api_key)

def generate_feedback(user_text, correct_text):
    prompt = f"""
    사용자가 '{user_text}'라고 말했어요.
    올바른 발음은 '{correct_text}'예요.
    
    어린이가 쉽게 이해할 수 있도록, 입술과 혀를 어떻게 하면 좋을지 한 문장으로 알려주세요.
    
    예시:
    - "입을 조금 더 크게 벌리고 '아' 소리를 또렷하게 내 보세요!"
    - "혀끝을 윗니 뒤쪽에 살짝 대고 'ㄴ' 소리를 내보세요!"
    
    이제 '{correct_text}' 발음을 더 정확하게 할 수 있도록 한 문장으로 알려주세요.
    """
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": "너는 친절한 발음 선생님이야. 어린이에게 발음을 쉽게 알려줘."},
                  {"role": "user", "content": prompt}]
    )
    
    return response.choices[0].message.content.strip('"')