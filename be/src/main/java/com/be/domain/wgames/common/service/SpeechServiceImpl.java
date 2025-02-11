package com.be.domain.wgames.common.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;

@Slf4j
@Service
public class SpeechServiceImpl implements SpeechService{

    private final String url;

    public SpeechServiceImpl(@Value("${url.ai}") String url) {
        this.url = url;
    }

    @Override
    public String SpeechToText(MultipartFile file) throws IOException {
        WebClient webClient = WebClient.builder().baseUrl(url).build();

        return webClient.post()
                .uri("/ai/stt")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("file",new ByteArrayResource(file.getBytes()) {
                    @Override
                    public String getFilename() {
                        return file.getOriginalFilename();  // 원본 파일명 유지
                    }
                }))
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }
}
