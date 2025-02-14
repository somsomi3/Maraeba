package com.be.domain.users.service;

import com.be.domain.users.dto.UserTutorialDTO;
import com.be.domain.users.request.PasswordRequest;
import com.be.domain.users.request.PasswordUpdateRequest;
import com.be.domain.users.request.UserUpdateRequest;
import com.be.domain.users.response.GetCurrentUserResponse;

public interface UserService {
	//사용자 정보 조회
	GetCurrentUserResponse getCurrentUser(Long id);

	//사용자 정보 수정
	void updateUser(Long id, UserUpdateRequest request);

	//사용자 비밀번호 변경
	void updatePassword(Long id, PasswordUpdateRequest request);

	//회원 탈퇴
	void deleteUser(Long id, PasswordRequest request);

	// 사용자 튜토리얼 시행 여부 가져오기
	UserTutorialDTO getTutorial(Long id);
}
