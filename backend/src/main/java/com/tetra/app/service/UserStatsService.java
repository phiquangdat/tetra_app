package com.tetra.app.service;

import com.tetra.app.model.ProgressStatus;
import com.tetra.app.model.UserModuleProgress;
import com.tetra.app.repository.UserContentProgressRepository;
import com.tetra.app.repository.UserModuleProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserStatsService {
    private final UserContentProgressRepository userContentProgressRepository;
    private final UserModuleProgressRepository userModuleProgressRepository;

    @Autowired
    public UserStatsService(
        UserContentProgressRepository userContentProgressRepository,
        UserModuleProgressRepository userModuleProgressRepository
    ) {
        this.userContentProgressRepository = userContentProgressRepository;
        this.userModuleProgressRepository = userModuleProgressRepository;
    }

    // Unified logic: only modules with topic, only IN_PROGRESS/COMPLETED
    private List<UserModuleProgress> getRelevantModuleProgress(UUID userId) {
        var progresses = userModuleProgressRepository.findByUser_Id(userId);
        return progresses.stream()
            .filter(p -> p.getModule() != null && p.getModule().getTopic() != null)
            .filter(p -> p.getStatus() == ProgressStatus.IN_PROGRESS || p.getStatus() == ProgressStatus.COMPLETED)
            .collect(Collectors.toList());
    }

    public int getTotalPoints(UUID userId) {
        // Sum earnedPoints for relevant modules
        return getRelevantModuleProgress(userId).stream()
            .mapToInt(UserModuleProgress::getEarnedPoints)
            .sum();
    }

    public List<Map<String, Object>> getTopicPoints(UUID userId) {
        // Group earnedPoints by topic for relevant modules
        Map<String, Integer> topicToPoints = new HashMap<>();
        for (var progress : getRelevantModuleProgress(userId)) {
            String topic = progress.getModule().getTopic();
            int points = progress.getEarnedPoints();
            topicToPoints.merge(topic, points, Integer::sum);
        }
        // Sort by points desc
        return topicToPoints.entrySet().stream()
            .sorted((a, b) -> Integer.compare(b.getValue(), a.getValue()))
            .map(e -> {
                Map<String, Object> map = new HashMap<>();
                map.put("topic", e.getKey());
                map.put("points", e.getValue());
                return map;
            })
            .collect(Collectors.toList());
    }

    public int getCompletedModules(UUID userId) {
        return userModuleProgressRepository.findByUser_IdAndStatus(userId, ProgressStatus.COMPLETED).size();
    }

    public int getInProgressModules(UUID userId) {
        return userModuleProgressRepository.findByUser_IdAndStatus(userId, ProgressStatus.IN_PROGRESS).size();
    }
}
