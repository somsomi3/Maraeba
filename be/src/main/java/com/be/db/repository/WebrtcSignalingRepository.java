package com.be.db.repository;

import com.be.db.entity.WebrtcSignaling;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

//WebRTC Signaling 데이터 저장 (필수는 아니지만, 디버깅 및 연결 유지용으로 유용)
public interface WebrtcSignalingRepository extends JpaRepository<WebrtcSignaling, Long> {
    List<WebrtcSignaling> findByRoomId(Long roomId); // 특정 방의 WebRTC 메시지 조회
}
