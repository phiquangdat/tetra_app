package com.tetra.app.controller;

import com.tetra.app.model.TestResult;
import com.tetra.app.service.TestResultService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.lang.SuppressWarnings;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TestResultController.class)
@SuppressWarnings("removal")
class TestResultControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TestResultService testResultService;

    @Test
    void testAddTestResult() throws Exception {
        TestResult result = new TestResult();
        result.setId(1L);
        result.setEmployeeName("John");
        result.setTestName("Java");
        result.setScore(95);
        result.setTestDate(LocalDateTime.now());

        when(testResultService.addTestResult("John", "Java", 95)).thenReturn(result);

        mockMvc.perform(post("/api/test-results")
                .param("employeeName", "John")
                .param("testName", "Java")
                .param("score", "95"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employeeName").value("John"))
                .andExpect(jsonPath("$.testName").value("Java"))
                .andExpect(jsonPath("$.score").value(95));
    }
}
