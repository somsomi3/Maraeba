package com.be.domain.session.service;

import com.be.db.entity.Session;
import com.be.db.entity.SessionUser;
import com.be.db.entity.User;
import com.be.db.repository.SessionRepository;
import com.be.db.repository.SessionUserRepository;
import com.be.db.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SessionService {
    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SessionUserRepository sessionUserRepository;

    // 🔹 방 목록 조회
    public List<Session> getAllSessions() {
        return sessionRepository.findAll();
    }

    // 🔹 방 생성
    public Session createRoom(String title, String roomPassword, Long hostId) {
        User host = userRepository.findById(hostId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Session session = new Session();
        session.setTitle(title);
        session.setRoomPassword(roomPassword);
        session.setHost(host);
        session.setStartedAt(LocalDateTime.now());
        session.setActive(true);

        return sessionRepository.save(session);
    }

    // 🔹 방 참가
    public String joinSession(Long userId, Long sessionId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        SessionUser sessionUser = new SessionUser();
        sessionUser.setUser(user);
        sessionUser.setSession(session);
        sessionUser.setJoinedAt(LocalDateTime.now());

        sessionUserRepository.save(sessionUser);
        return "User " + userId + " joined session " + sessionId;
    }

    // 🔹 방 나가기
    public String leaveSession(Long userId, Long sessionId) {
        Optional<SessionUser> sessionUser = sessionUserRepository.findByUserIdAndSessionId(userId, sessionId);
        if (sessionUser.isPresent()) {
            sessionUserRepository.delete(sessionUser.get());
            return "User " + userId + " left session " + sessionId;
        } else {
            throw new RuntimeException("User is not in this session");
        }
    }
}