package com.tetra.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.UUID;

public class PatchUserModuleProgressRequest {

    @JsonProperty("lastVisitedUnit")
    private UUID lastVisitedUnitId;

    @JsonProperty("lastVisitedContent")
    private UUID lastVisitedContentId;

    @JsonProperty("status")
    private String status;

    @JsonProperty("earnedPoints")
    private Integer earnedPoints;

    public UUID getLastVisitedUnitId() {
        return lastVisitedUnitId;
    }

    public void setLastVisitedUnitId(UUID lastVisitedUnitId) {
        this.lastVisitedUnitId = lastVisitedUnitId;
    }

    public UUID getLastVisitedContentId() {
        return lastVisitedContentId;
    }

    public void setLastVisitedContentId(UUID lastVisitedContentId) {
        this.lastVisitedContentId = lastVisitedContentId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getEarnedPoints() {
        return earnedPoints;
    }

    public void setEarnedPoints(Integer earnedPoints) {
        this.earnedPoints = earnedPoints;
    }
}