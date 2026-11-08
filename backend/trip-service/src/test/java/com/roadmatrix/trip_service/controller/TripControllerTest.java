package com.roadmatrix.trip_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.roadmatrix.trip_service.dto.TripDto;
import com.roadmatrix.trip_service.exception.BadRequestException;
import com.roadmatrix.trip_service.exception.GlobalExceptionHandler;
import com.roadmatrix.trip_service.exception.ResourceNotFoundException;
import com.roadmatrix.trip_service.service.TripService;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class TripControllerTest {

    private MockMvc mockMvc;

    @Mock
    private TripService tripService;

    @InjectMocks
    private TripController tripController;

    private ObjectMapper objectMapper;
    private UUID sampleId;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(tripController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
        sampleId = UUID.randomUUID();
    }

    @Test
    @DisplayName("POST /api/v1/trip should return 400 with field errors when request body fails validation")
    void testCreateTripValidationFailure() throws Exception {
        TripDto invalidDto = new TripDto(); // all required fields missing

        mockMvc.perform(post("/api/v1/trip")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed for one or more fields"))
                .andExpect(jsonPath("$.errors").isArray());
    }

    @Test
    @DisplayName("POST /api/v1/trip should return 201 when request is valid")
    void testCreateTripSuccess() throws Exception {
        UUID vehicleId = UUID.randomUUID();
        UUID driverId = UUID.randomUUID();

        TripDto validDto = TripDto.builder()
                .vehicleId(vehicleId)
                .driverId(driverId)
                .cargoWeight(1200.0)
                .origin("Mumbai")
                .destination("Pune")
                .distance(150.0)
                .revenue(20000.0)
                .build();

        TripDto savedDto = TripDto.builder()
                .id(sampleId)
                .vehicleId(vehicleId)
                .driverId(driverId)
                .cargoWeight(1200.0)
                .origin("Mumbai")
                .destination("Pune")
                .status("draft")
                .distance(150.0)
                .revenue(20000.0)
                .createdAt(LocalDateTime.now())
                .build();

        when(tripService.createTrip(any(TripDto.class))).thenReturn(savedDto);

        mockMvc.perform(post("/api/v1/trip")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(sampleId.toString()))
                .andExpect(jsonPath("$.status").value("draft"))
                .andExpect(jsonPath("$.origin").value("Mumbai"));
    }

    @Test
    @DisplayName("GET /api/v1/trip/{id} should return 404 when trip not found")
    void testGetTripNotFound() throws Exception {
        when(tripService.getTripById(sampleId)).thenThrow(new ResourceNotFoundException("Trip with ID '" + sampleId + "' not found"));

        mockMvc.perform(get("/api/v1/trip/" + sampleId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Trip with ID '" + sampleId + "' not found"));
    }

    @Test
    @DisplayName("PUT /api/v1/trip/{id}/status should update trip status")
    void testUpdateTripStatus() throws Exception {
        TripDto updatedDto = TripDto.builder()
                .id(sampleId)
                .status("dispatched")
                .build();

        when(tripService.updateStatus(eq(sampleId), eq("dispatched"), any())).thenReturn(updatedDto);

        mockMvc.perform(put("/api/v1/trip/" + sampleId + "/status?status=dispatched"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("dispatched"));
    }

    @Test
    @DisplayName("DELETE /api/v1/trip/{id} should return 204")
    void testDeleteTrip() throws Exception {
        doNothing().when(tripService).deleteTrip(sampleId);

        mockMvc.perform(delete("/api/v1/trip/" + sampleId))
                .andExpect(status().isNoContent());
    }
}

