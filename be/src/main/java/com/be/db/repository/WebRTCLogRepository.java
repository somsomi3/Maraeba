package com.be.db.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.be.db.entity.WebRTCLog;

@Repository
public interface WebRTCLogRepository extends JpaRepository<WebRTCLog, Long> {
	List<WebRTCLog> findByUserId(Long userId);
	List<WebRTCLog> findByCallId(String callId);
}