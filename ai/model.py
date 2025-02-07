import os
from functools import lru_cache
from typing import Union
from huggingface_hub import hf_hub_download

os.system(
    "cp -v /usr/local/lib/python3.8/site-packages/k2/lib/*.so //usr/local/lib/python3.8/site-packages/sherpa/lib/"
)

os.system(
    "cp -v /home/user/.local/lib/python3.8/site-packages/k2/lib/*.so /home/user/.local/lib/python3.8/site-packages/sherpa/lib/"
)
import sherpa
import sherpa_onnx
import numpy as np
from typing import Tuple
import wave

def read_wave(wave_filename: str) -> Tuple[np.ndarray, int]:

    with wave.open(wave_filename) as f:
        assert f.getnchannels() == 1, f.getnchannels()
        assert f.getsampwidth() == 2, f.getsampwidth()  # it is in bytes
        num_samples = f.getnframes()
        samples = f.readframes(num_samples)
        samples_int16 = np.frombuffer(samples, dtype=np.int16)
        samples_float32 = samples_int16.astype(np.float32)

        samples_float32 = samples_float32 / 32768
        return samples_float32, f.getframerate()


def decode_offline_recognizer_sherpa_onnx(
    recognizer: sherpa_onnx.OfflineRecognizer,
    filename: str,
) -> str:
    s = recognizer.create_stream()
    samples, sample_rate = read_wave(filename)
    s.accept_waveform(sample_rate, samples)
    recognizer.decode_stream(s)

    return s.result.text

def decode(
    recognizer: Union[
        sherpa_onnx.OfflineRecognizer,
    ],
    filename: str,
) -> str:
        return decode_offline_recognizer_sherpa_onnx(recognizer, filename)

@lru_cache(maxsize=30)
def get_pretrained_model(
    repo_id: str,
    decoding_method: str,
    num_active_paths: int,
) -> Union[sherpa.OfflineRecognizer, sherpa.OnlineRecognizer]:
        return korean_models[repo_id](
            repo_id, decoding_method=decoding_method, num_active_paths=num_active_paths
        )

def _get_nn_model_filename(
    repo_id: str,
    filename: str,
    subfolder: str = "exp",
) -> str:
    nn_model_filename = hf_hub_download(
        repo_id=repo_id,
        filename=filename,
        subfolder=subfolder,
    )
    return nn_model_filename


def _get_token_filename(
    repo_id: str,
    filename: str = "tokens.txt",
    subfolder: str = "data/lang_char",
) -> str:
    token_filename = hf_hub_download(
        repo_id=repo_id,
        filename=filename,
        subfolder=subfolder,
    )
    return token_filename

@lru_cache(maxsize=10)
def _get_offline_pre_trained_model(
    repo_id: str, decoding_method: str, num_active_paths: int
) -> sherpa_onnx.OfflineRecognizer:
    assert repo_id in (
        "k2-fsa/sherpa-onnx-zipformer-korean-2024-06-24",
        "reazon-research/reazonspeech-k2-v2",
    ), repo_id

    encoder_model = _get_nn_model_filename(
        repo_id=repo_id,
        filename="encoder-epoch-99-avg-1.int8.onnx",
        subfolder=".",
    )

    decoder_model = _get_nn_model_filename(
        repo_id=repo_id,
        filename="decoder-epoch-99-avg-1.onnx",
        subfolder=".",
    )

    joiner_model = _get_nn_model_filename(
        repo_id=repo_id,
        filename="joiner-epoch-99-avg-1.onnx",
        subfolder=".",
    )

    tokens = _get_token_filename(repo_id=repo_id, subfolder=".")

    recognizer = sherpa_onnx.OfflineRecognizer.from_transducer(
        tokens=tokens,
        encoder=encoder_model,
        decoder=decoder_model,
        joiner=joiner_model,
        num_threads=2,
        sample_rate=16000,
        feature_dim=80,
        decoding_method=decoding_method,
    )

    return recognizer

korean_models = {
    "k2-fsa/sherpa-onnx-zipformer-korean-2024-06-24": _get_offline_pre_trained_model,
}
