package com.roadmatrix.driver_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.roadmatrix.driver_service.dto.DriverDto;
import com.roadmatrix.driver_service.exception.GlobalExceptionHandler;
import com.roadmatrix.driver_service.exception.ResourceNotFoundException;
import com.roadmatrix.driver_service.service.DriverService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class DriverControllerTest {

    private MockMvc mockMvc;

    @Mock
    private DriverService driverService;

    @InjectMocks
    private DriverController driverController;

    private ObjectMapper objectMapper;
    private UUID sampleId;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(driverController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        sampleId = UUID.randomUUID();
    }

    @Test
    @DisplayName("POST /api/v1/driver should return 400 when validation fails")
    void testCreateDriverValidationFailure() throws Exception {
        DriverDto invalidDto = new DriverDto(); // all required fields missing

        mockMvc.perform(post("/api/v1/driver")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed for one or more fields"))
                .andExpect(jsonPath("$.errors").isArray());
    }

    @Test
    @DisplayName("POST /api/v1/driver should return 201 when request is valid")
    void testCreateDriverSuccess() throws Exception {
        DriverDto validDto = DriverDto.builder()
                .name("Ravi Verma")
                .email("ravi.verma@roadmatrix.in")
                .phone("+91-98765-11223")
                .licenseNumber("DL-09-2021-4455")
                .licenseExpiry(LocalDate.now().plusYears(2))
                .licenseCategories(List.of("truck"))
                .status("on_duty")
                .safetyScore(88)
                .build();

        DriverDto savedDto = DriverDto.builder()
                .id(sampleId)
                .name("Ravi Verma")
                .email("ravi.verma@roadmatrix.in")
                .phone("+91-98765-11223")
                .licenseNumber("DL-09-2021-4455")
                .licenseExpiry(LocalDate.now().plusYears(2))
                .licenseCategories(List.of("truck"))
                .status("on_duty")
                .safetyScore(88)
                .build();

        when(driverService.createDriver(any(DriverDto.class))).thenReturn(savedDto);

        mockMvc.perform(post("/api/v1/driver")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(sampleId.toString()))
                .andExpect(jsonPath("$.name").value("Ravi Verma"))
                .andExpect(jsonPath("$.status").value("on_duty"));
    }

    @Test
    @DisplayName("GET /api/v1/driver/{id} should return 404 when driver not found")
    void testGetDriverNotFound() throws Exception {
        when(driverService.getDriverById(sampleId)).thenThrow(new ResourceNotFoundException("Driver with ID '" + sampleId + "' not found"));

        mockMvc.perform(get("/api/v1/driver/" + sampleId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Driver with ID '" + sampleId + "' not found"));
    }

    @Test
    @DisplayName("PUT /api/v1/driver/{id}/status should update driver status")
    void testUpdateDriverStatus() throws Exception {
        DriverDto updatedDto = DriverDto.builder()
                .id(sampleId)
                .status("off_duty")
                .build();

        when(driverService.updateStatus(eq(sampleId), eq("off_duty"))).thenReturn(updatedDto);

        mockMvc.perform(put("/api/v1/driver/" + sampleId + "/status?status=off_duty"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("off_duty"));
    }

    @Test
    @DisplayName("DELETE /api/v1/driver/{id} should return 204")
    void testDeleteDriver() throws Exception {
        doNothing().when(driverService).deleteDriver(sampleId);

        mockMvc.perform(delete("/api/v1/driver/" + sampleId))
                .andExpect(status().isNoContent());
    }
}

