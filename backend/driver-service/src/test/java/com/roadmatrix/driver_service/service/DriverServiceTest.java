package com.roadmatrix.driver_service.service;

import com.roadmatrix.driver_service.dto.DriverDto;
import com.roadmatrix.driver_service.entity.Driver;
import com.roadmatrix.driver_service.exception.BadRequestException;
import com.roadmatrix.driver_service.exception.ResourceNotFoundException;
import com.roadmatrix.driver_service.repository.DriverRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DriverServiceTest {

    @Mock
    private DriverRepository driverRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private DriverService driverService;

    private UUID driverId;
    private UUID companyId;
    private Driver mockDriver;

    @BeforeEach
    void setUp() {
        driverId = UUID.randomUUID();
        companyId = UUID.randomUUID();

        mockDriver = Driver.builder()
                .id(driverId)
                .name("Karan Sharma")
                .email("karan.sharma@roadmatrix.in")
                .phone("+91-98765-43210")
                .licenseNumber("DL-01-2022-9988")
                .licenseExpiry(LocalDate.now().plusYears(3))
                .licenseCategories(List.of("truck", "van"))
                .status("on_duty")
                .safetyScore(90)
                .joinDate(LocalDate.now().minusMonths(6))
                .totalTrips(50)
                .completedTrips(48)
                .companyId(companyId)
                .build();
    }

    @Test
    @DisplayName("Should create driver successfully with valid data")
    void testCreateDriverSuccess() {
        DriverDto requestDto = DriverDto.builder()
                .name("Karan Sharma")
                .email("karan.sharma@roadmatrix.in")
                .phone("+91-98765-43210")
                .licenseNumber("DL-01-2022-9988")
                .licenseExpiry(LocalDate.now().plusYears(3))
                .licenseCategories(List.of("truck", "van"))
                .status("on_duty")
                .safetyScore(90)
                .build();

        when(driverRepository.existsByEmailIgnoreCase("karan.sharma@roadmatrix.in")).thenReturn(false);
        when(driverRepository.existsByLicenseNumberIgnoreCase("DL-01-2022-9988")).thenReturn(false);
        when(driverRepository.save(any(Driver.class))).thenReturn(mockDriver);

        DriverDto result = driverService.createDriver(requestDto);

        assertNotNull(result);
        assertEquals(driverId, result.getId());
        assertEquals("karan.sharma@roadmatrix.in", result.getEmail());
        assertEquals("on_duty", result.getStatus());
        verify(driverRepository, times(1)).save(any(Driver.class));
    }

    @Test
    @DisplayName("Should reject driver creation with duplicate email")
    void testCreateDriverDuplicateEmail() {
        DriverDto requestDto = DriverDto.builder()
                .name("Karan Sharma")
                .email("karan.sharma@roadmatrix.in")
                .phone("+91-98765-43210")
                .licenseNumber("DL-01-2022-9988")
                .licenseExpiry(LocalDate.now().plusYears(3))
                .licenseCategories(List.of("truck"))
                .build();

        when(driverRepository.existsByEmailIgnoreCase("karan.sharma@roadmatrix.in")).thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> driverService.createDriver(requestDto));
        assertTrue(ex.getMessage().contains("already exists"));
        verify(driverRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should reject driver creation with invalid license category")
    void testCreateDriverInvalidCategory() {
        DriverDto requestDto = DriverDto.builder()
                .name("Karan Sharma")
                .email("karan.sharma@roadmatrix.in")
                .phone("+91-98765-43210")
                .licenseNumber("DL-01-2022-9988")
                .licenseExpiry(LocalDate.now().plusYears(3))
                .licenseCategories(List.of("airplane"))
                .build();

        when(driverRepository.existsByEmailIgnoreCase("karan.sharma@roadmatrix.in")).thenReturn(false);
        when(driverRepository.existsByLicenseNumberIgnoreCase("DL-01-2022-9988")).thenReturn(false);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> driverService.createDriver(requestDto));
        assertTrue(ex.getMessage().contains("Invalid license category"));
    }

    @Test
    @DisplayName("Should update driver status")
    void testUpdateDriverStatus() {
        when(driverRepository.findById(driverId)).thenReturn(Optional.of(mockDriver));
        when(driverRepository.save(any(Driver.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DriverDto updated = driverService.updateStatus(driverId, "off_duty");

        assertEquals("off_duty", updated.getStatus());
        verify(driverRepository).save(any(Driver.class));
    }

    @Test
    @DisplayName("Should reject invalid driver status")
    void testUpdateDriverInvalidStatus() {
        when(driverRepository.findById(driverId)).thenReturn(Optional.of(mockDriver));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                driverService.updateStatus(driverId, "vacation")
        );
        assertTrue(ex.getMessage().contains("Invalid driver status"));
    }

    @Test
    @DisplayName("Should delete driver successfully")
    void testDeleteDriverSuccess() {
        when(driverRepository.findById(driverId)).thenReturn(Optional.of(mockDriver));

        assertDoesNotThrow(() -> driverService.deleteDriver(driverId));
        verify(driverRepository, times(1)).delete(mockDriver);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when driver does not exist")
    void testDriverNotFound() {
        UUID unknownId = UUID.randomUUID();
        when(driverRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> driverService.getDriverById(unknownId));
    }
}

