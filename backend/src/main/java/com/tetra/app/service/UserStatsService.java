package com.tetra.app.service;

import com.tetra.app.repository.UserContentProgressRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserStatsService {
    private final UserContentProgressRepository userContentProgressRepository;

    public UserStatsService(UserContentProgressRepository userContentProgressRepository) {
        this.userContentProgressRepository = userContentProgressRepository;
    }

    public int getTotalPoints(UUID userId) {
        return userContentProgressRepository.sumCompletedPointsByUserId(userId);
    }

    public int getCompletedModules(UUID userId) {
        return userModuleProgressRepository.findByUser_IdAndStatus(userId, ProgressStatus.COMPLETED).size();
    }

    public int getInProgressModules(UUID userId) {
        return userModuleProgressRepository.findByUser_IdAndStatus(userId, ProgressStatus.IN_PROGRESS).size();
    }
}
