package com.tetra.app.service;

import com.tetra.app.model.UserModuleProgress;
import com.tetra.app.model.ProgressStatus;
import com.tetra.app.repository.UserModuleProgressRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserModuleProgressService {

    private final UserModuleProgressRepository repository;

    public UserModuleProgressService(UserModuleProgressRepository repository) {
        this.repository = repository;
    }

    public List<UserModuleProgress> findAll() {
        return repository.findAll();
    }

    public Optional<UserModuleProgress> findById(UUID id) {
        return repository.findById(id);
    }

    public UserModuleProgress save(UserModuleProgress progress) {
        return repository.save(progress);
    }

    public void deleteById(UUID id) {
        repository.deleteById(id);
    }

    public UserModuleProgress updateStatus(UUID id, ProgressStatus status) {
        UserModuleProgress progress = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Progress not found"));
        progress.setStatus(status);
        return repository.save(progress);
    }
}
