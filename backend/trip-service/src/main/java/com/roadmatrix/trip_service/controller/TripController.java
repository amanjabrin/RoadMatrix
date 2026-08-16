package com.roadmatrix.trip_service.controller;

import com.roadmatrix.trip_service.dto.TripDto;
import com.roadmatrix.trip_service.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/trip")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @GetMapping
    public ResponseEntity<List<TripDto>> getTrips(@RequestParam(required = false) UUID companyId) {
        if (companyId != null) {
            return ResponseEntity.ok(tripService.getAllTrips(companyId));
        }
        return ResponseEntity.ok(tripService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripDto> getTrip(@PathVariable UUID id) {
        return ResponseEntity.ok(tripService.getTripById(id));
    }

    @PostMapping
    public ResponseEntity<TripDto> createTrip(@RequestBody TripDto dto) {
        return ResponseEntity.ok(tripService.createTrip(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TripDto> updateTrip(@PathVariable UUID id, @RequestBody TripDto dto) {
        return ResponseEntity.ok(tripService.updateTrip(id, dto));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable UUID id, @RequestParam String status, @RequestParam(required = false) Double odometer) {
        tripService.updateStatus(id, status, odometer);
        return ResponseEntity.ok().build();
    }
}
