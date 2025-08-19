
package com.tetra.app.aspect;

import com.tetra.app.service.AdminActionLogService;
import com.tetra.app.security.JwtUtil;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.*;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.lang.reflect.Method;
import java.util.UUID;
import java.util.Map;
import com.tetra.app.model.Role;

@Aspect
@Component
public class AdminActionAspect {

    private static UUID lastAdminId = null;

    @Autowired
    private AdminActionLogService adminActionLogService;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private HttpServletRequest httpServletRequest;

    @Pointcut("@annotation(org.springframework.web.bind.annotation.PostMapping) || " +
              "@annotation(org.springframework.web.bind.annotation.PutMapping) || " +
              "@annotation(org.springframework.web.bind.annotation.PatchMapping) || " +
              "@annotation(org.springframework.web.bind.annotation.DeleteMapping)")
    public void adminActions() {}

    @AfterReturning(pointcut = "adminActions()", returning = "result")
    public void logAdminAction(JoinPoint joinPoint, Object result) {
        System.out.println("[AdminActionAspect] Aspect triggered for method: " + joinPoint.getSignature());
        AdminContext adminContext = getCurrentAdminContext();
        UUID adminId = adminContext.adminId;
    Role role = adminContext.role;
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        String actionType = getActionType(method);
        String subjectType = getSubjectTypeFromMethod(method);
        UUID entityId = extractEntityIdFromArgs(joinPoint.getArgs());
        // Если create и не нашли entityId в аргументах — пробуем взять из result
        if ("create".equals(actionType) && entityId == null && result != null) {
            entityId = extractEntityIdFromResult(result);
        }
        // Для create всегда вызываем логгер, даже если entityId == null (логгер сам подставит ID)
        if (adminId != null && role == Role.ADMIN && actionType != null && subjectType != null) {
            System.out.println("[AdminActionAspect] Logging admin action: adminId=" + adminId +
                    ", actionType=" + actionType + ", entityId=" + entityId + ", subjectType=" + subjectType);
            adminActionLogService.logAction(adminId, actionType, entityId, subjectType);
        } else {
            System.out.println("[AdminActionAspect] Skipping log: adminId=" + adminId + ", role=" + role + ", actionType=" + actionType + ", subjectType=" + subjectType + ", entityId=" + entityId);
        }
    }

    // Получить adminId и роль только из текущего JWT (Authorization header)
    private AdminContext getCurrentAdminContext() {
        String authHeader = httpServletRequest.getHeader("Authorization");
        UUID adminId = null;
        Role role = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                String roleStr = jwtUtil.extractRole(token);
                if (roleStr != null) {
                    try {
                        role = Role.valueOf(roleStr);
                    } catch (Exception ignored) {}
                }
                String adminIdStr = jwtUtil.extractUserId(token);
                adminId = UUID.fromString(adminIdStr);
            } catch (Exception e) {
                adminId = null;
                role = null;
            }
        }
        // Если нет токена — берём из AuthController
        if (adminId == null && role == null) {
            adminId = com.tetra.app.controller.AuthController.lastAdminId;
            role = com.tetra.app.controller.AuthController.lastAdminRole;
        }
        return new AdminContext(adminId, role);
    }

    // Вспомогательный класс для хранения adminId и роли
    private static class AdminContext {
        public final UUID adminId;
        public final Role role;
        public AdminContext(UUID adminId, Role role) {
            this.adminId = adminId;
            this.role = role;
        }
    }

    // Извлекает UUID из result (ResponseEntity, Map, DTO)
    private UUID extractEntityIdFromResult(Object result) {
        if (result == null) return null;
        // Если ResponseEntity — берём body
        if (result instanceof org.springframework.http.ResponseEntity) {
            org.springframework.http.ResponseEntity responseEntity = (org.springframework.http.ResponseEntity) result;
            Object body = responseEntity.getBody();
            UUID id = extractEntityIdFromObject(body);
            if (id != null) return id;
            // Для unit: ищем id и module_id
            if (body instanceof Map) {
                Map map = (Map) body;
                Object unitId = map.get("id");
                if (unitId instanceof UUID) return (UUID) unitId;
                if (unitId instanceof String) {
                    try {
                        return UUID.fromString((String) unitId);
                    } catch (Exception ignored) {}
                }
                Object moduleId = map.get("module_id");
                if (moduleId instanceof UUID) return (UUID) moduleId;
                if (moduleId instanceof String) {
                    try {
                        return UUID.fromString((String) moduleId);
                    } catch (Exception ignored) {}
                }
            }
        }
        // Если просто Map/DTO
        return extractEntityIdFromObject(result);
    }

    // Универсальный способ вытащить UUID из объекта (Map, DTO)
    private UUID extractEntityIdFromObject(Object obj) {
        if (obj == null) return null;
        if (obj instanceof UUID) return (UUID) obj;
        if (obj instanceof String) {
            try {
                return UUID.fromString((String) obj);
            } catch (Exception ignored) {}
        }
        if (obj instanceof Map) {
            Map map = (Map) obj;
            Object id = map.get("id");
            if (id instanceof UUID) return (UUID) id;
            if (id instanceof String) {
                try {
                    return UUID.fromString((String) id);
                } catch (Exception ignored) {}
            }
        }
        // DTO с getId()
        try {
            Method getId = obj.getClass().getMethod("getId");
            Object id = getId.invoke(obj);
            if (id instanceof UUID) return (UUID) id;
            if (id instanceof String) {
                try {
                    return UUID.fromString((String) id);
                } catch (Exception ignored) {}
            }
        } catch (Exception ignored) {}
        return null;
    }

    private String getActionType(Method method) {
        if (method.isAnnotationPresent(PostMapping.class)) return "create";
        if (method.isAnnotationPresent(PutMapping.class)) return "update";
        if (method.isAnnotationPresent(PatchMapping.class)) return "patch";
        if (method.isAnnotationPresent(DeleteMapping.class)) return "delete";
        return null;
    }

    private String getSubjectTypeFromMethod(Method method) {
        String name = method.getDeclaringClass().getSimpleName().toLowerCase();
        if (name.contains("module")) return "training_module";
        if (name.contains("unitcontent")) return "unit_content";
        if (name.contains("unit")) return "unit";
        if (name.contains("user")) return "user";
        return null;
    }

    private UUID extractEntityIdFromArgs(Object[] args) {
        for (Object arg : args) {
            if (arg instanceof UUID) return (UUID) arg;
            if (arg instanceof String) {
                try {
                    return UUID.fromString((String) arg);
                } catch (Exception ignored) {}
            }
            if (arg instanceof Map) {
                Map map = (Map) arg;
                // Для unit ищем unit_id, id
                Object unitId = map.get("unit_id");
                if (unitId instanceof UUID) return (UUID) unitId;
                if (unitId instanceof String) {
                    try {
                        return UUID.fromString((String) unitId);
                    } catch (Exception ignored) {}
                }
                Object id = map.get("id");
                if (id instanceof UUID) return (UUID) id;
                if (id instanceof String) {
                    try {
                        return UUID.fromString((String) id);
                    } catch (Exception ignored) {}
                }
            }
        }
        return null;
    }
}
