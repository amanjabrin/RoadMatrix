package com.roadmatrix.expense_service.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
                .success(false)
                .status(HttpStatus.NOT_FOUND.value())
                .error(HttpStatus.NOT_FOUND.getReasonPhrase())
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .errors(List.of(ex.getMessage()))
                .build();
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(BadRequestException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
                .success(false)
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .errors(List.of(ex.getMessage()))
                .build();
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(err -> err.getField() + ": " + (err.getDefaultMessage() != null ? err.getDefaultMessage() : "Invalid value"))
                .collect(Collectors.toList());

        ErrorResponse error = ErrorResponse.builder()
                .success(false)
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message("Validation failed for one or more fields")
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .errors(errors)
                .build();
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadable(HttpMessageNotReadableException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
                .success(false)
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message("Malformed JSON request body or invalid data type")
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .errors(List.of(ex.getMostSpecificCause().getMessage()))
                .build();
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        String msg = "Parameter '" + ex.getName() + "' must be of type " + (ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "valid type");
        ErrorResponse error = ErrorResponse.builder()
                .success(false)
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(msg)
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .errors(List.of(msg))
                .build();
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException ex, HttpServletRequest request) {
        List<String> errors = ex.getConstraintViolations()
                .stream()
                .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                .collect(Collectors.toList());

        ErrorResponse error = ErrorResponse.builder()
                .success(false)
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message("Constraint violation")
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .errors(errors)
                .build();
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex, HttpServletRequest request) {
        List<String> details = new ArrayList<>();
        if (ex.getLocalizedMessage() != null) {
            details.add(ex.getLocalizedMessage());
        }
        ErrorResponse error = ErrorResponse.builder()
                .success(false)
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase())
                .message("An unexpected error occurred")
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .errors(details)
                .build();
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
