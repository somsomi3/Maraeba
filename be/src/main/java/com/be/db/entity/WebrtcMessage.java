package com.be.db.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "webrtc_message")
public class WebrtcMessage extends BaseEntity {

    // 메시지를 받는 사용자 (나 자신)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    // 해당 메시지가 속한 방
    @ManyToOne
    @JoinColumn(name = "room_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Room room;

    // 메시지 내용
    @Column(nullable = false, length = 100)
    private String message;

    // 메시지 보낸 시간
    private LocalDateTime sentAt;


//    // 메시지를 보낸 상대방 (sender_id로 구분)
//    @ManyToOne
//    @JoinColumn(name = "sender_id", referencedColumnName = "id")  // `sender_id` 컬럼 추가
//    @OnDelete(action = OnDeleteAction.CASCADE)
//    private User sender;  // 메시지를 보낸 사용자 (상대방)
}
