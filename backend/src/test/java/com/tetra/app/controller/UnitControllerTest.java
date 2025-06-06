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
    void testGetAllUnits() {
        Unit unit1 = new Unit(null, "Unit 1", "Description 1");
        Unit unit2 = new Unit(null, "Unit 2", "Description 2");
        List<Unit> mockUnits = List.of(unit1, unit2);

        when(unitRepository.findAll()).thenReturn(mockUnits);

        ResponseEntity<List<Unit>> response = unitController.getAllUnits();

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        verify(unitRepository, times(1)).findAll();
    }

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
}
