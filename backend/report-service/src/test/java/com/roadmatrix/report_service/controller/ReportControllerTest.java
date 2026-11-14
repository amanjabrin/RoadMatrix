package com.roadmatrix.report_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.roadmatrix.report_service.dto.SavedReportDto;
import com.roadmatrix.report_service.exception.GlobalExceptionHandler;
import com.roadmatrix.report_service.exception.ResourceNotFoundException;
import com.roadmatrix.report_service.service.ReportService;
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
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ReportControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ReportService reportService;

    @InjectMocks
    private ReportController reportController;

    private ObjectMapper objectMapper;
    private UUID sampleId;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(reportController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        sampleId = UUID.randomUUID();
    }

    @Test
    @DisplayName("GET /api/v1/report/summary should return 200 OK")
    void testGetSummaryReport() throws Exception {
        when(reportService.generateSummaryReport(any())).thenReturn(Map.of(
                "reportType", "Executive Fleet & Financial Summary",
                "totalVehicles", 10,
                "totalTrips", 25
        ));

        mockMvc.perform(get("/api/v1/report/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reportType").value("Executive Fleet & Financial Summary"))
                .andExpect(jsonPath("$.totalVehicles").value(10));
    }

    @Test
    @DisplayName("POST /api/v1/report/saved should return 400 when validation fails")
    void testSaveReportValidationFailure() throws Exception {
        SavedReportDto invalidDto = new SavedReportDto(); // required name and type missing

        mockMvc.perform(post("/api/v1/report/saved")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed for one or more fields"));
    }

    @Test
    @DisplayName("POST /api/v1/report/saved should return 201 when request is valid")
    void testSaveReportSuccess() throws Exception {
        SavedReportDto validDto = SavedReportDto.builder()
                .name("Quarterly Fuel Consumption")
                .type("fuel")
                .build();

        SavedReportDto savedDto = SavedReportDto.builder()
                .id(sampleId)
                .name("Quarterly Fuel Consumption")
                .type("fuel")
                .generatedAt(LocalDateTime.now())
                .build();

        when(reportService.saveReport(any(SavedReportDto.class))).thenReturn(savedDto);

        mockMvc.perform(post("/api/v1/report/saved")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(sampleId.toString()))
                .andExpect(jsonPath("$.name").value("Quarterly Fuel Consumption"));
    }

    @Test
    @DisplayName("GET /api/v1/report/saved/{id} should return 404 when report not found")
    void testGetSavedReportNotFound() throws Exception {
        when(reportService.getSavedReportById(sampleId)).thenThrow(new ResourceNotFoundException("Saved report with ID '" + sampleId + "' not found"));

        mockMvc.perform(get("/api/v1/report/saved/" + sampleId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("DELETE /api/v1/report/saved/{id} should return 204")
    void testDeleteSavedReport() throws Exception {
        doNothing().when(reportService).deleteSavedReport(sampleId);

        mockMvc.perform(delete("/api/v1/report/saved/" + sampleId))
                .andExpect(status().isNoContent());
    }
}

