package com.be.db.repository;

import com.be.db.entity.User;
import com.be.db.entity.WebrtcMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WebrtcMessageRepository extends JpaRepository<WebrtcMessage, Long> {

    // 특정 sender의 메시지 목록을 조회하는 메서드
    List<WebrtcMessage> findBySender(User sender);

    // 특정 방(roomId)과 사용자(userId)의 메시지 조회
    List<WebrtcMessage> findByRoomIdAndUserId(Long roomId, Long userId);

    // 특정 방(roomId)의 모든 메시지 조회
    List<WebrtcMessage> findByRoomId(Long roomId);
}
