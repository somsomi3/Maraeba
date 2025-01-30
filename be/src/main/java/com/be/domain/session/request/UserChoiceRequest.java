package com.be.domain.session.request;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserChoiceRequest {
    private Long userId;
    private String choice;
}