package com.be.db.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
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

    @Column(name = "room_password")
    private String roomPassword;

    // owner_id를 User의 기본키와 연결
    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User host;

    // 세션에 저장된 메시지들 (OneToMany)
    @OneToMany(mappedBy = "room")
    private List<WebsocketMessage> messages = new ArrayList<>();


}
