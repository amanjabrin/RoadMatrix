package com.roadmatrix.report_service.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "saved_reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedReport {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // fleet, driver, fuel, trip, maintenance

    @Column(name = "generated_by")
    private String generatedBy;

    private UUID companyId;

    @CreationTimestamp
    @Column(name = "generated_at", updatable = false)
    private LocalDateTime generatedAt;
}
