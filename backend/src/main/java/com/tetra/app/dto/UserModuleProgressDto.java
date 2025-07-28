package com.tetra.app.dto;

import com.tetra.app.model.ProgressStatus;
import java.util.UUID;

public class UserModuleProgressDto {
    private UUID id;
    private UUID user_id;
    private UUID module_id;
    private UUID last_visited_unit_id;
    private UUID last_visited_content_id;
    private ProgressStatus status;
    private int earned_points;

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUser_id() { return user_id; }
    public void setUser_id(UUID user_id) { this.user_id = user_id; }

    public UUID getModule_id() { return module_id; }
    public void setModule_id(UUID module_id) { this.module_id = module_id; }

    public UUID getLast_visited_unit_id() { return last_visited_unit_id; }
    public void setLast_visited_unit_id(UUID last_visited_unit_id) { this.last_visited_unit_id = last_visited_unit_id; }

    public UUID getLast_visited_content_id() { return last_visited_content_id; }
    public void setLast_visited_content_id(UUID last_visited_content_id) { this.last_visited_content_id = last_visited_content_id; }

    public ProgressStatus getStatus() { return status; }
    public void setStatus(ProgressStatus status) { this.status = status; }

    public int getEarned_points() { return earned_points; }
    public void setEarned_points(int earned_points) { this.earned_points = earned_points; }
}
