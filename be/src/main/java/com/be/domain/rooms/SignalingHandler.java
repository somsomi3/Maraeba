package com.be.domain.rooms;

import com.be.domain.rooms.request.RoomRemoveRequest;
import com.be.domain.rooms.request.UserLeaveRequest;
import com.be.domain.rooms.service.RoomService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@EnableScheduling
@RequiredArgsConstructor
public class SignalingHandler extends TextWebSocketHandler {

	private final RoomService roomService;
	private final ObjectMapper objectMapper = new ObjectMapper();

	// 방정보
	private final Map<String, Set<WebSocketSession>> rooms = new ConcurrentHashMap<>();
	private final Map<String, String> sessionIdToRoomId = new ConcurrentHashMap<>();
	private final Map<String, String> sessionIdToUserId = new ConcurrentHashMap<>();
	private final Set<String> alreadyLeftSessions = ConcurrentHashMap.newKeySet();

	// "마지막 ping" 시간을 저장
	private final Map<String, Long> lastPingTimeMap = new ConcurrentHashMap<>();
	private final Map<String, WebSocketSession> sessionMap = new ConcurrentHashMap<>();
	// username을 저장할 맵 추가
	private final Map<String, String> sessionIdToUsername = new ConcurrentHashMap<>();

	@Override
	public void afterConnectionEstablished(WebSocketSession session) {
		// 소켓 맵에 저장
		sessionMap.put(session.getId(), session);
		// 새 연결이 맺어지면, 초깃값을 넣어줌(지금 시각)
		lastPingTimeMap.put(session.getId(), System.currentTimeMillis());
		log.info("✅ WebRTC WebSocket 연결됨: {}", session.getId());
	}

	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
		JsonNode jsonMessage = objectMapper.readTree(message.getPayload());

		String type = jsonMessage.has("type") ? jsonMessage.get("type").asText() : "unknown";
		String roomId = jsonMessage.has("room_id") ? jsonMessage.get("room_id").asText() : null;
		String userId = jsonMessage.has("user_id") ? jsonMessage.get("user_id").asText() : null;
		String username = jsonMessage.has("username") ? jsonMessage.get("username").asText() : "";

		log.info("📩 받은 메시지: {}", message.getPayload());

		// ping 메시지는 단순 연결 유지 용도로 보통 무시
		if ("ping".equals(type)) {
			log.info("📡 Ping 메시지 수신 - 사용자: {}", session.getId());
			lastPingTimeMap.put(session.getId(), System.currentTimeMillis());
			// (선택) "pong"을 보낼 수도 있음
			session.sendMessage(new TextMessage("{\"type\":\"pong\"}"));
			return;
		}

		// room_id나 user_id가 없으면 처리 불가
		if (roomId == null || userId == null) {
			log.warn("⚠️ room_id 또는 user_id 누락으로 메시지 처리 불가");
			return;
		}

		switch (type) {
			case "join":
				joinRoom(session, roomId, userId);
				// 세션-유저 매핑
				sessionIdToRoomId.put(session.getId(), roomId);
				sessionIdToUserId.put(session.getId(), userId);
				sessionIdToUsername.put(session.getId(), username);

				// 새 사용자를 위한 roomInfo 메시지 작성
				Set<WebSocketSession> sessions = rooms.get(roomId);
				List<Map<String, String>> participants = new ArrayList<>();
				for (WebSocketSession s : sessions) {
					if (!s.getId().equals(session.getId())) {
						String otherUserId = sessionIdToUserId.get(s.getId());
						String otherUsername = sessionIdToUsername.get(s.getId());
						participants.add(Map.of("user_id", otherUserId, "username", otherUsername));
					}
				}
				Map<String, Object> roomInfo = Map.of(
					"type", "roomInfo",
					"participants", participants
				);
				session.sendMessage(new TextMessage(objectMapper.writeValueAsString(roomInfo)));

				TextMessage newJoinMessage = new TextMessage(objectMapper.writeValueAsString(
					Map.of("type", "userJoined", "user_id", userId, "username", username)
				));
				broadcast(roomId, newJoinMessage, session);
				break;

			case "leave":
				leaveRoom(session, roomId, userId);
				// 중복 차감 방지용
				alreadyLeftSessions.add(session.getId());
				// DB에서도 해당 User를 방에서 나가게 처리
				roomService.leaveRoom(
					UserLeaveRequest.of(Long.valueOf(userId), roomId)
				);
				break;

			// 채팅, offer/answer, candidate 등은 방 전체 브로드캐스트
			case "chat":
			case "offer":
			case "items":
			case "answer":
			case "choice":
			case "cameraOff":
			case "candidate":
			case "answerChoice":
				broadcast(roomId, message, session);
				break;

			default:
				log.warn("⚠️ 알 수 없는 메시지 타입: {}", type);
		}
	}

	/**
	 * 방 참여 처리
	 */
	private void joinRoom(WebSocketSession session, String roomId, String userId) {
		rooms.computeIfAbsent(roomId, k -> Collections.newSetFromMap(new ConcurrentHashMap<>()));
		rooms.get(roomId).add(session);
		log.info("👥 사용자 {} 방 {} 소켓 등록", userId, roomId);
	}

	/**
	 * 방 떠나기 처리
	 */
	private void leaveRoom(WebSocketSession session, String roomId, String userId) {
		if (rooms.containsKey(roomId)) {
			Set<WebSocketSession> sessions = rooms.get(roomId);
			sessions.remove(session);
			log.info("🚪 사용자 {} 방 {} 소켓 해제", userId, roomId);

			// 방에 남은 사람이 없으면 제거 + DB에서도 삭제
			if (sessions.isEmpty()) {
				rooms.remove(roomId);
				roomService.removeRoom(RoomRemoveRequest.of(roomId));
			}
		}
	}

	/**
	 * 방 내 모든 사용자에게 메시지 전송
	 */
	private void broadcast(String roomId, TextMessage message, WebSocketSession senderSession) throws Exception {
		if (!rooms.containsKey(roomId)) {
			log.warn("⚠️ 방 {} 존재하지 않음", roomId);
			return;
		}

		log.info("📢 방 {} 에 속한 사용자들에게 메시지 전송", roomId);
		for (WebSocketSession session : rooms.get(roomId)) {
			// 본인에게는 보내지 않음(필요 시 조정 가능)
			if (session.isOpen() && !session.getId().equals(senderSession.getId())) {
				session.sendMessage(message);
				log.debug("   → 메시지 전송 대상: {}", session.getId());
			}
		}
	}

	// 일정 간격으로 lastPingTimeMap 확인
	@Scheduled(fixedRate = 30000) // 30초마다 실행
	public void checkInactiveSessions() {
		log.info("Ping 검사");
		long now = System.currentTimeMillis();
		for (Map.Entry<String, Long> entry : lastPingTimeMap.entrySet()) {
			String sessionId = entry.getKey();
			long lastPing = entry.getValue();
			// 예: 1분(60초) 이상 ping이 없으면 종료
			if (now - lastPing > 60000) {
				// 세션 가져오기
				WebSocketSession session = sessionMap.get(sessionId);
				if (session != null && session.isOpen()) {
					log.warn("핑 타임아웃 - 세션 {} 닫기", sessionId);
					try {
						session.close();
					} catch (IOException e) {
						log.error("세션 닫기 실패", e);
					}
				}
			}
		}
	}

	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
		String sessionId = session.getId();
		String roomId = sessionIdToRoomId.get(sessionId);
		String userId = sessionIdToUserId.get(sessionId);

		// 연결 종료 시 map에서 제거
		sessionMap.remove(session.getId());
		lastPingTimeMap.remove(sessionId);

		// rooms 맵에서만 제거
		if (roomId != null && rooms.containsKey(roomId)) {
			rooms.get(roomId).remove(session);
		}

		// 이미 leave 메시지가 처리되었는지 확인
		if (!alreadyLeftSessions.contains(sessionId)) {
			// (가드) userId나 roomId가 null이면 leaveRoom은 스킵
			if (userId == null || roomId == null) {
				log.warn("afterConnectionClosed: userId 또는 roomId가 null이므로 leaveRoom 스킵 (sessionId={})", sessionId);
			} else {
				// 정상이면 여기서 DB leaveRoom
				roomService.leaveRoom(UserLeaveRequest.of(Long.valueOf(userId), roomId));
			}
		}

		// 매핑 제거
		sessionIdToRoomId.remove(sessionId);
		sessionIdToUserId.remove(sessionId);
		alreadyLeftSessions.remove(sessionId); // 혹시 몰라서 한 번 더 cleanup
		sessionIdToUsername.remove(sessionId);

		// 연결 끊길 때 세션이 속한 모든 방에서 제거
		rooms.values().forEach(sessions -> sessions.remove(session));
		log.info("🔴 WebRTC WebSocket 연결 종료: {}", session.getId());
	}
}
