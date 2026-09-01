package com.roadmatrix.maintenance_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceLogDto {
    private UUID id;
    private UUID vehicleId;
    private String type; // oil_change, tire_rotation, brake_inspection, general_service, repair
    private String description;
    private String status; // scheduled, in_progress, completed
    private LocalDate scheduledDate;
    private LocalDate completedDate;
    private Double cost;
    private String serviceProvider;
    private String notes;
    private UUID companyId;
}
