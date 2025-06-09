package com.tetra.app.controller;

import com.tetra.app.model.Unit;
import com.tetra.app.repository.UnitRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UnitControllerTest {

    @Mock
    private UnitRepository unitRepository;

    @InjectMocks
    private UnitController unitController;

    @Test
    void testGetUnitById_Success() {
        UUID unitId = UUID.randomUUID();
        Unit mockUnit = new Unit(null, "Unit 1", "Description 1");

        when(unitRepository.findById(unitId)).thenReturn(Optional.of(mockUnit));

        ResponseEntity<Unit> response = unitController.getUnitById(unitId.toString());

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(mockUnit, response.getBody());
        verify(unitRepository, times(1)).findById(unitId);
    }

    @Test
    void testGetUnitById_NotFound() {
        UUID unitId = UUID.randomUUID();

        when(unitRepository.findById(unitId)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> unitController.getUnitById(unitId.toString()));

        assertEquals(404, exception.getStatusCode().value());
        assertEquals("Unit is not found with id: " + unitId, exception.getReason());
        verify(unitRepository, times(1)).findById(unitId);
    }

    @Test
    void testGetUnitsByModuleId_ReturnsCorrectUnits() {
        UUID moduleId = UUID.randomUUID();
        Unit unit1 = new Unit();
        unit1.setId(UUID.randomUUID());
        unit1.setTitle("Unit 1");
        Unit unit2 = new Unit();
        unit2.setId(UUID.randomUUID());
        unit2.setTitle("Unit 2");

        when(unitRepository.findByModule_Id(moduleId)).thenReturn(List.of(unit1, unit2));

        ResponseEntity<?> response = unitController.getUnitsByModuleId(moduleId);

        assertEquals(200, response.getStatusCode().value());
        List<?> body = (List<?>) response.getBody();
        assertEquals(2, body.size());
        Map<?, ?> first = (Map<?, ?>) body.get(0);
        assertTrue(first.containsKey("id"));
        assertTrue(first.containsKey("title"));
    }

    @Test
    void testGetUnitsByModuleId_MissingModuleId() {
        ResponseEntity<?> response = unitController.getUnitsByModuleId(null);
        assertEquals(400, response.getStatusCode().value());
        assertEquals("moduleId query parameter is required", response.getBody());
    }
}
