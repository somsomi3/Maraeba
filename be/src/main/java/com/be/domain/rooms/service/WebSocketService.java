//package com.be.domain.rooms.service;
//
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.stereotype.Service;
//import org.springframework.web.socket.TextMessage;
//import org.springframework.web.socket.WebSocketSession;
//
//import java.io.IOException;
//import java.util.Set;
//import java.util.concurrent.ConcurrentHashMap;
//
//@Slf4j
//@Service
//@RequiredArgsConstructor
//public class WebSocketService {
//    private final ConcurrentHashMap<String, Set<WebSocketSession>> rooms = new ConcurrentHashMap<>();
//
//    public void addSessionToRoom(String roomId, WebSocketSession session) {
//        rooms.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(session);
//    }
//
//    public void removeSessionFromRoom(String roomId, WebSocketSession session) {
//        rooms.computeIfPresent(roomId, (key, sessions) -> {
//            sessions.remove(session);
//            return sessions.isEmpty() ? null : sessions;
//        });
//    }
//
//    public void broadcastRoomEvent(Long roomId, String eventType, Long userId) {
//        log.info("📌 broadcastRoomEvent 호출 - roomId: {}, eventType: {}, userId: {}", roomId, eventType, userId);
//
//        Set<WebSocketSession> sessions = rooms.get(roomId.toString());
//
//        if (sessions == null) {
//            log.warn("❌ 방 {}에 참가한 유저가 없습니다. 메시지 전송 불가", roomId);
//            log.info("📝 현재 rooms 목록: {}", rooms.keySet());  // 현재 등록된 방 목록 확인
//            return;
//        }
//
//        String message = String.format("{\"type\": \"%s\", \"roomId\": \"%s\", \"userId\": %s}", eventType, roomId, userId);
//        log.info("📡 메시지 전송: {}", message);
//
//        for (WebSocketSession session : sessions) {
//            try {
//                session.sendMessage(new TextMessage(message));
//            } catch (IOException e) {
//                log.error("❌ 메시지 전송 실패 - 사용자 ID: {}, 오류: {}", userId, e.getMessage());
//            }
//        }
//    }
//    }
