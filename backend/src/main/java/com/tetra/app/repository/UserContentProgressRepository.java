package com.tetra.app.repository;

import com.tetra.app.model.UserContentProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserContentProgressRepository extends JpaRepository<UserContentProgress, UUID> {
    List<UserContentProgress> findByUnitContent_Id(UUID unitContentId);
    Optional<UserContentProgress> findByUser_IdAndUnitContent_Id(UUID userId, UUID unitContentId);
    List<UserContentProgress> findByUser_IdAndUnit_Id(UUID userId, UUID unitId);

    @Query("SELECT COALESCE(SUM(u.points), 0) FROM UserContentProgress u WHERE u.user.id = :userId AND UPPER(u.status) = 'COMPLETED'")
    int sumCompletedPointsByUserId(@Param("userId") UUID userId);

    @Query("SELECT COALESCE(SUM(u.points), 0) FROM UserContentProgress u WHERE UPPER(u.status) = 'COMPLETED'")
    long sumAllCompletedPoints();
}
