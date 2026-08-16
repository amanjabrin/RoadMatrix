package com.roadmatrix.company_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyDto {
    private UUID id;
    private String companyName;
    private String legalName;
    private String registrationNumber;
    private String gstin;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String status;
}
