package com.roadmatrix.driver_service.repository;

import com.roadmatrix.driver_service.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DriverRepository extends JpaRepository<Driver, UUID> {
    List<Driver> findByCompanyId(UUID companyId);
    Optional<Driver> findByEmail(String email);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCaseAndIdNot(String email, UUID id);
    boolean existsByLicenseNumberIgnoreCase(String licenseNumber);
    boolean existsByLicenseNumberIgnoreCaseAndIdNot(String licenseNumber, UUID id);
    List<Driver> findByStatus(String status);
    List<Driver> findByCompanyIdAndStatus(UUID companyId, String status);
}
