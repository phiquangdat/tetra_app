package com.tetra.app.repository;

import com.tetra.app.model.TrainingModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrainingModuleRepository extends JpaRepository<TrainingModule, Long> {
}
