package com.tetra.app.mapper;

import com.tetra.app.model.UserContentProgress;

public class UserContentProgressPointsMapper {
    public static int getAvailablePoints(UserContentProgress progress) {
        if (progress == null || progress.getStatus() == null) {
            return 0;
        }
        if ("IN_PROGRESS".equalsIgnoreCase(progress.getStatus())) {
            return 0;
        }
        return progress.getPoints();
    }
}
