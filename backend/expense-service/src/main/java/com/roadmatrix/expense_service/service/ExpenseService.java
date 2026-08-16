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

    public ExpenseDto getExpenseById(UUID id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        return mapToDto(expense);
    }

    public ExpenseDto createExpense(ExpenseDto dto) {
        Expense expense = Expense.builder()
                .tripId(dto.getTripId())
                .vehicleId(dto.getVehicleId())
                .category(dto.getCategory())
                .amount(dto.getAmount())
                .date(dto.getDate() != null ? dto.getDate() : LocalDate.now())
                .status("pending")
                .description(dto.getDescription())
                .receiptUrl(dto.getReceiptUrl())
                .companyId(dto.getCompanyId() != null ? dto.getCompanyId() : UUID.fromString("11111111-1111-1111-1111-111111111111"))
                .build();
        Expense saved = expenseRepository.save(expense);
        return mapToDto(saved);
    }

    public void updateExpenseStatus(UUID id, String status) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        expense.setStatus(status);
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
