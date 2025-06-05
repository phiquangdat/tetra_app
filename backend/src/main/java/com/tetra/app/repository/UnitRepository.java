package com.tetra.app.repository;

import com.tetra.app.model.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface UnitRepository extends JpaRepository<Unit, UUID> {
}
