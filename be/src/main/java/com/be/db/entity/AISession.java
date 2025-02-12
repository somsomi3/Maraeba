package com.be.db.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ai_session")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AISession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "session_id", nullable = false)
    private String sessionId;
}
