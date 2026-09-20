package com.roadmatrix.expense_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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

    @NotBlank(message = "Expense category is required (fuel, toll, maintenance, salary, driver_allowance, miscellaneous)")
    private String category;

    @NotNull(message = "Expense amount is required")
    @Positive(message = "Expense amount must be greater than zero")
    private Double amount;

    private LocalDate date;
    private String status; // pending, approved, rejected
    private String description;
    private String receiptUrl;
    private UUID companyId;
}
