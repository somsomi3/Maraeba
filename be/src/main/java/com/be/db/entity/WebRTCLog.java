package com.be.db.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Table(name = "webrtc_log") // ✅ 테이블 이름을 명확히 지정
public class WebRTCLog extends BaseEntity {
	//BaseEntity에서 상속받은 그냥Id(고유번호), 생성시간, 수정시간)
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", referencedColumnName = "id", unique = true)
	@OnDelete(action = OnDeleteAction.CASCADE)
	private User user;

	@ManyToOne
	@JoinColumn(name = "room_id")
	@OnDelete(action = OnDeleteAction.CASCADE)
	private Room room;

	private LocalDateTime startTime;
	private LocalDateTime endTime;

}
