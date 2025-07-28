package com.tetra.app.service;

import com.tetra.app.model.UserModuleProgress;
import com.tetra.app.model.ProgressStatus;
import com.tetra.app.repository.UserModuleProgressRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserModuleProgressServiceTest {

    private UserModuleProgressRepository repository;
    private UserModuleProgressService service;

    @BeforeEach
    void setUp() {
        repository = mock(UserModuleProgressRepository.class);
        service = new UserModuleProgressService(repository);
    }

    @Test
    void testFindAll() {
        List<UserModuleProgress> list = List.of(new UserModuleProgress(), new UserModuleProgress());
        when(repository.findAll()).thenReturn(list);

        List<UserModuleProgress> result = service.findAll();
        assertThat(result).hasSize(2);
    }

    @Test
    void testFindById() {
        UUID id = UUID.randomUUID();
        UserModuleProgress progress = new UserModuleProgress();
        when(repository.findById(id)).thenReturn(Optional.of(progress));

        Optional<UserModuleProgress> result = service.findById(id);
        assertTrue(result.isPresent());
        assertEquals(progress, result.get());
    }

    @Test
    void testSave() {
        UserModuleProgress progress = new UserModuleProgress();
        when(repository.save(progress)).thenReturn(progress);

        UserModuleProgress result = service.save(progress);
        assertEquals(progress, result);
    }

    @Test
    void testDeleteById() {
        UUID id = UUID.randomUUID();
        service.deleteById(id);
        verify(repository, times(1)).deleteById(id);
    }

    @Test
    void testUpdateStatus() {
        UUID id = UUID.randomUUID();
        UserModuleProgress progress = new UserModuleProgress();
        progress.setStatus(ProgressStatus.NOT_STARTED);

        when(repository.findById(id)).thenReturn(Optional.of(progress));
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        UserModuleProgress updated = service.updateStatus(id, ProgressStatus.COMPLETED);

        assertEquals(ProgressStatus.COMPLETED, updated.getStatus());
        verify(repository).save(progress);
    }

    @Test
    void testUpdateStatus_NotFound() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> service.updateStatus(id, ProgressStatus.IN_PROGRESS));
    }
}
