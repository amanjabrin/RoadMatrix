package com.roadmatrix.fleet_service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDto {
    private UUID id;

    @NotBlank(message = "Vehicle name is required")
    private String name;

    @NotBlank(message = "Vehicle model is required")
    private String model;

    @NotBlank(message = "License plate is required")
    private String licensePlate;

    @NotBlank(message = "Vehicle type is required (truck, van, bike)")
    private String type; // truck, van, bike

    @NotNull(message = "Max load capacity is required")
    @Positive(message = "Max load capacity must be greater than zero")
    private Double maxLoadCapacity;

    @Min(value = 0, message = "Odometer reading cannot be negative")
    private Double odometer;

    private String status; // available, on_trip, in_shop, retired

    @Min(value = 0, message = "Acquisition cost cannot be negative")
    private Double acquisitionCost;

    @NotNull(message = "Manufacturing year is required")
    @Min(value = 1900, message = "Invalid manufacturing year (must be 1900 or later)")
    private Integer year;

    @NotBlank(message = "Fuel type is required (diesel, gasoline, electric)")
    private String fuelType;

    private String region;
    private UUID companyId;
}
