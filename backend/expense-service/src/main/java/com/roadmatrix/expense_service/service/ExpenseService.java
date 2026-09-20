package com.roadmatrix.expense_service.service;

import com.roadmatrix.expense_service.dto.ExpenseDto;
import com.roadmatrix.expense_service.entity.Expense;
import com.roadmatrix.expense_service.exception.ResourceNotFoundException;
import com.roadmatrix.expense_service.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public List<ExpenseDto> getAllExpenses(UUID companyId) {
        return expenseRepository.findByCompanyId(companyId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ExpenseDto> getAll() {
        return expenseRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private static final java.util.Set<String> VALID_CATEGORIES = java.util.Set.of("fuel", "toll", "maintenance", "salary", "driver_allowance", "miscellaneous");
    private static final java.util.Set<String> VALID_STATUSES = java.util.Set.of("pending", "approved", "rejected");

    public ExpenseDto getExpenseById(UUID id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense with ID '" + id + "' not found"));
        return mapToDto(expense);
    }

    public ExpenseDto createExpense(ExpenseDto dto) {
        String category = dto.getCategory().toLowerCase().trim();
        if (!VALID_CATEGORIES.contains(category)) {
            throw new com.roadmatrix.expense_service.exception.BadRequestException("Invalid expense category '" + dto.getCategory() + "'. Allowed values: " + VALID_CATEGORIES);
        }

        String status = dto.getStatus() != null ? dto.getStatus().toLowerCase().trim() : "pending";
        if (!VALID_STATUSES.contains(status)) {
            throw new com.roadmatrix.expense_service.exception.BadRequestException("Invalid expense status '" + dto.getStatus() + "'. Allowed values: " + VALID_STATUSES);
        }

        Expense expense = Expense.builder()
                .tripId(dto.getTripId())
                .vehicleId(dto.getVehicleId())
                .category(category)
                .amount(dto.getAmount())
                .date(dto.getDate() != null ? dto.getDate() : LocalDate.now())
                .status(status)
                .description(dto.getDescription() != null ? dto.getDescription().trim() : null)
                .receiptUrl(dto.getReceiptUrl())
                .companyId(dto.getCompanyId() != null ? dto.getCompanyId() : UUID.fromString("11111111-1111-1111-1111-111111111111"))
                .build();
        Expense saved = expenseRepository.save(expense);
        return mapToDto(saved);
    }

    public void updateExpenseStatus(UUID id, String status) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense with ID '" + id + "' not found"));

        String normalizedStatus = status != null ? status.toLowerCase().trim() : "";
        if (!VALID_STATUSES.contains(normalizedStatus)) {
            throw new com.roadmatrix.expense_service.exception.BadRequestException("Invalid expense status '" + status + "'. Allowed values: " + VALID_STATUSES);
        }

        expense.setStatus(normalizedStatus);
        expenseRepository.save(expense);
    }

    private ExpenseDto mapToDto(Expense expense) {
        return ExpenseDto.builder()
                .id(expense.getId())
                .tripId(expense.getTripId())
                .vehicleId(expense.getVehicleId())
                .category(expense.getCategory())
                .amount(expense.getAmount())
                .date(expense.getDate())
                .status(expense.getStatus())
                .description(expense.getDescription())
                .receiptUrl(expense.getReceiptUrl())
                .companyId(expense.getCompanyId())
                .build();
    }
}
