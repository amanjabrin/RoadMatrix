package com.roadmatrix.fleet_service.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    @Builder.Default
    private boolean success = false;
    private int status;
    private String error;
    private String message;
    private LocalDateTime timestamp;
    private String path;
    private List<String> errors;
}
