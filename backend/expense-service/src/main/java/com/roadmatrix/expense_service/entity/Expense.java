package com.roadmatrix.expense_service.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "expenses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "trip_id")
    private UUID tripId;

    @Column(name = "vehicle_id")
    private UUID vehicleId;

    @Column(nullable = false)
    private String category; // fuel, toll, maintenance, salary, driver_allowance, miscellaneous

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String status; // pending, approved, rejected

    private String description;

    @Column(name = "receipt_url")
    private String receiptUrl;

    private UUID companyId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
