package com.roadmatrix.report_service.service;

import com.roadmatrix.report_service.dto.SavedReportDto;
import com.roadmatrix.report_service.entity.SavedReport;
import com.roadmatrix.report_service.exception.BadRequestException;
import com.roadmatrix.report_service.exception.ResourceNotFoundException;
import com.roadmatrix.report_service.repository.SavedReportRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private SavedReportRepository savedReportRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private ReportService reportService;

    private UUID reportId;
    private UUID companyId;
    private SavedReport mockReport;

    @BeforeEach
    void setUp() {
        reportId = UUID.randomUUID();
        companyId = UUID.randomUUID();

        mockReport = SavedReport.builder()
                .id(reportId)
                .name("Monthly Fleet Utilization")
                .type("fleet")
                .generatedBy("System Administrator")
                .companyId(companyId)
                .generatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should generate fleet report and auto-audit")
    void testGenerateFleetReport() {
        List<Map<String, Object>> mockVehicles = List.of(
                Map.of("id", UUID.randomUUID().toString(), "status", "available"),
                Map.of("id", UUID.randomUUID().toString(), "status", "on_trip")
        );

        when(restTemplate.getForObject(contains("/api/v1/fleet/vehicles"), eq(List.class)))
                .thenReturn(mockVehicles);
        when(savedReportRepository.save(any(SavedReport.class))).thenReturn(mockReport);

        Map<String, Object> result = reportService.generateFleetReport(companyId);

        assertNotNull(result);
        assertEquals("Fleet Utilization", result.get("reportType"));
        assertEquals(2, result.get("totalVehicles"));
        verify(savedReportRepository, times(1)).save(any(SavedReport.class));
    }

    @Test
    @DisplayName("Should generate executive summary report")
    void testGenerateSummaryReport() {
        when(restTemplate.getForObject(contains("/api/v1/fleet/vehicles"), eq(List.class)))
                .thenReturn(List.of(Map.of("id", "v1")));
        when(restTemplate.getForObject(contains("/api/v1/driver"), eq(List.class)))
                .thenReturn(List.of(Map.of("id", "d1"), Map.of("id", "d2")));
        when(restTemplate.getForObject(contains("/api/v1/trip"), eq(List.class)))
                .thenReturn(List.of(Map.of("id", "t1")));

        Map<String, Object> summary = reportService.generateSummaryReport(companyId);

        assertNotNull(summary);
        assertEquals("Executive Fleet & Financial Summary", summary.get("reportType"));
        assertEquals(1, summary.get("totalVehicles"));
        assertEquals(2, summary.get("totalDrivers"));
        assertEquals(1, summary.get("totalTrips"));
    }

    @Test
    @DisplayName("Should save custom report successfully")
    void testSaveReportSuccess() {
        SavedReportDto dto = SavedReportDto.builder()
                .name("Q3 Financial Report")
                .type("fuel")
                .companyId(companyId)
                .build();

        when(savedReportRepository.save(any(SavedReport.class))).thenReturn(mockReport);

        SavedReportDto saved = reportService.saveReport(dto);

        assertNotNull(saved);
        assertEquals(reportId, saved.getId());
        verify(savedReportRepository, times(1)).save(any(SavedReport.class));
    }

    @Test
    @DisplayName("Should reject report saving with invalid type")
    void testSaveReportInvalidType() {
        SavedReportDto dto = SavedReportDto.builder()
                .name("Invalid Report")
                .type("space_launch")
                .companyId(companyId)
                .build();

        BadRequestException ex = assertThrows(BadRequestException.class, () -> reportService.saveReport(dto));
        assertTrue(ex.getMessage().contains("Invalid report type"));
    }

    @Test
    @DisplayName("Should get saved report by id")
    void testGetSavedReportById() {
        when(savedReportRepository.findById(reportId)).thenReturn(Optional.of(mockReport));

        SavedReportDto dto = reportService.getSavedReportById(reportId);

        assertNotNull(dto);
        assertEquals("Monthly Fleet Utilization", dto.getName());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when report does not exist")
    void testGetSavedReportNotFound() {
        UUID unknownId = UUID.randomUUID();
        when(savedReportRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> reportService.getSavedReportById(unknownId));
    }

    @Test
    @DisplayName("Should delete saved report successfully")
    void testDeleteSavedReport() {
        when(savedReportRepository.findById(reportId)).thenReturn(Optional.of(mockReport));

        assertDoesNotThrow(() -> reportService.deleteSavedReport(reportId));
        verify(savedReportRepository, times(1)).delete(mockReport);
    }
}

