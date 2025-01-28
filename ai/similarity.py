import Levenshtein

def calculate_similarities(recognized_ipa, correct_ipa):
    levenshtein_similarity = 1 - Levenshtein.distance(recognized_ipa, correct_ipa) / max(len(recognized_ipa), len(correct_ipa))
    jaro_winkler_similarity = Levenshtein.jaro_winkler(recognized_ipa, correct_ipa)
    
    return {
        "levenshtein": round(levenshtein_similarity, 2),
        "jaro_winkler": round(jaro_winkler_similarity, 2)
    }
