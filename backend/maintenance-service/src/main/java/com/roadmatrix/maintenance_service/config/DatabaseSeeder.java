package com.roadmatrix.maintenance_service.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        Integer count = jdbcTemplate.queryForObject("SELECT count(*) FROM maintenance_logs", Integer.class);
        if (count != null && count == 0) {
            String insertSql = "INSERT INTO maintenance_logs (id, vehicle_id, type, description, status, scheduled_date, completed_date, cost, service_provider, company_id, created_at, updated_at) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";

            UUID companyId = UUID.fromString("11111111-1111-1111-1111-111111111111");

            UUID v1 = UUID.fromString("c0a80101-1111-1111-1111-111111111111");
            UUID v2 = UUID.fromString("c0a80101-1111-1111-1111-222222222222");
            UUID v3 = UUID.fromString("c0a80101-1111-1111-1111-333333333333");
            UUID v4 = UUID.fromString("c0a80101-1111-1111-1111-444444444444");
            UUID v5 = UUID.fromString("c0a80101-1111-1111-1111-555555555555");
            UUID v6 = UUID.fromString("c0a80101-1111-1111-1111-666666666666");
            UUID v7 = UUID.fromString("c0a80101-1111-1111-1111-777777777777");
            UUID v10 = UUID.fromString("c0a80101-1111-1111-1111-aaaaaaaaaaaa");

            // m1
            jdbcTemplate.update(insertSql, UUID.fromString("a0a80101-1111-1111-1111-111111111111"), v2, "oil_change", "Engine oil and filter change", "completed", LocalDate.parse("2026-02-18"), LocalDate.parse("2026-02-18"), 5800.0, "Tata Authorised Service, Pune", companyId);
            // m2
            jdbcTemplate.update(insertSql, UUID.fromString("a0a80101-1111-1111-1111-222222222222"), v5, "tire_rotation", "Tyre rotation and alignment", "scheduled", LocalDate.parse("2026-02-20"), null, 3200.0, "Mahalaxmi Tyres, Mumbai", companyId);
            // m3
            jdbcTemplate.update(insertSql, UUID.fromString("a0a80101-1111-1111-1111-333333333333"), v1, "brake_inspection", "Brake pad inspection and replacement", "in_progress", LocalDate.parse("2026-02-22"), null, 8400.0, "Bharat Brake Centre, Mumbai", companyId);
            // m4
            jdbcTemplate.update(insertSql, UUID.fromString("a0a80101-1111-1111-1111-444444444444"), v10, "general_service", "Annual comprehensive service", "in_progress", LocalDate.parse("2026-02-19"), null, 4500.0, "TVS Service, Bengaluru", companyId);
            // m5
            jdbcTemplate.update(insertSql, UUID.fromString("a0a80101-1111-1111-1111-555555555555"), v3, "repair", "Gearbox repair", "scheduled", LocalDate.parse("2026-02-25"), null, 32000.0, "BharatBenz Service, Delhi", companyId);
            // m6
            jdbcTemplate.update(insertSql, UUID.fromString("a0a80101-1111-1111-1111-666666666666"), v7, "oil_change", "Periodic service", "scheduled", LocalDate.parse("2026-03-02"), null, 4200.0, "Tata Service, Bengaluru", companyId);
            // m7
            jdbcTemplate.update(insertSql, UUID.fromString("a0a80101-1111-1111-1111-777777777777"), v4, "tire_rotation", "Seasonal tyre rotation", "scheduled", LocalDate.parse("2026-03-05"), null, 2800.0, "Apollo Tyres, Bengaluru", companyId);
            // m8
            jdbcTemplate.update(insertSql, UUID.fromString("a0a80101-1111-1111-1111-888888888888"), v6, "brake_inspection", "Routine brake check", "scheduled", LocalDate.parse("2026-03-08"), null, 3100.0, "Maruti Service, Delhi", companyId);
        }
    }
}
