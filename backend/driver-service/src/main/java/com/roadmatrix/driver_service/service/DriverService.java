package com.roadmatrix.driver_service.service;

import com.roadmatrix.driver_service.dto.DriverDto;
import com.roadmatrix.driver_service.entity.Driver;
import com.roadmatrix.driver_service.exception.ResourceNotFoundException;
import com.roadmatrix.driver_service.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;

    public List<DriverDto> getAllDrivers(UUID companyId) {
        return driverRepository.findByCompanyId(companyId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<DriverDto> getAll() {
        return driverRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public DriverDto getDriverById(UUID id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
        return mapToDto(driver);
    }

    public DriverDto createDriver(DriverDto dto) {
        Driver driver = Driver.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .licenseNumber(dto.getLicenseNumber())
                .licenseExpiry(dto.getLicenseExpiry())
                .licenseCategories(dto.getLicenseCategories())
                .status(dto.getStatus() != null ? dto.getStatus() : "on_duty")
                .safetyScore(dto.getSafetyScore() != null ? dto.getSafetyScore() : 95)
                .joinDate(dto.getJoinDate() != null ? dto.getJoinDate() : LocalDate.now())
                .totalTrips(dto.getTotalTrips() != null ? dto.getTotalTrips() : 0)
                .completedTrips(dto.getCompletedTrips() != null ? dto.getCompletedTrips() : 0)
                .companyId(dto.getCompanyId() != null ? dto.getCompanyId() : UUID.fromString("11111111-1111-1111-1111-111111111111"))
                .build();
        Driver saved = driverRepository.save(driver);
        return mapToDto(saved);
    }

    public DriverDto updateDriver(UUID id, DriverDto dto) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        if (dto.getName() != null) driver.setName(dto.getName());
        if (dto.getEmail() != null) driver.setEmail(dto.getEmail());
        if (dto.getPhone() != null) driver.setPhone(dto.getPhone());
        if (dto.getLicenseNumber() != null) driver.setLicenseNumber(dto.getLicenseNumber());
        if (dto.getLicenseExpiry() != null) driver.setLicenseExpiry(dto.getLicenseExpiry());
        if (dto.getLicenseCategories() != null) driver.setLicenseCategories(dto.getLicenseCategories());
        if (dto.getStatus() != null) driver.setStatus(dto.getStatus());
        if (dto.getSafetyScore() != null) driver.setSafetyScore(dto.getSafetyScore());
        if (dto.getTotalTrips() != null) driver.setTotalTrips(dto.getTotalTrips());
        if (dto.getCompletedTrips() != null) driver.setCompletedTrips(dto.getCompletedTrips());

        Driver saved = driverRepository.save(driver);
        return mapToDto(saved);
    }

    public void updateStatus(UUID id, String status) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
        driver.setStatus(status);
        driverRepository.save(driver);
    }

    public void deleteDriver(UUID id) {
        if (!driverRepository.existsById(id)) {
            throw new ResourceNotFoundException("Driver not found");
        }
        driverRepository.deleteById(id);
    }

    private DriverDto mapToDto(Driver driver) {
        return DriverDto.builder()
                .id(driver.getId())
                .name(driver.getName())
                .email(driver.getEmail())
                .phone(driver.getPhone())
                .licenseNumber(driver.getLicenseNumber())
                .licenseExpiry(driver.getLicenseExpiry())
                .licenseCategories(driver.getLicenseCategories())
                .status(driver.getStatus())
                .safetyScore(driver.getSafetyScore())
                .joinDate(driver.getJoinDate())
                .totalTrips(driver.getTotalTrips())
                .completedTrips(driver.getCompletedTrips())
                .companyId(driver.getCompanyId())
                .build();
    }
}
