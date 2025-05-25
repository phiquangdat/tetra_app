package com.tetra.app.repository;

import com.tetra.app.model.TestResult;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class TestResultRepositoryTest {

    @Autowired
    private TestResultRepository repository;

    @Test
    void testSaveAndFind() {
        TestResult result = new TestResult();
        result.setEmployeeName("Bob");
        result.setTestName("SQL");
        result.setScore(88);
        result.setTestDate(LocalDateTime.now());

        TestResult saved = repository.save(result);
        assertNotNull(saved.getId());

        TestResult found = repository.findById(saved.getId()).orElse(null);
        assertNotNull(found);
        assertEquals("Bob", found.getEmployeeName());
    }
}
