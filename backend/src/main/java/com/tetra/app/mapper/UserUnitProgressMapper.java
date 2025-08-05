package com.tetra.app.mapper;

import com.tetra.app.dto.UserUnitProgressDto;
import com.tetra.app.model.UserUnitProgress;
import com.tetra.app.model.User;
import com.tetra.app.model.TrainingModule;
import com.tetra.app.model.Unit;

public class UserUnitProgressMapper {
    public static UserUnitProgressDto toDto(UserUnitProgress entity) {
        UserUnitProgressDto dto = new UserUnitProgressDto();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUser() != null ? entity.getUser().getId() : null);
        dto.setModuleId(entity.getModule() != null ? entity.getModule().getId() : null);
        dto.setUnitId(entity.getUnit() != null ? entity.getUnit().getId() : null);
        dto.setStatus(entity.getStatus());
        return dto;
    }

    public static UserUnitProgress toEntity(UserUnitProgressDto dto) {
        UserUnitProgress entity = new UserUnitProgress();
        entity.setId(dto.getId());
        if (dto.getUserId() != null) {
            User user = new User();
            user.setId(dto.getUserId());
            entity.setUser(user);
        }
        if (dto.getModuleId() != null) {
            TrainingModule module = new TrainingModule();
            module.setId(dto.getModuleId());
            entity.setModule(module);
        }
        if (dto.getUnitId() != null) {
            Unit unit = new Unit();
            unit.setId(dto.getUnitId());
            entity.setUnit(unit);
        }
        entity.setStatus(dto.getStatus());
        return entity;
    }
}
