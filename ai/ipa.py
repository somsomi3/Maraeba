from src.worker import convert


def word_to_ipa(word: str = None) -> None:
    if word is None:
        while True:
            usr_input = input("Enter the 한글 to convert (q to quit): ").lower()
            if usr_input.lower() == 'q':
                break
            res = convert(usr_input, sep='.')
            print(res)
    else:
        return convert(word, sep='.')
