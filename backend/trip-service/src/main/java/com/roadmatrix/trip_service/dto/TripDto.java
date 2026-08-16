package com.roadmatrix.trip_service.dto;

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
    private UUID vehicleId;
    private UUID driverId;
    private Double cargoWeight;
    private String origin;
    private String destination;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime dispatchedAt;
    private LocalDateTime completedAt;
    private Double distance;
    private Double revenue;
    private UUID companyId;
}
