package com.tetra.app.repository;

import com.tetra.app.model.UserContentProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserContentProgressRepository extends JpaRepository<UserContentProgress, UUID> {
    Optional<UserContentProgress> findByUser_IdAndUnitContent_Id(UUID userId, UUID unitContentId);
}
