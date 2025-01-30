package com.be.db.repository;

import com.be.db.entity.SessionUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessionUserRepository extends JpaRepository<SessionUser, Long> {
    List<SessionUser> findBySessionId(Long sessionId); // 특정 방의 참가자 조회
    List<SessionUser> findByUserId(Long userId); // 특정 사용자가 참가한 방 조회
    // 특정 사용자가 특정 세션에 참가한 정보 조회
    Optional<SessionUser> findByUserIdAndSessionId(Long userId, Long sessionId);
}