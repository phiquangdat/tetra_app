package com.tetra.app.repository;

import com.tetra.app.model.UserUnitProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserUnitProgressRepository extends JpaRepository<UserUnitProgress, UUID> {
    Optional<UserUnitProgress> findByUser_IdAndUnit_Id(UUID userId, UUID unitId);
    List<UserUnitProgress> findByUser_IdAndModule_Id(UUID userId, UUID moduleId);
}
