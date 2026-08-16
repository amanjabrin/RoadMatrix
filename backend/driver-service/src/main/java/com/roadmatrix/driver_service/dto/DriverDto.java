package com.roadmatrix.driver_service.dto;

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
    private String name;
    private String email;
    private String phone;
    private String licenseNumber;
    private LocalDate licenseExpiry;
    private List<String> licenseCategories;
    private String status;
    private Integer safetyScore;
    private LocalDate joinDate;
    private Integer totalTrips;
    private Integer completedTrips;
    private UUID companyId;
}
