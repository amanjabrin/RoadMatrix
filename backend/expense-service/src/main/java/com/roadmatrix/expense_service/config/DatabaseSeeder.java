package com.roadmatrix.expense_service.config;

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
        Integer count = jdbcTemplate.queryForObject("SELECT count(*) FROM expenses", Integer.class);
        if (count != null && count == 0) {
            String insertSql = "INSERT INTO expenses (id, vehicle_id, trip_id, category, amount, date, status, description, company_id, created_at, updated_at) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";

            UUID companyId = UUID.fromString("11111111-1111-1111-1111-111111111111");

            UUID v1 = UUID.fromString("c0a80101-1111-1111-1111-111111111111");
            UUID v3 = UUID.fromString("c0a80101-1111-1111-1111-333333333333");
            UUID v5 = UUID.fromString("c0a80101-1111-1111-1111-555555555555");
            UUID v6 = UUID.fromString("c0a80101-1111-1111-1111-666666666666");

            UUID t1 = UUID.fromString("b0a80101-1111-1111-1111-111111111111");
            UUID t2 = UUID.fromString("b0a80101-1111-1111-1111-222222222222");
            UUID t3 = UUID.fromString("b0a80101-1111-1111-1111-333333333333");
            UUID t4 = UUID.fromString("b0a80101-1111-1111-1111-444444444444");

            // e1
            jdbcTemplate.update(insertSql, UUID.fromString("e0a80101-1111-1111-1111-111111111111"), v1, t3, "fuel", 15400.0, LocalDate.parse("2026-02-14"), "approved", "Diesel purchase at Shell fuel station", companyId);
            // e2
            jdbcTemplate.update(insertSql, UUID.fromString("e0a80101-1111-1111-1111-222222222222"), v1, t3, "toll", 1200.0, LocalDate.parse("2026-02-14"), "approved", "Fastag toll collection Mumbai-Ahmedabad Expressway", companyId);
            // e3
            jdbcTemplate.update(insertSql, UUID.fromString("e0a80101-1111-1111-1111-333333333333"), v1, null, "maintenance", 8400.0, LocalDate.parse("2026-02-22"), "approved", "Brake pads replacement", companyId);
            // e4
            jdbcTemplate.update(insertSql, UUID.fromString("e0a80101-1111-1111-1111-444444444444"), v3, t1, "driver_allowance", 2500.0, LocalDate.parse("2026-02-18"), "approved", "Outstation food and night halt allowance", companyId);
            // e5
            jdbcTemplate.update(insertSql, UUID.fromString("e0a80101-1111-1111-1111-555555555555"), v3, t1, "fuel", 18500.0, LocalDate.parse("2026-02-18"), "pending", "Diesel fill up at HPCL outlet", companyId);
            // e6
            jdbcTemplate.update(insertSql, UUID.fromString("e0a80101-1111-1111-1111-666666666666"), v5, t2, "miscellaneous", 450.0, LocalDate.parse("2026-02-19"), "approved", "Cargo ropes and straps buying", companyId);
            // e7
            jdbcTemplate.update(insertSql, UUID.fromString("e0a80101-1111-1111-1111-777777777777"), v5, t2, "toll", 350.0, LocalDate.parse("2026-02-19"), "approved", "Toll collection Pune road", companyId);
            // e8
            jdbcTemplate.update(insertSql, UUID.fromString("e0a80101-1111-1111-1111-888888888888"), v6, t4, "fuel", 2400.0, LocalDate.parse("2026-02-20"), "approved", "Gasoline refuel Maruti van", companyId);
        }
    }
}
