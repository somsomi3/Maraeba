package com.be.common.exception;

public class KakaoUserInfoException extends RuntimeException {
  public KakaoUserInfoException(String message) {
    super(message);
  }
  public KakaoUserInfoException() {super("Necessary user info is missing");}
}
