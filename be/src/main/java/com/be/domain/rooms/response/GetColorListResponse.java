package com.be.domain.rooms.response;

import com.be.common.model.response.BaseResponseBody;
import lombok.Getter;

import java.awt.*;
import java.util.Map;

@Getter
public class GetColorListResponse extends BaseResponseBody {
    private Map<String, Boolean> colorList;
    private GetColorListResponse(String message, Integer status, Map<String, Boolean> colorList) {
        super(message,status);
        this.colorList = colorList;
    }

    public static GetColorListResponse of(Map<String, Boolean> colorList) {
        return new GetColorListResponse("색상 생성 성공", 200, colorList);
    }
}
