package com.tetra.app.service;

import com.tetra.app.model.TestResult;
import com.tetra.app.repository.TestResultRepository;
import org.junit.jupiter.api.Test;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class TestResultServiceTest {

    @Test
    void testAddTestResult() {
        TestResultRepository repo = mock(TestResultRepository.class);
        TestResultService service = new TestResultService(repo);

        when(repo.save(any(TestResult.class))).thenAnswer(i -> i.getArgument(0));

        TestResult result = service.addTestResult("Eve", "Math", 77);

        assertEquals("Eve", result.getEmployeeName());
        assertEquals("Math", result.getTestName());
        assertEquals(77, result.getScore());
        assertNotNull(result.getTestDate());
        verify(repo).save(any(TestResult.class));
    }
}
