package com.be.domain.session.controller;
import com.be.db.entity.Session;
import com.be.db.entity.User;
import com.be.db.repository.SessionRepository;
import com.be.db.repository.UserRepository;
import com.be.domain.session.request.CreateSessionRequest;
import com.be.domain.session.request.UserJoinRequest;
import com.be.domain.session.service.SessionService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@RestController
@RequestMapping("/sessions")
public class SessionController {
    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SessionService sessionService;

    // 방 생성 API
    @PostMapping("/create")
    public Session createRoom(@RequestBody CreateSessionRequest request) {
        User host = userRepository.findById(request.getHostId()).orElseThrow(() -> new RuntimeException("User not found"));

        Session session = new Session();
        session.setTitle(request.getTitle());
        session.setStartedAt(LocalDateTime.now());
        session.setActive(true);
        session.setRoomPassword(request.getRoomPassword());
        session.setHost(host);

        return sessionRepository.save(session);
    }
    // 방 목록 조회 API
    @GetMapping("/list")
    public List<Session> getAllSessions() {
        return sessionRepository.findAll();
    }
    @PostMapping("/join/{session_id}")
    public String joinSession(@PathVariable("session_id") Long sessionId, @RequestBody UserJoinRequest request) {
        return sessionService.joinSession(request.getUserId(), sessionId);
    }

    @PostMapping("/end/{session_id}")
    public String leaveSession(@PathVariable("session_id") Long sessionId, @RequestBody UserJoinRequest request) {
        return sessionService.leaveSession(request.getUserId(), sessionId);
    }
    // 방 생성 요청을 처리할 DTO

}
