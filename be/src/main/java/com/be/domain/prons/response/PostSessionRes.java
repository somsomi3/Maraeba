package com.be.domain.prons.response;

import com.be.common.model.response.BaseResponseBody;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;

@Getter
@Setter
public class PostSessionRes extends BaseResponseBody {

    private String sessionId;

    public PostSessionRes(String message, HttpStatus statusCode, String sessionId) {
        super(message, statusCode);
        this.sessionId = sessionId;
    }
}
