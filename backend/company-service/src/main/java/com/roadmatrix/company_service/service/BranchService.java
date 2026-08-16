package com.roadmatrix.company_service.service;

import com.roadmatrix.company_service.dto.BranchDto;
import com.roadmatrix.company_service.entity.Branch;
import com.roadmatrix.company_service.exception.ResourceNotFoundException;
import com.roadmatrix.company_service.repository.BranchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BranchService {
    private final BranchRepository branchRepository;

    public List<BranchDto> getBranchesByCompany(UUID companyId) {
        return branchRepository.findByCompanyId(companyId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public BranchDto createBranch(BranchDto dto) {
        Branch branch = Branch.builder()
                .companyId(dto.getCompanyId())
                .branchName(dto.getBranchName())
                .branchCode(dto.getBranchCode())
                .address(dto.getAddress())
                .city(dto.getCity())
                .state(dto.getState())
                .pincode(dto.getPincode())
                .status(dto.getStatus() != null ? dto.getStatus() : "ACTIVE")
                .build();
        Branch saved = branchRepository.save(branch);
        return mapToDto(saved);
    }

    private BranchDto mapToDto(Branch branch) {
        return BranchDto.builder()
                .id(branch.getId())
                .companyId(branch.getCompanyId())
                .branchName(branch.getBranchName())
                .branchCode(branch.getBranchCode())
                .address(branch.getAddress())
                .city(branch.getCity())
                .state(branch.getState())
                .pincode(branch.getPincode())
                .status(branch.getStatus())
                .build();
    }
}
