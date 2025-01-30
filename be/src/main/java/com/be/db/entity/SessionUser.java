package com.be.db.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class SessionUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // user_id 외래키 매핑
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false) // id2 → user_id
    private User user;

    // session_id 외래키 매핑
    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false) // id3 → session_id
    private Session session;

    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt;
}
