package com.be.domain.session.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateSessionRequest {
    private String title;
    private String roomPassword;
    private Long hostId;
}