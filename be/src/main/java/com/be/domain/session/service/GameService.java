package com.be.domain.session.service;

import com.be.db.entity.Session;
import com.be.db.repository.SessionRepository;
import com.be.domain.session.response.GameResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class GameService {
    @Autowired
    private SessionRepository sessionRepository;

    // 🔹 게임 시작
    public String startGame(Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        session.setActive(true);
        sessionRepository.save(session);
        return "Game started in session " + sessionId;
    }

    // 🔹 보기 선택
    public String chooseOption(Long userId, Long sessionId, String choice) {
        // 선택을 저장하는 로직 추가
        return "User " + userId + " chose " + choice + " in session " + sessionId;
    }

    // 🔹 정답 조회
    public GameResult getGameResult(Long sessionId) {
        GameResult result = new GameResult();
        result.setSessionId(sessionId);
        result.setCorrectAnswer("정답");  // 정답 로직 필요
        result.setUserCorrect(true);  // 사용자의 선택이 정답인지 확인하는 로직 필요
        return result;
    }
}