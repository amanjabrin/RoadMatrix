package com.roadmatrix.fleet_service.dto;

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
    private String name;
    private String model;
    private String licensePlate;
    private String type; // truck, van, bike
    private Double maxLoadCapacity;
    private Double odometer;
    private String status; // available, on_trip, in_shop, retired
    private Double acquisitionCost;
    private Integer year;
    private String fuelType;
    private String region;
    private UUID companyId;
}
