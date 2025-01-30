package com.be.domain.prons.response;

import com.be.common.model.response.BaseResponseBody;
import com.be.domain.prons.dto.PronunciationSessionDTO;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;

@Getter
@Setter
public class GetSessionRes extends BaseResponseBody {

    private PronunciationSessionDTO session;

    public GetSessionRes(String message, HttpStatus statusCode, PronunciationSessionDTO session) {
        super(message, statusCode);
        this.session = session;
    }
}
