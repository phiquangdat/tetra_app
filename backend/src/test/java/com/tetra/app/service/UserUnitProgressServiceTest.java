package com.tetra.app.service;

import com.tetra.app.model.UserUnitProgress;
import com.tetra.app.repository.UserUnitProgressRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserUnitProgressServiceTest {

    private UserUnitProgressRepository repository;
    private UserUnitProgressService service;

    @BeforeEach
    void setUp() {
        repository = mock(UserUnitProgressRepository.class);
        service = new UserUnitProgressService(repository);
    }

    @Test
    void testCreate() {
        UserUnitProgress progress = new UserUnitProgress();
        when(repository.save(progress)).thenReturn(progress);
        UserUnitProgress result = service.create(progress);
        assertEquals(progress, result);
    }

    @Test
    void testGetByUserAndUnit() {
        UUID userId = UUID.randomUUID();
        UUID unitId = UUID.randomUUID();
        UserUnitProgress progress = new UserUnitProgress();
        when(repository.findByUser_IdAndUnit_Id(userId, unitId)).thenReturn(Optional.of(progress));
        Optional<UserUnitProgress> result = service.getByUserAndUnit(userId, unitId);
        assertTrue(result.isPresent());
        assertEquals(progress, result.get());
    }

    @Test
    void testUpdate() {
        UserUnitProgress progress = new UserUnitProgress();
        when(repository.save(progress)).thenReturn(progress);
        UserUnitProgress result = service.update(progress);
        assertEquals(progress, result);
    }
}
