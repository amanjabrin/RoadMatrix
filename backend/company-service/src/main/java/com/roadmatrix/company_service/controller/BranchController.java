package com.roadmatrix.company_service.controller;

import com.roadmatrix.company_service.dto.BranchDto;
import com.roadmatrix.company_service.service.BranchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/company/branches")
@RequiredArgsConstructor
public class BranchController {
    private final BranchService branchService;

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<BranchDto>> getBranchesByCompany(@PathVariable UUID companyId) {
        return ResponseEntity.ok(branchService.getBranchesByCompany(companyId));
    }

    @PostMapping
    public ResponseEntity<BranchDto> createBranch(@RequestBody BranchDto dto) {
        return ResponseEntity.ok(branchService.createBranch(dto));
    }
}
