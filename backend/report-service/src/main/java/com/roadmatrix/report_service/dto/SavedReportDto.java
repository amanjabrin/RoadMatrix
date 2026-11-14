package com.roadmatrix.report_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedReportDto {

    private UUID id;

    @NotBlank(message = "Report name cannot be blank")
    @Size(max = 255, message = "Report name must not exceed 255 characters")
    private String name;

    @NotBlank(message = "Report type cannot be blank")
    @Pattern(regexp = "^(?i)(fleet|driver|fuel|trip|maintenance|summary)$", 
             message = "Report type must be one of: fleet, driver, fuel, trip, maintenance, summary")
    private String type;

    private String generatedBy;
    private UUID companyId;
    private LocalDateTime generatedAt;
}

