package com.be.domain.wgames.request;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class AnswerCorrectRequest {
    private MultipartFile audio;
    private String foodName;
    private String item1;
    private String item2;
}
