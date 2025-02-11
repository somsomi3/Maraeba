package com.be.domain.chatbot.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StartRequest {
    @JsonProperty("is_default")
    private boolean isDefault;

    @JsonProperty("default_id")
    private Integer defaultId;

    @JsonProperty("ai_role")
    private String aiRole;

    @JsonProperty("user_role")
    private String userRole;

    @JsonProperty("situation")
    private String situation;
}
