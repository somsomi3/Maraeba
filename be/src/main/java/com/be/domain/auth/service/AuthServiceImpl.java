package com.be.domain.auth.service;

import java.time.ZoneId;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.be.common.auth.TokenExtractorService;
import com.be.common.auth.TokenService;
import com.be.common.auth.TokenType;
import com.be.common.exception.PasswordMismatchException;
import com.be.common.exception.UserNotFoundException;
import com.be.db.entity.RefreshToken;
import com.be.db.entity.User;
import com.be.db.repository.RefreshTokenRepository;
import com.be.db.repository.UserRepository;
import com.be.domain.auth.request.LoginRequest;
import com.be.domain.auth.request.LogoutRequest;
import com.be.domain.auth.request.RegisterRequest;
import com.be.domain.auth.request.TokenRefreshRequest;
import com.be.domain.auth.response.CheckEmailResponse;
import com.be.domain.auth.response.CheckUserIdResponse;
import com.be.domain.auth.response.LoginResponse;
import com.be.domain.auth.response.TokenRefreshResponse;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

	private final UserRepository userRepository;
	private final RefreshTokenRepository refreshTokenRepository;
	private final PasswordEncoder passwordEncoder;
	private final TokenService tokenService;
	private final TokenExtractorService tokenExtractorService;

	/**
	 * 회원가입
	 */
	@Transactional
	@Override
	public void register(RegisterRequest request) {
		//비밀번호 암호화 후 저장
		User user = new User();
		user.setUserId(request.getUserId());
		user.setPassword(passwordEncoder.encode(request.getPassword()));
		user.setEmail(request.getEmail());
		user.setUsername(request.getUsername());
		user.setProvider("LOCAL");
		user.setProviderId(null);
		userRepository.save(user);
	}

	/**
	 * 아이디 중복 검사
	 */
	@Override
	public CheckUserIdResponse checkUserId(String userId) {
		boolean exists = userRepository.findByUserId(userId).isPresent();
		if(exists) {
			return CheckUserIdResponse.of("User Id already exists.",200, userId, true);
		} else {
			return CheckUserIdResponse.of("User Id not exists.",200, userId, false);
		}
	}

	/**
	 * 이메일 중복 검사
	 */
	@Override
	public CheckEmailResponse checkEmail(String email) {
		boolean exists = userRepository.findByEmail(email).isPresent();
		if(exists) {
			return CheckEmailResponse.of("Email already exists.",200, email, true);
		} else {
			return CheckEmailResponse.of("Email not exists.",200, email, false);
		}
	}

	/**
	 * 로그인 (Access Token, Refresh Token 발급)
	 */
	@Transactional
	@Override
	public LoginResponse login(LoginRequest request) {
		//user_id로 유저 조회
		User user = userRepository.findByUserId(request.getUserId())
			.orElseThrow(()-> new UserNotFoundException("User ID not exists."));
		//비밀번호 검증
		if(!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			throw new PasswordMismatchException();
		}

		//이미 refresh_token 값이 있다면 지움
		refreshTokenRepository.findByUserId(user.getId()).ifPresent(refreshTokenRepository::delete);

		//accessToken 및 refreshToken 발급
		String accessToken = tokenService.generateToken(user.getId(), TokenType.ACCESS_TOKEN);
		TokenService.TokenWithExpiration refreshTokenWithExpiration = tokenService.generateTokenWithExpiration(user.getId(), TokenType.REFRESH_TOKEN);

		//refreshToken DB 저장
		RefreshToken newRefreshToken = new RefreshToken();
		newRefreshToken.setUser(user);
		newRefreshToken.setToken(refreshTokenWithExpiration.getToken());
		newRefreshToken.setExpiryDate(refreshTokenWithExpiration.getExpiration().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());
		refreshTokenRepository.save(newRefreshToken);

		return LoginResponse.of(accessToken, refreshTokenWithExpiration.getToken());
	}

	/**
	 * Access Token 및 Refresh Token 재발급
	 */
	@Transactional
	@Override
	public TokenRefreshResponse tokenRefresh(TokenRefreshRequest request) {
		//refreshToken 으로 user 고유번호 추출
		long id = tokenService.extractUserIdFromToken(request.getRefreshToken());

		//DB에 refreshToken이 있는지 확인
		RefreshToken refreshToken = refreshTokenRepository.findByUserId(id)
			.orElseThrow(()->new IllegalArgumentException("Refresh token not found."));

		//DB의 refreshToken과 비교
		if(!request.getRefreshToken().equals(refreshToken.getToken())) {
			throw new IllegalArgumentException("Refresh token does not match.");
		}

		//받은 refreshToken이 만료된 것인지 확인
		if(!tokenService.validateToken(request.getRefreshToken())) {
			refreshTokenRepository.delete(refreshToken);
			throw new IllegalArgumentException("Refresh token expired.");
		}

		//기존의 refreshToken 제거
		refreshTokenRepository.delete(refreshToken);

		//새로운 token 생성
		String newAccessToken = tokenService.generateToken(id, TokenType.ACCESS_TOKEN);
		TokenService.TokenWithExpiration newRefreshTokenWithExpiration = tokenService.generateTokenWithExpiration(id, TokenType.REFRESH_TOKEN);

		//새로운 refreshToken 저장
		RefreshToken newRefreshToken = new RefreshToken();
		newRefreshToken.setUser(refreshToken.getUser());
		newRefreshToken.setToken(newRefreshTokenWithExpiration.getToken());
		newRefreshToken.setExpiryDate(newRefreshTokenWithExpiration.getExpiration().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());
		refreshTokenRepository.save(newRefreshToken);

		return TokenRefreshResponse.of(newAccessToken, newRefreshToken.getToken());
	}

	/**
	 * 로그아웃 처리 (블랙리스트 등록)
	 */
	@Transactional
	@Override
	public void logout(HttpServletRequest httpServletRequest, LogoutRequest request) {
		//Access Token 추출
		String accessToken = tokenExtractorService.extractAccessToken(httpServletRequest);
		//Access Token 만료 여부 확인
		if (!tokenService.validateToken(accessToken)) {
			throw new IllegalArgumentException("Access Token is already expired.");
		}
		//id 추출
		Long id = tokenService.extractUserIdFromToken(accessToken);
		//Refresh Token 삭제
		refreshTokenRepository.deleteByUserId(id);
		//Access Token 블랙리스트 등록
		tokenService.addToBlacklist(accessToken);
	}
}
