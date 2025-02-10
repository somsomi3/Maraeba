package com.be.common.exception;

import lombok.Getter;
import org.springframework.security.core.AuthenticationException;

/**
 * JWT 인증 과정에서 발생하는 예외 (Security 인증 전용)
 */
@Getter
public class JwtFilterException extends AuthenticationException {

    private final TokenErrorCode tokenErrorCode;

    public JwtFilterException(TokenErrorCode tokenErrorCode) {
        super(tokenErrorCode.getMessage());
        this.tokenErrorCode = tokenErrorCode;
    }

    public JwtFilterException(TokenErrorCode tokenErrorCode, String message) {
        super(tokenErrorCode.getMessage() + " : " + message);
        this.tokenErrorCode = tokenErrorCode;
    }
}