package com.tetra.app.mapper;

import com.tetra.app.model.UserContentProgress;
import com.tetra.app.dto.UserContentProgressDto;

public class UserContentProgressMapper {
    public static UserContentProgressDto toDto(UserContentProgress entity) {
        UserContentProgressDto dto = new UserContentProgressDto();
        dto.id = entity.getId();
        dto.userId = entity.getUser().getId();
        dto.unitId = entity.getUnit().getId();
        dto.unitContentId = entity.getUnitContent().getId();
        dto.status = entity.getStatus();
        dto.points = entity.getPoints();
        return dto;
    }
}
