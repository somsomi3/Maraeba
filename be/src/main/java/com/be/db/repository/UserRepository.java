package com.be.db.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.be.db.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
}
