package com.roadmatrix.maintenance_service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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

    @NotNull(message = "Vehicle ID is required")
    private UUID vehicleId;

    @NotBlank(message = "Maintenance type is required (oil_change, tire_rotation, brake_inspection, general_service, repair)")
    private String type;

    @NotBlank(message = "Maintenance description is required")
    private String description;

    private String status; // scheduled, in_progress, completed
    private LocalDate scheduledDate;
    private LocalDate completedDate;

    @Min(value = 0, message = "Maintenance cost cannot be negative")
    private Double cost;

    private String serviceProvider;
    private String notes;
    private UUID companyId;
}
