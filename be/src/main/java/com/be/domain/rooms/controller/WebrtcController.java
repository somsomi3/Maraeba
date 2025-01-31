package com.be.domain.rooms.controller;

import com.be.domain.rooms.request.RtcanswerRequest;
import com.be.domain.rooms.request.RtciceCandidateRequest;
import com.be.domain.rooms.request.RtcofferRequest;
import com.be.domain.rooms.service.WebrtcService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/webrtc")
public class WebrtcController {
    @Autowired
    private WebrtcService webrtcService;

    @PostMapping("/offer/{room_id}")
    public String sendOffer(@PathVariable("room_id") Long roomId, @RequestBody RtcofferRequest request) {
        return webrtcService.sendOffer(roomId, request.getSdp());
    }

    @PostMapping("/answer/{room_id}")
    public String sendAnswer(@PathVariable("room_id") Long roomId, @RequestBody RtcanswerRequest request) {
        return webrtcService.sendAnswer(roomId, request.getSdp());
    }

    @PostMapping("/candidate/{room_id}")
    public String sendIceCandidate(@PathVariable("room_id") Long roomId, @RequestBody RtciceCandidateRequest request) {
        return webrtcService.sendIceCandidate(roomId, request.getCandidate());
    }
}