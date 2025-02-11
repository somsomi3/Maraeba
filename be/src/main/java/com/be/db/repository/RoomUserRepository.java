package com.be.db.repository;

import com.be.db.entity.RoomUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomUserRepository extends JpaRepository<RoomUser, Long> {
    List<RoomUser> findByRoomId(Long roomId); // 특정 방의 참가자 조회
    List<RoomUser> findByUserId(Long userId); // 특정 사용자가 참가한 방 조회
    // 특정 사용자가 특정 세션에 참가한 정보 조회
    Optional<RoomUser> findByUserIdAndRoomId(Long userId, Long roomId);
    // 사용자 정보를 기반으로 방을 나가는 기능을 처리하는 메소드 추가
    void deleteByUserIdAndRoomId(Long userId, Long roomId);  // 특정 사용자와 방의 관계 삭제
}