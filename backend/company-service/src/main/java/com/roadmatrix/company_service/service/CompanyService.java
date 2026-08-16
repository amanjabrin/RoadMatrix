package com.roadmatrix.company_service.service;

import com.roadmatrix.company_service.dto.CompanyDto;
import com.roadmatrix.company_service.entity.Company;
import com.roadmatrix.company_service.exception.ResourceNotFoundException;
import com.roadmatrix.company_service.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CompanyService {
    private final CompanyRepository companyRepository;

    public CompanyDto getCompany(UUID id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        return mapToDto(company);
    }

    public CompanyDto createCompany(CompanyDto dto) {
        Company company = Company.builder()
                .companyName(dto.getCompanyName())
                .legalName(dto.getLegalName())
                .registrationNumber(dto.getRegistrationNumber())
                .gstin(dto.getGstin())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .city(dto.getCity())
                .state(dto.getState())
                .pincode(dto.getPincode())
                .status(dto.getStatus() != null ? dto.getStatus() : "ACTIVE")
                .build();
        Company saved = companyRepository.save(company);
        return mapToDto(saved);
    }

    public CompanyDto updateCompany(UUID id, CompanyDto dto) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        company.setCompanyName(dto.getCompanyName());
        company.setLegalName(dto.getLegalName());
        company.setRegistrationNumber(dto.getRegistrationNumber());
        company.setGstin(dto.getGstin());
        company.setEmail(dto.getEmail());
        company.setPhone(dto.getPhone());
        company.setAddress(dto.getAddress());
        company.setCity(dto.getCity());
        company.setState(dto.getState());
        company.setPincode(dto.getPincode());
        company.setStatus(dto.getStatus());
        Company saved = companyRepository.save(company);
        return mapToDto(saved);
    }

    private CompanyDto mapToDto(Company company) {
        return CompanyDto.builder()
                .id(company.getId())
                .companyName(company.getCompanyName())
                .legalName(company.getLegalName())
                .registrationNumber(company.getRegistrationNumber())
                .gstin(company.getGstin())
                .email(company.getEmail())
                .phone(company.getPhone())
                .address(company.getAddress())
                .city(company.getCity())
                .state(company.getState())
                .pincode(company.getPincode())
                .status(company.getStatus())
                .build();
    }
}
