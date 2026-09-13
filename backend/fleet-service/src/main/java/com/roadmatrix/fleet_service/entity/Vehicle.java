package com.roadmatrix.fleet_service.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vehicles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String model;

    @Column(name = "license_plate", nullable = false)
    private String licensePlate;

    private String type; // truck, van, bike

    @Column(name = "max_load_capacity")
    private Double maxLoadCapacity;

    private Double odometer;
    private String status; // available, on_trip, in_shop, retired

    @Column(name = "acquisition_cost")
    private Double acquisitionCost;

    private Integer year;

    @Column(name = "fuel_type")
    private String fuelType;

    private String region;

    private UUID companyId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
