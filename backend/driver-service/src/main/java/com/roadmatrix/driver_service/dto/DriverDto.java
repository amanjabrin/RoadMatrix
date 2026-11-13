package com.roadmatrix.driver_service.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverDto {

    private UUID id;

    @NotBlank(message = "Driver name is required")
    @Size(max = 100, message = "Driver name cannot exceed 100 characters")
    private String name;

    @NotBlank(message = "Email address is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[+0-9\\s-]{7,20}$", message = "Please provide a valid phone number (e.g. +91-98765-01010)")
    private String phone;

    @NotBlank(message = "License number is required")
    @Size(max = 50, message = "License number cannot exceed 50 characters")
    private String licenseNumber;

    @NotNull(message = "License expiry date is required")
    private LocalDate licenseExpiry;

    @NotEmpty(message = "At least one license category is required")
    private List<String> licenseCategories;

    private String status;

    @Min(value = 0, message = "Safety score must be at least 0")
    @Max(value = 100, message = "Safety score cannot exceed 100")
    private Integer safetyScore;

    private LocalDate joinDate;

    @PositiveOrZero(message = "Total trips cannot be negative")
    private Integer totalTrips;

    @PositiveOrZero(message = "Completed trips cannot be negative")
    private Integer completedTrips;

    private UUID companyId;
}
