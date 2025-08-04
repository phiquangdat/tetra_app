package com.tetra.app.service;

import com.tetra.app.model.UserUnitProgress;
import com.tetra.app.repository.UserUnitProgressRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class UserUnitProgressService {

    private final UserUnitProgressRepository repository;

    public UserUnitProgressService(UserUnitProgressRepository repository) {
        this.repository = repository;
    }

    public UserUnitProgress create(UserUnitProgress progress) {
        return repository.save(progress);
    }

    public Optional<UserUnitProgress> getByUserAndUnit(UUID userId, UUID unitId) {
        return repository.findByUser_IdAndUnit_Id(userId, unitId);
    }

    public UserUnitProgress update(UserUnitProgress progress) {
        return repository.save(progress);
    }
}
