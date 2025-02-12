package com.be.domain.chatbot.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StartRequest {
    private boolean isDefault;
    private Integer defaultId;
    private String aiRole;
    private String userRole;
    private String situation;
}
