package com.tetra.app.model;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class TestResultTest {

    @Test
    void testGettersAndSetters() {
        TestResult result = new TestResult();
        LocalDateTime now = LocalDateTime.now();

        result.setId(1L);
        result.setEmployeeName("Alice");
        result.setTestName("Spring");
        result.setScore(100);
        result.setTestDate(now);

        assertEquals(1L, result.getId());
        assertEquals("Alice", result.getEmployeeName());
        assertEquals("Spring", result.getTestName());
        assertEquals(100, result.getScore());
        assertEquals(now, result.getTestDate());
    }
}
