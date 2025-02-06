package com.be.db.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String title;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "room_password", nullable = true)
    private String roomPassword;

    // owner_id를 User의 기본키와 연결
    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    @JsonIgnore  // ✅ JSON 직렬화 시 host 필드를 무시하여 순환 참조 방지
    private User host;

    // 세션에 저장된 메시지들 (OneToMany)
    @OneToMany(mappedBy = "room")
    @JsonIgnore // ✅ messages 필드를 직렬화(응답)에서 제외하여 Lazy Loading 문제 방지
    private List<WebsocketMessage> messages = new ArrayList<>();

    // ✅ 생성자 추가
    public Room(String title, String roomPassword, User host) {
        this.title = title;
        this.roomPassword = roomPassword;
        this.host = host;
        this.startedAt = LocalDateTime.now();
        this.isActive = true;
    }
}
