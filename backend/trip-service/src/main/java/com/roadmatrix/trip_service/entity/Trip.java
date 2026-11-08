package com.roadmatrix.trip_service.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "trips")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "vehicle_id", nullable = false)
    private UUID vehicleId;

    @Column(name = "driver_id", nullable = false)
    private UUID driverId;

    @Column(name = "cargo_weight")
    private Double cargoWeight;

    private String origin;
    private String destination;
    private String status; // draft, dispatched, in_progress, completed, cancelled

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "dispatched_at")
    private LocalDateTime dispatchedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    private Double distance;
    private Double revenue;

    private UUID companyId;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
