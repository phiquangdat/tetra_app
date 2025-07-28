package com.tetra.app.mapper;

import com.tetra.app.dto.UserModuleProgressDto;
import com.tetra.app.model.UserModuleProgress;
import com.tetra.app.model.User;
import com.tetra.app.model.TrainingModule;
import com.tetra.app.model.Unit;
import com.tetra.app.model.UnitContent;

public class UserModuleProgressMapper {
    public static UserModuleProgressDto toDto(UserModuleProgress entity) {
        UserModuleProgressDto dto = new UserModuleProgressDto();
        dto.setId(entity.getId());
        dto.setUser_id(entity.getUser() != null ? entity.getUser().getId() : null);
        dto.setModule_id(entity.getModule() != null ? entity.getModule().getId() : null);
        dto.setLast_visited_unit_id(entity.getLastVisitedUnit() != null ? entity.getLastVisitedUnit().getId() : null);
        dto.setLast_visited_content_id(entity.getLastVisitedContent() != null ? entity.getLastVisitedContent().getId() : null);
        dto.setStatus(entity.getStatus());
        dto.setEarned_points(entity.getEarnedPoints());
        return dto;
    }

    public static UserModuleProgress toEntity(UserModuleProgressDto dto) {
        UserModuleProgress entity = new UserModuleProgress();
        entity.setId(dto.getId());
        if (dto.getUser_id() != null) {
            User user = new User();
            user.setId(dto.getUser_id());
            entity.setUser(user);
        }
        if (dto.getModule_id() != null) {
            TrainingModule module = new TrainingModule();
            module.setId(dto.getModule_id());
            entity.setModule(module);
        }
        if (dto.getLast_visited_unit_id() != null) {
            Unit unit = new Unit();
            unit.setId(dto.getLast_visited_unit_id());
            entity.setLastVisitedUnit(unit);
        }
        if (dto.getLast_visited_content_id() != null) {
            UnitContent content = new UnitContent();
            content.setId(dto.getLast_visited_content_id());
            entity.setLastVisitedContent(content);
        }
        entity.setStatus(dto.getStatus());
        entity.setEarnedPoints(dto.getEarned_points());
        return entity;
    }
}
