package com.roadmatrix.expense_service.dto;

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
public class ExpenseDto {
    private UUID id;
    private UUID tripId;
    private UUID vehicleId;
    private String category; // fuel, toll, maintenance, salary, driver_allowance, miscellaneous
    private Double amount;
    private LocalDate date;
    private String status; // pending, approved, rejected
    private String description;
    private String receiptUrl;
    private UUID companyId;
}
