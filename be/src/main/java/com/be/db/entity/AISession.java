package com.be.db.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ai_session")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AISession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "session_id", nullable = false)
    private String sessionId;
}
