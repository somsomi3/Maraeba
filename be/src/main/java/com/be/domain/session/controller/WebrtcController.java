package com.be.domain.session.controller;

import com.be.domain.session.request.RtcanswerRequest;
import com.be.domain.session.request.RtciceCandidateRequest;
import com.be.domain.session.request.RtcofferRequest;
import com.be.domain.session.service.WebrtcService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/webrtc")
public class WebrtcController {
    @Autowired
    private WebrtcService webrtcService;

    @PostMapping("/offer/{session_id}")
    public String sendOffer(@PathVariable("session_id") Long sessionId, @RequestBody RtcofferRequest request) {
        return webrtcService.sendOffer(sessionId, request.getSdp());
    }

    @PostMapping("/answer/{session_id}")
    public String sendAnswer(@PathVariable("session_id") Long sessionId, @RequestBody RtcanswerRequest request) {
        return webrtcService.sendAnswer(sessionId, request.getSdp());
    }

    @PostMapping("/candidate/{session_id}")
    public String sendIceCandidate(@PathVariable("session_id") Long sessionId, @RequestBody RtciceCandidateRequest request) {
        return webrtcService.sendIceCandidate(sessionId, request.getCandidate());
    }
}