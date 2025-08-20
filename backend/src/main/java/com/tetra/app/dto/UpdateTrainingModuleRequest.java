package com.tetra.app.dto;

import java.util.UUID;

public class UpdateTrainingModuleRequest {
    private String title;
    private String description;
    private Integer points;
    private String topic;
    private String coverUrl;
    private String status;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getCoverUrl() { return coverUrl; }
    public void setCoverUrl(String coverUrl) { this.coverUrl = coverUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
