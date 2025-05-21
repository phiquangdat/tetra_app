package com.tetra.app.controller;

import com.tetra.app.model.TestResult;
import com.tetra.app.service.TestResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test-results")
public class TestResultController {

    private final TestResultService testResultService;

    @Autowired
    public TestResultController(TestResultService testResultService) {
        this.testResultService = testResultService;
    }

    @PostMapping
    public ResponseEntity<TestResult> addTestResult(@RequestParam String employeeName,
                                                    @RequestParam String testName,
                                                    @RequestParam Integer score) {
        TestResult testResult = testResultService.addTestResult(employeeName, testName, score);
        return ResponseEntity.ok(testResult);
    }
}
