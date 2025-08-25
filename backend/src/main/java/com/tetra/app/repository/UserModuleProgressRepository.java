package com.tetra.app.repository;

import com.tetra.app.model.UserModuleProgress;
import com.tetra.app.model.ProgressStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import java.util.List;

@Repository
public interface UserModuleProgressRepository extends JpaRepository<UserModuleProgress, UUID> {
    Optional<UserModuleProgress> findByUser_IdAndModule_Id(UUID userId, UUID moduleId);
    List<UserModuleProgress> findByUser_Id(UUID userId);
    List<UserModuleProgress> findByModule_Id(UUID moduleId);
    List<UserModuleProgress> findByUser_IdAndStatus(UUID userId, ProgressStatus status);

    @org.springframework.data.jpa.repository.Query("""
        SELECT m.topic as topic, COUNT(ump.id) as completions
        FROM TrainingModule m
        LEFT JOIN UserModuleProgress ump ON ump.module = m AND ump.status = 'COMPLETED'
        GROUP BY m.topic
    """)
    java.util.List<TopicCompletionsProjection> findModuleCompletionsPerTopic();

    interface TopicCompletionsProjection {
        String getTopic();
        Long getCompletions();
    }
}
