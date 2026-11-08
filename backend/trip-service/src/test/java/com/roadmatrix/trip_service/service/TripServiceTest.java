package com.roadmatrix.trip_service.service;

import com.roadmatrix.trip_service.dto.TripDto;
import com.roadmatrix.trip_service.entity.Trip;
import com.roadmatrix.trip_service.exception.BadRequestException;
import com.roadmatrix.trip_service.exception.ResourceNotFoundException;
import com.roadmatrix.trip_service.repository.TripRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TripServiceTest {

    @Mock
    private TripRepository tripRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private TripService tripService;

    private UUID tripId;
    private UUID vehicleId;
    private UUID driverId;
    private UUID companyId;
    private Trip mockTrip;

    @BeforeEach
    void setUp() {
        tripId = UUID.randomUUID();
        vehicleId = UUID.randomUUID();
        driverId = UUID.randomUUID();
        companyId = UUID.randomUUID();

        mockTrip = Trip.builder()
                .id(tripId)
                .vehicleId(vehicleId)
                .driverId(driverId)
                .cargoWeight(1500.0)
                .origin("Delhi")
                .destination("Jaipur")
                .status("draft")
                .distance(280.0)
                .revenue(45000.0)
                .companyId(companyId)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should create trip successfully with valid payload")
    void testCreateTripSuccess() {
        TripDto requestDto = TripDto.builder()
                .vehicleId(vehicleId)
                .driverId(driverId)
                .cargoWeight(1500.0)
                .origin("Delhi")
                .destination("Jaipur")
                .distance(280.0)
                .revenue(45000.0)
                .build();

        when(tripRepository.save(any(Trip.class))).thenReturn(mockTrip);

        TripDto result = tripService.createTrip(requestDto);

        assertNotNull(result);
        assertEquals(tripId, result.getId());
        assertEquals("draft", result.getStatus());
        assertEquals("Delhi", result.getOrigin());
        verify(tripRepository, times(1)).save(any(Trip.class));
    }

    @Test
    @DisplayName("Should throw BadRequestException when cargo weight is non-positive")
    void testCreateTripNegativeCargoWeight() {
        TripDto requestDto = TripDto.builder()
                .vehicleId(vehicleId)
                .driverId(driverId)
                .cargoWeight(-50.0)
                .origin("Delhi")
                .destination("Jaipur")
                .build();

        BadRequestException ex = assertThrows(BadRequestException.class, () -> tripService.createTrip(requestDto));
        assertTrue(ex.getMessage().contains("Cargo weight must be greater than zero"));
    }

    @Test
    @DisplayName("Should update status from draft to dispatched")
    void testUpdateStatusDraftToDispatched() {
        when(tripRepository.findById(tripId)).thenReturn(Optional.of(mockTrip));
        when(tripRepository.save(any(Trip.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TripDto updated = tripService.updateStatus(tripId, "dispatched", null);

        assertEquals("dispatched", updated.getStatus());
        assertNotNull(updated.getDispatchedAt());
        verify(tripRepository).save(any(Trip.class));
    }

    @Test
    @DisplayName("Should reject illegal status transition from completed to draft")
    void testIllegalStatusTransition() {
        mockTrip.setStatus("completed");
        when(tripRepository.findById(tripId)).thenReturn(Optional.of(mockTrip));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                tripService.updateStatus(tripId, "draft", null)
        );

        assertTrue(ex.getMessage().contains("Cannot change status of a completed trip"));
    }

    @Test
    @DisplayName("Should reject deletion of active trip in progress")
    void testDeleteActiveTripFails() {
        mockTrip.setStatus("in_progress");
        when(tripRepository.findById(tripId)).thenReturn(Optional.of(mockTrip));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                tripService.deleteTrip(tripId)
        );

        assertTrue(ex.getMessage().contains("Cannot delete an active trip"));
        verify(tripRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Should successfully delete draft trip")
    void testDeleteDraftTripSuccess() {
        mockTrip.setStatus("draft");
        when(tripRepository.findById(tripId)).thenReturn(Optional.of(mockTrip));

        assertDoesNotThrow(() -> tripService.deleteTrip(tripId));
        verify(tripRepository, times(1)).delete(mockTrip);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when trip does not exist")
    void testTripNotFound() {
        UUID unknownId = UUID.randomUUID();
        when(tripRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> tripService.getTripById(unknownId));
    }
}

