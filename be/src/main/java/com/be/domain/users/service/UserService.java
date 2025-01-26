package com.be.domain.users.service;

import com.be.db.entity.User;
import com.be.domain.users.request.PasswordRequest;
import com.be.domain.users.request.PasswordUpdateRequest;
import com.be.domain.users.request.UserUpdateRequest;

public interface UserService {
	//사용자 정보 조회
	User getCurrentUser(Long id);

	//사용자 정보 수정
	void updateUser(Long id, UserUpdateRequest request);

	//사용자 비밀번호 변경
	void updatePassword(Long id, PasswordUpdateRequest request);

	//회원 탈퇴
	void deleteUser(Long id, PasswordRequest request);
}
