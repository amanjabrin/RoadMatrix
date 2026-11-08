package com.roadmatrix.trip_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
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
public class TripDto {

    private UUID id;

    @NotNull(message = "Vehicle ID is required")
    private UUID vehicleId;

    @NotNull(message = "Driver ID is required")
    private UUID driverId;

    @NotNull(message = "Cargo weight is required")
    @Positive(message = "Cargo weight must be greater than zero")
    private Double cargoWeight;

    @NotBlank(message = "Origin location is required")
    @Size(max = 255, message = "Origin location must not exceed 255 characters")
    private String origin;

    @NotBlank(message = "Destination location is required")
    @Size(max = 255, message = "Destination location must not exceed 255 characters")
    private String destination;

    private String status;

    private LocalDateTime createdAt;
    private LocalDateTime dispatchedAt;
    private LocalDateTime completedAt;

    @PositiveOrZero(message = "Distance cannot be negative")
    private Double distance;

    @PositiveOrZero(message = "Revenue cannot be negative")
    private Double revenue;

    private UUID companyId;
}
