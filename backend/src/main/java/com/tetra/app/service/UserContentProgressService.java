package com.tetra.app.service;

import com.tetra.app.model.UserContentProgress;
import com.tetra.app.repository.UserContentProgressRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class UserContentProgressService {

    private final UserContentProgressRepository repository;

    public UserContentProgressService(UserContentProgressRepository repository) {
        this.repository = repository;
    }

    public UserContentProgress create(UserContentProgress progress) {
        return repository.save(progress);
    }

    public UserContentProgress update(UserContentProgress progress) {
        return repository.save(progress);
    }

    public Optional<UserContentProgress> getByUserAndContent(UUID userId, UUID unitContentId) {
        return repository.findByUser_IdAndUnitContent_Id(userId, unitContentId);
    }
}
