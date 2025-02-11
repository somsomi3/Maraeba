package com.be.domain.wgames.common.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

public interface SpeechService {
    String SpeechToText(MultipartFile audio) throws IOException;
}
