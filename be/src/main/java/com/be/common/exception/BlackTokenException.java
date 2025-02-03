package com.be.common.exception;

public class BlackTokenException extends RuntimeException {
  public BlackTokenException() {super("Access Token is Black Token");}
  public BlackTokenException(String message) {
    super(message);
  }
}
