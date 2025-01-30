package com.be.domain.wgames.findAnimals.request;


import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
public class AnimalCorrectRequest {
    private MultipartFile audio;
    private int imageNumber;
    private List<String> answerList;
}
