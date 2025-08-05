package com.tetra.app.service;

import com.tetra.app.model.UserContentProgress;
import com.tetra.app.repository.UserContentProgressRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserContentProgressServiceTest {

    private UserContentProgressRepository repository;
    private UserContentProgressService service;

    @BeforeEach
    void setUp() {
        repository = mock(UserContentProgressRepository.class);
        service = new UserContentProgressService(repository);
    }

    @Test
    void testCreate() {
        UserContentProgress progress = new UserContentProgress();
        when(repository.save(progress)).thenReturn(progress);
        UserContentProgress result = service.create(progress);
        assertEquals(progress, result);
    }

    @Test
    void testUpdate() {
        UserContentProgress progress = new UserContentProgress();
        when(repository.save(progress)).thenReturn(progress);
        UserContentProgress result = service.update(progress);
        assertEquals(progress, result);
    }

    @Test
    void testGetByUserAndContent() {
        UUID userId = UUID.randomUUID();
        UUID contentId = UUID.randomUUID();
        UserContentProgress progress = new UserContentProgress();
        when(repository.findByUser_IdAndUnitContent_Id(userId, contentId)).thenReturn(Optional.of(progress));
        Optional<UserContentProgress> result = service.getByUserAndContent(userId, contentId);
        assertTrue(result.isPresent());
        assertEquals(progress, result.get());
    }
}
