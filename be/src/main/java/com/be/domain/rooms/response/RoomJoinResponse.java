package com.be.domain.rooms.response;

import com.be.common.model.response.BaseResponseBody;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RoomJoinResponse extends BaseResponseBody {
    private boolean isHost;  // 방장 여부

    private RoomJoinResponse(String message, Integer status, Boolean isHost) {
        super(message,status);
        this.isHost=isHost;
    }

    public static RoomJoinResponse of(Integer status, Boolean isHost) {
        String message;
        if(isHost) {
            message = "방장입니다.";
        } else {
            message = "참가자입니다.";
        }
        return new RoomJoinResponse(message,status,isHost);
    }
}