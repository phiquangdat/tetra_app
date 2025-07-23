package com.tetra.app.controller;

import com.tetra.app.model.TrainingModule;
import com.tetra.app.model.Unit;
import com.tetra.app.repository.TrainingModuleRepository;
import com.tetra.app.repository.UnitRepository;
import com.tetra.app.security.JwtUtil;
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

    @Mock
    private TrainingModuleRepository trainingModuleRepository;

    @Mock
    private JwtUtil jwtUtil;

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
        Unit unit1 = new Unit();
        unit1.setId(UUID.randomUUID());
        unit1.setTitle("Unit 1");
        Unit unit2 = new Unit();
        unit2.setId(UUID.randomUUID());
        unit2.setTitle("Unit 2");

        when(unitRepository.findAll()).thenReturn(List.of(unit1, unit2));

        ResponseEntity<?> response = unitController.getUnitsByModuleId(null);

        assertEquals(200, response.getStatusCode().value());
        List<?> body = (List<?>) response.getBody();
        assertEquals(2, body.size());
    }

    @Test
    void testCreateUnit_Success() {
        UUID moduleId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        TrainingModule module = new TrainingModule();
        module.setId(moduleId);

        when(trainingModuleRepository.findById(moduleId)).thenReturn(Optional.of(module));

        Map<String, Object> body = Map.of(
                "module_id", "00000000-0000-0000-0000-000000000001",
                "title", "Test Unit",
                "description", "Test Description"
        );

        Unit savedUnit = new Unit(module, "Test Unit", "Test Description");
        when(unitRepository.save(any(Unit.class))).thenReturn(savedUnit);

        ResponseEntity<?> response = unitController.createUnit(body);

        assertEquals(201, response.getStatusCode().value());
        assertNotNull(response.getBody());
    }

    @Test
    void testCreateUnit_ModuleNotFound() {
        UUID moduleId = UUID.fromString("00000000-0000-0000-0000-000000000002");
        when(trainingModuleRepository.findById(moduleId)).thenReturn(Optional.empty());

        Map<String, Object> body = Map.of(
                "module_id", "00000000-0000-0000-0000-000000000002",
                "title", "Test Unit",
                "description", "Test Description"
        );

        ResponseEntity<?> response = unitController.createUnit(body);

        assertEquals(404, response.getStatusCode().value());
        assertEquals("Module not found with id: " + moduleId, response.getBody());
    }

    @Test
    void testCreateUnit_BadRequest() {
        Map<String, Object> body = Map.of();

        ResponseEntity<?> response = unitController.createUnit(body);
        assertEquals(400, response.getStatusCode().value());
        assertEquals("module_id, title, and description are required", response.getBody());
    }

    
    @Test
    void testUpdateUnit_Success() {
        UUID unitId = UUID.randomUUID();
        Unit existingUnit = new Unit(null, "Old Title", "Old Description");

        when(unitRepository.findById(unitId)).thenReturn(Optional.of(existingUnit));
        when(unitRepository.save(any(Unit.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Map<String, Object> updateBody = Map.of(
                "title", "New Title",
                "description", "New Description"
        );

        ResponseEntity<?> response = unitController.updateUnit(unitId, updateBody);

        assertEquals(200, response.getStatusCodeValue());
        Unit updatedUnit = (Unit) response.getBody();
        assertNotNull(updatedUnit);
        assertEquals("New Title", updatedUnit.getTitle());
        assertEquals("New Description", updatedUnit.getDescription());

        verify(unitRepository, times(1)).findById(unitId);
        verify(unitRepository, times(1)).save(existingUnit);
    }

    @Test
    void testUpdateUnit_PartialUpdate_TitleOnly() {
        UUID unitId = UUID.randomUUID();
        Unit existingUnit = new Unit(null, "Old Title", "Old Description");

        when(unitRepository.findById(unitId)).thenReturn(Optional.of(existingUnit));
        when(unitRepository.save(any(Unit.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Map<String, Object> updateBody = Map.of("title", "New Title");

        ResponseEntity<?> response = unitController.updateUnit(unitId, updateBody);

        assertEquals(200, response.getStatusCodeValue());
        Unit updatedUnit = (Unit) response.getBody();
        assertNotNull(updatedUnit);
        assertEquals("New Title", updatedUnit.getTitle());
        assertEquals("Old Description", updatedUnit.getDescription());

        verify(unitRepository, times(1)).findById(unitId);
        verify(unitRepository, times(1)).save(existingUnit);
    }

    @Test
    void testUpdateUnit_PartialUpdate_DescriptionOnly() {
        UUID unitId = UUID.randomUUID();
        Unit existingUnit = new Unit(null, "Old Title", "Old Description");

        when(unitRepository.findById(unitId)).thenReturn(Optional.of(existingUnit));
        when(unitRepository.save(any(Unit.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Map<String, Object> updateBody = Map.of("description", "New Description");

        ResponseEntity<?> response = unitController.updateUnit(unitId, updateBody);

        assertEquals(200, response.getStatusCodeValue());
        Unit updatedUnit = (Unit) response.getBody();
        assertNotNull(updatedUnit);
        assertEquals("Old Title", updatedUnit.getTitle());
        assertEquals("New Description", updatedUnit.getDescription());

        verify(unitRepository, times(1)).findById(unitId);
        verify(unitRepository, times(1)).save(existingUnit);
    }

    @Test
    void testUpdateUnit_UnitNotFound() {
        UUID unitId = UUID.randomUUID();

        when(unitRepository.findById(unitId)).thenReturn(Optional.empty());

        Map<String, Object> updateBody = Map.of("title", "New Title");

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            unitController.updateUnit(unitId, updateBody);
        });

        assertEquals(404, exception.getStatusCode().value());
        assertEquals("Unit not found with id: " + unitId, exception.getReason());

        verify(unitRepository, times(1)).findById(unitId);
        verify(unitRepository, never()).save(any());
    }

     @Test
    void testDeleteUnit_AdminSuccess() {
        UUID unitId = UUID.randomUUID();
        String token = "validtoken";
        String authHeader = "Bearer " + token;

        when(jwtUtil.extractRole(token)).thenReturn("ADMIN");
        when(unitRepository.existsById(unitId)).thenReturn(true);

        ResponseEntity<?> response = unitController.deleteUnit(unitId, authHeader);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("Unit deleted", response.getBody());
        verify(unitRepository, times(1)).deleteById(unitId);
    }

    @Test
    void testDeleteUnit_ForbiddenForNonAdmin() {
        UUID unitId = UUID.randomUUID();
        String token = "usertoken";
        String authHeader = "Bearer " + token;

        when(jwtUtil.extractRole(token)).thenReturn("LEARNER");

        ResponseEntity<?> response = unitController.deleteUnit(unitId, authHeader);

        assertEquals(403, response.getStatusCodeValue());
        assertEquals("Access denied", response.getBody());
        verify(unitRepository, never()).deleteById(any());
    }

    @Test
    void testDeleteUnit_UnauthorizedMissingHeader() {
        UUID unitId = UUID.randomUUID();

        ResponseEntity<?> response = unitController.deleteUnit(unitId, null);

        assertEquals(401, response.getStatusCodeValue());
        assertEquals("Missing or invalid Authorization header", response.getBody());
        verify(unitRepository, never()).deleteById(any());
    }

    @Test
    void testDeleteUnit_UnauthorizedInvalidToken() {
        UUID unitId = UUID.randomUUID();
        String token = "badtoken";
        String authHeader = "Bearer " + token;

        when(jwtUtil.extractRole(token)).thenThrow(new RuntimeException("Invalid token"));

        ResponseEntity<?> response = unitController.deleteUnit(unitId, authHeader);

        assertEquals(401, response.getStatusCodeValue());
        assertEquals("Invalid token", response.getBody());
        verify(unitRepository, never()).deleteById(any());
    }

    @Test
    void testDeleteUnit_NotFound() {
        UUID unitId = UUID.randomUUID();
        String token = "validtoken";
        String authHeader = "Bearer " + token;

        when(jwtUtil.extractRole(token)).thenReturn("ADMIN");
        when(unitRepository.existsById(unitId)).thenReturn(false);

        ResponseEntity<?> response = unitController.deleteUnit(unitId, authHeader);

        assertEquals(404, response.getStatusCodeValue());
        assertEquals("Unit not found with id: " + unitId, response.getBody());
        verify(unitRepository, never()).deleteById(any());
    }
}
