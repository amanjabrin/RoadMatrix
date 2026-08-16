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
public class BranchDto {
    private UUID id;
    private UUID companyId;
    private String branchName;
    private String branchCode;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String status;
}
