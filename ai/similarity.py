import Levenshtein
import numpy as np

# 비슷한 발음끼리 매핑 (한국어 기준)
IPA_SIMILARITY_MAP = {
    ('p', 'b'): 0.9, ('t', 'd'): 0.9, ('k', 'g'): 0.9,
    ('s', 'ʃ'): 0.9, ('z', 'ʒ'): 0.9, ('f', 'v'): 0.8,
    ('e', 'ɛ'): 0.9, ('o', 'ɔ'): 0.9, ('u', 'ʊ'): 0.8,
    ('i', 'ɪ'): 0.9, ('ʌ', 'ə'): 0.8, ('æ', 'a'): 0.9
}

def custom_phonetic_similarity(ipa1, ipa2):
    """ 두 IPA 기호의 발음 유사도를 반환 """
    if ipa1 == ipa2:
        return 1.0  # 완전 일치
    if (ipa1, ipa2) in IPA_SIMILARITY_MAP:
        return IPA_SIMILARITY_MAP[(ipa1, ipa2)]
    if (ipa2, ipa1) in IPA_SIMILARITY_MAP:
        return IPA_SIMILARITY_MAP[(ipa2, ipa1)]
    return 0.0  # 완전히 다르면 0점

def calculate_phonetic_similarity(recognized_ipa, correct_ipa):
    """ 동적 프로그래밍을 사용하여 두 발음의 유사도를 계산 (순서 유지, 교환 법칙 보장) """
    len_r = len(recognized_ipa)
    len_c = len(correct_ipa)

    # DP 테이블 초기화
    dp = np.zeros((len_r + 1, len_c + 1))

    for i in range(1, len_r + 1):
        for j in range(1, len_c + 1):
            match_score = custom_phonetic_similarity(recognized_ipa[i-1], correct_ipa[j-1])
            dp[i][j] = max(
                dp[i-1][j-1] + match_score,  # 일치 또는 유사한 문자 비교
                dp[i-1][j],  # recognized 문자 제거
                dp[i][j-1]   # correct 문자 제거
            )

    # 최대 유사도 점수 계산
    max_length = max(len_r, len_c)
    min_length = min(len_r, len_c)
    similarity_score = dp[len_r][len_c] / ((max_length+min_length)/2)

    return round(similarity_score, 2)

def calculate_similarities(recognized_ipa, correct_ipa):
    levenshtein_similarity = 1 - Levenshtein.distance(recognized_ipa, correct_ipa) / max(len(recognized_ipa), len(correct_ipa))
    jaro_winkler_similarity = Levenshtein.jaro_winkler(recognized_ipa, correct_ipa)
    custom_similarity = calculate_phonetic_similarity(recognized_ipa, correct_ipa)
    
    return {
        "levenshtein": round(levenshtein_similarity, 2),
        "jaro_winkler": round(jaro_winkler_similarity, 2),
        "custom_similarity": custom_similarity
    }
