package com.be.db.repository;

import com.be.db.entity.WebsocketMessage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WebsocketMessageRepository extends JpaRepository<WebsocketMessage, Long> {
}
