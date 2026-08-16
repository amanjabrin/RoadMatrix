package com.roadmatrix.driver_service.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "drivers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    @Column(name = "license_number")
    private String licenseNumber;

    @Column(name = "license_expiry")
    private LocalDate licenseExpiry;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "driver_license_categories", joinColumns = @JoinColumn(name = "driver_id"))
    @Column(name = "category")
    private List<String> licenseCategories;

    private String status; // on_duty, off_duty, suspended
    
    @Column(name = "safety_score")
    private Integer safetyScore;

    @Column(name = "join_date")
    private LocalDate joinDate;

    @Column(name = "total_trips")
    private Integer totalTrips;

    @Column(name = "completed_trips")
    private Integer completedTrips;

    private UUID companyId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
