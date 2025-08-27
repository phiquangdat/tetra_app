package com.tetra.app.controller;

import com.tetra.app.repository.UserRepository;
import com.tetra.app.model.Role;
import com.tetra.app.repository.TrainingModuleRepository;
import com.tetra.app.repository.UserModuleProgressRepository;
import com.tetra.app.repository.UserContentProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/stats")
public class AdminStatsController {

    private final UserRepository userRepository;
    private final TrainingModuleRepository trainingModuleRepository;
    private final UserModuleProgressRepository userModuleProgressRepository;
    private final UserContentProgressRepository userContentProgressRepository;

    @Autowired
    public AdminStatsController(
            UserRepository userRepository,
            TrainingModuleRepository trainingModuleRepository,
            UserModuleProgressRepository userModuleProgressRepository,
            UserContentProgressRepository userContentProgressRepository
    ) {
        this.userRepository = userRepository;
        this.trainingModuleRepository = trainingModuleRepository;
        this.userModuleProgressRepository = userModuleProgressRepository;
        this.userContentProgressRepository = userContentProgressRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        long totalUsers = userRepository.countByRole(Role.LEARNER);
        long totalPointsIssued = userContentProgressRepository.sumAllCompletedPoints();
        long activeModules = trainingModuleRepository.countByStatus("published");

        Map<String, Object> stats = new HashMap<>();
        stats.put("total_users", totalUsers);
        stats.put("total_points_issued", totalPointsIssued);
        stats.put("active_modules", activeModules);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/module-completions-by-topic")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getModuleCompletionsByTopic() {
        var results = userModuleProgressRepository.findModuleCompletionsPerTopic();
        var response = new java.util.ArrayList<java.util.Map<String, Object>>();
        for (var row : results) {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("topic", row.getTopic());
            map.put("completions", row.getCompletions());
            response.add(map);
        }
        return ResponseEntity.ok(response);
    }
}