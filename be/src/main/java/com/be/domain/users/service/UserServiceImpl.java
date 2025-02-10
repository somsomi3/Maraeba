package com.be.domain.users.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.be.common.exception.CustomException;
import com.be.common.exception.ErrorCode;
import com.be.db.entity.User;
import com.be.db.repository.UserRepository;
import com.be.domain.users.request.PasswordRequest;
import com.be.domain.users.request.PasswordUpdateRequest;
import com.be.domain.users.request.UserUpdateRequest;
import com.be.domain.users.response.GetCurrentUserResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	private User findUserById(long id) {
		log.info("id : {}", id);
		return userRepository.findById(id).orElseThrow(()-> new CustomException(ErrorCode.USER_NOT_FOUND));
	}

	@Override
	public GetCurrentUserResponse getCurrentUser(Long id) {
		return GetCurrentUserResponse.from(findUserById(id));
	}

	@Override
	public void updateUser(Long id, UserUpdateRequest request) {
		User user = findUserById(id);
		user.setEmail(request.getEmail());
		user.setUsername(request.getUsername());
		userRepository.save(user);
	}

	@Override
	public void updatePassword(Long id, PasswordUpdateRequest request) {
		User user = findUserById(id);
		if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
			throw new CustomException(ErrorCode.PASSWORD_MISMATCH);
		}
		user.setPassword(passwordEncoder.encode(request.getNewPassword()));
		userRepository.save(user);
	}

	@Override
	@Transactional
	public void deleteUser(Long id, PasswordRequest request) {
		User user = findUserById(id);
		if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			throw new CustomException(ErrorCode.PASSWORD_MISMATCH);
		}
		userRepository.delete(user);
		userRepository.flush();
	}
}
