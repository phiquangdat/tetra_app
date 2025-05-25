package com.tetra.app.service;

import com.tetra.app.model.TestResult;
import com.tetra.app.repository.TestResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class TestResultService {

    private final TestResultRepository testResultRepository;

    @Autowired
    public TestResultService(TestResultRepository testResultRepository) {
        this.testResultRepository = testResultRepository;
    }

    public TestResult addTestResult(String employeeName, String testName, Integer score) {
        TestResult testResult = new TestResult();
        testResult.setEmployeeName(employeeName);
        testResult.setTestName(testName);
        testResult.setScore(score);
        testResult.setTestDate(LocalDateTime.now());

        return testResultRepository.save(testResult);
    }
}
