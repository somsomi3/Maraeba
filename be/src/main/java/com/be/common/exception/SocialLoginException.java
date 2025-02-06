package com.be.common.exception;

public class SocialLoginException extends RuntimeException {
  public SocialLoginException() {
    super("Social login failed");
  }

  public SocialLoginException(String message) {
    super(message);
  }
}
