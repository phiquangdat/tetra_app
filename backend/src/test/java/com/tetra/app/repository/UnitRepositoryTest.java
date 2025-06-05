package com.tetra.app.repository;

import com.tetra.app.model.Unit;
import com.tetra.app.model.TrainingModule;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import static org.junit.jupiter.api.Assertions.*;

import java.util.UUID;

@ExtendWith(SpringExtension.class)
@DataJpaTest
class UnitRepositoryTest {

    @Autowired
    private UnitRepository unitRepository;

    @Test
    void testSaveAndFindUnit() {
        TrainingModule module = new TrainingModule(); // Assuming a simple module entity
        Unit unit = new Unit(module, "Test Unit", "Unit Description");

        Unit savedUnit = unitRepository.save(unit);
        assertNotNull(savedUnit.getId());

        Unit retrievedUnit = unitRepository.findById(savedUnit.getId()).orElse(null);
        assertNotNull(retrievedUnit);
        assertEquals("Test Unit", retrievedUnit.getTitle());
        assertEquals("Unit Description", retrievedUnit.getDescription());
    }

    @Test
    void testDeleteUnit() {
        TrainingModule module = new TrainingModule();
        Unit unit = new Unit(module, "Another Unit", "Another Description");
        Unit savedUnit = unitRepository.save(unit);

        unitRepository.delete(savedUnit);
        assertFalse(unitRepository.findById(savedUnit.getId()).isPresent());
    }
}
