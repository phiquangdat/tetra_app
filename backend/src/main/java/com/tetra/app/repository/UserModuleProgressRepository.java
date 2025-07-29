package com.tetra.app.repository;

import com.tetra.app.model.UserModuleProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserModuleProgressRepository extends JpaRepository<UserModuleProgress, UUID> {
    Optional<UserModuleProgress> findByUser_IdAndModule_Id(UUID userId, UUID moduleId);
    List<UserModuleProgress> findByUser_Id(UUID userId);
    List<UserModuleProgress> findByModule_Id(UUID moduleId);
}
