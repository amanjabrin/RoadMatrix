package com.roadmatrix.driver_service.service;

import com.roadmatrix.driver_service.dto.DriverDto;
import com.roadmatrix.driver_service.entity.Driver;
import com.roadmatrix.driver_service.exception.BadRequestException;
import com.roadmatrix.driver_service.exception.ResourceNotFoundException;
import com.roadmatrix.driver_service.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DriverService {

    private final DriverRepository driverRepository;
    private final RestTemplate restTemplate;

    public static final Set<String> VALID_STATUSES = Set.of("on_duty", "off_duty", "suspended");
    public static final Set<String> VALID_CATEGORIES = Set.of("truck", "van", "bike");
    private static final UUID DEFAULT_COMPANY_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");

    public List<DriverDto> getDrivers(UUID companyId, String status, String search) {
        List<Driver> drivers;
        if (companyId != null) {
            drivers = driverRepository.findByCompanyId(companyId);
        } else {
            drivers = driverRepository.findAll();
        }

        return drivers.stream()
                .filter(d -> status == null || status.trim().equalsIgnoreCase(d.getStatus()))
                .filter(d -> {
                    if (search == null || search.trim().isEmpty()) return true;
                    String q = search.trim().toLowerCase();
                    return (d.getName() != null && d.getName().toLowerCase().contains(q)) ||
                           (d.getEmail() != null && d.getEmail().toLowerCase().contains(q)) ||
                           (d.getLicenseNumber() != null && d.getLicenseNumber().toLowerCase().contains(q));
                })
                .sorted(Comparator.comparing(Driver::getName, String.CASE_INSENSITIVE_ORDER))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<DriverDto> getAllDrivers(UUID companyId) {
        return getDrivers(companyId, null, null);
    }

    public List<DriverDto> getAll() {
        return getDrivers(null, null, null);
    }

    public DriverDto getDriverById(UUID id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver with ID '" + id + "' not found"));
        return mapToDto(driver);
    }

    public DriverDto createDriver(DriverDto dto) {
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new BadRequestException("Driver name is required");
        }
        if (dto.getEmail() == null || dto.getEmail().trim().isEmpty()) {
            throw new BadRequestException("Email address is required");
        }
        if (dto.getPhone() == null || dto.getPhone().trim().isEmpty()) {
            throw new BadRequestException("Phone number is required");
        }
        if (dto.getLicenseNumber() == null || dto.getLicenseNumber().trim().isEmpty()) {
            throw new BadRequestException("License number is required");
        }
        if (dto.getLicenseExpiry() == null) {
            throw new BadRequestException("License expiry date is required");
        }

        String normalizedEmail = dto.getEmail().toLowerCase().trim();
        if (driverRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new BadRequestException("Driver with email '" + normalizedEmail + "' already exists");
        }

        String normalizedLicense = dto.getLicenseNumber().trim();
        if (driverRepository.existsByLicenseNumberIgnoreCase(normalizedLicense)) {
            throw new BadRequestException("Driver with license number '" + normalizedLicense + "' already exists");
        }

        List<String> categories = validateAndNormalizeCategories(dto.getLicenseCategories());

        String status = dto.getStatus() != null ? dto.getStatus().toLowerCase().trim() : "on_duty";
        if (!VALID_STATUSES.contains(status)) {
            throw new BadRequestException("Invalid driver status '" + dto.getStatus() + "'. Allowed values: " + VALID_STATUSES);
        }

        Integer safetyScore = dto.getSafetyScore() != null ? dto.getSafetyScore() : 85;
        if (safetyScore < 0 || safetyScore > 100) {
            throw new BadRequestException("Safety score must be between 0 and 100");
        }

        Integer totalTrips = dto.getTotalTrips() != null ? dto.getTotalTrips() : 0;
        Integer completedTrips = dto.getCompletedTrips() != null ? dto.getCompletedTrips() : 0;
        if (totalTrips < 0 || completedTrips < 0) {
            throw new BadRequestException("Trip counts cannot be negative");
        }
        if (completedTrips > totalTrips) {
            throw new BadRequestException("Completed trips cannot exceed total trips");
        }

        Driver driver = Driver.builder()
                .name(dto.getName().trim())
                .email(normalizedEmail)
                .phone(dto.getPhone().trim())
                .licenseNumber(normalizedLicense)
                .licenseExpiry(dto.getLicenseExpiry())
                .licenseCategories(categories)
                .status(status)
                .safetyScore(safetyScore)
                .joinDate(dto.getJoinDate() != null ? dto.getJoinDate() : LocalDate.now())
                .totalTrips(totalTrips)
                .completedTrips(completedTrips)
                .companyId(dto.getCompanyId() != null ? dto.getCompanyId() : DEFAULT_COMPANY_ID)
                .build();

        Driver saved = driverRepository.save(driver);
        return mapToDto(saved);
    }

    public DriverDto updateDriver(UUID id, DriverDto dto) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver with ID '" + id + "' not found"));

        if (dto.getName() != null) {
            if (dto.getName().trim().isEmpty()) {
                throw new BadRequestException("Driver name cannot be empty");
            }
            driver.setName(dto.getName().trim());
        }

        if (dto.getEmail() != null) {
            String email = dto.getEmail().toLowerCase().trim();
            if (email.isEmpty()) {
                throw new BadRequestException("Email address cannot be empty");
            }
            if (driverRepository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
                throw new BadRequestException("Another driver with email '" + email + "' already exists");
            }
            driver.setEmail(email);
        }

        if (dto.getPhone() != null) {
            if (dto.getPhone().trim().isEmpty()) {
                throw new BadRequestException("Phone number cannot be empty");
            }
            driver.setPhone(dto.getPhone().trim());
        }

        if (dto.getLicenseNumber() != null) {
            String license = dto.getLicenseNumber().trim();
            if (license.isEmpty()) {
                throw new BadRequestException("License number cannot be empty");
            }
            if (driverRepository.existsByLicenseNumberIgnoreCaseAndIdNot(license, id)) {
                throw new BadRequestException("Another driver with license number '" + license + "' already exists");
            }
            driver.setLicenseNumber(license);
        }

        if (dto.getLicenseExpiry() != null) {
            driver.setLicenseExpiry(dto.getLicenseExpiry());
        }

        if (dto.getLicenseCategories() != null) {
            driver.setLicenseCategories(validateAndNormalizeCategories(dto.getLicenseCategories()));
        }

        if (dto.getStatus() != null) {
            String status = dto.getStatus().toLowerCase().trim();
            if (!VALID_STATUSES.contains(status)) {
                throw new BadRequestException("Invalid driver status '" + dto.getStatus() + "'. Allowed values: " + VALID_STATUSES);
            }
            if ("suspended".equals(status)) {
                checkActiveTripsWithTripService(id);
            }
            driver.setStatus(status);
        }

        if (dto.getSafetyScore() != null) {
            if (dto.getSafetyScore() < 0 || dto.getSafetyScore() > 100) {
                throw new BadRequestException("Safety score must be between 0 and 100");
            }
            driver.setSafetyScore(dto.getSafetyScore());
        }

        if (dto.getTotalTrips() != null) {
            if (dto.getTotalTrips() < 0) {
                throw new BadRequestException("Total trips cannot be negative");
            }
            driver.setTotalTrips(dto.getTotalTrips());
        }

        if (dto.getCompletedTrips() != null) {
            if (dto.getCompletedTrips() < 0) {
                throw new BadRequestException("Completed trips cannot be negative");
            }
            driver.setCompletedTrips(dto.getCompletedTrips());
        }

        if (driver.getCompletedTrips() != null && driver.getTotalTrips() != null &&
            driver.getCompletedTrips() > driver.getTotalTrips()) {
            throw new BadRequestException("Completed trips cannot exceed total trips");
        }

        Driver saved = driverRepository.save(driver);
        return mapToDto(saved);
    }

    public DriverDto updateStatus(UUID id, String status) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver with ID '" + id + "' not found"));

        if (status == null || status.trim().isEmpty()) {
            throw new BadRequestException("Status cannot be empty");
        }

        String normalizedStatus = status.toLowerCase().trim();
        if (!VALID_STATUSES.contains(normalizedStatus)) {
            throw new BadRequestException("Invalid driver status '" + status + "'. Allowed values: " + VALID_STATUSES);
        }

        if ("suspended".equals(normalizedStatus)) {
            checkActiveTripsWithTripService(id);
        }

        driver.setStatus(normalizedStatus);
        Driver saved = driverRepository.save(driver);
        return mapToDto(saved);
    }

    public void deleteDriver(UUID id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver with ID '" + id + "' not found"));

        checkActiveTripsWithTripService(id);

        driverRepository.delete(driver);
    }

    private List<String> validateAndNormalizeCategories(List<String> categories) {
        if (categories == null || categories.isEmpty()) {
            throw new BadRequestException("At least one license category is required (allowed: " + VALID_CATEGORIES + ")");
        }

        List<String> normalized = new ArrayList<>();
        for (String cat : categories) {
            if (cat == null || cat.trim().isEmpty()) continue;
            String c = cat.toLowerCase().trim();
            if (!VALID_CATEGORIES.contains(c)) {
                throw new BadRequestException("Invalid license category '" + cat + "'. Allowed values: " + VALID_CATEGORIES);
            }
            if (!normalized.contains(c)) {
                normalized.add(c);
            }
        }

        if (normalized.isEmpty()) {
            throw new BadRequestException("At least one valid license category is required");
        }

        return normalized;
    }

    private void checkActiveTripsWithTripService(UUID driverId) {
        if (driverId == null) return;
        try {
            ResponseEntity<List> response = restTemplate.getForEntity(
                    "http://trip-service/api/v1/trip?driverId=" + driverId + "&status=in_progress",
                    List.class
            );
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && !response.getBody().isEmpty()) {
                throw new BadRequestException("Cannot modify/delete driver who is currently assigned to an active trip in progress");
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Trip service driver trip verification skipped: {}", e.getMessage());
        }
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
