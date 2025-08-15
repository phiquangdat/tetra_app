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

@Aspect
@Component
public class AdminActionAspect {

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
        String authHeader = httpServletRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return;
        String token = authHeader.substring(7);
        String role;
        String adminIdStr;
        try {
            role = jwtUtil.extractRole(token);
            adminIdStr = jwtUtil.extractUserId(token);
        } catch (Exception e) {
            return;
        }
        if (!"ADMIN".equals(role)) return;
        UUID adminId;
        try {
            adminId = UUID.fromString(adminIdStr);
        } catch (Exception e) {
            return;
        }

        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        String actionType = getActionType(method);
        String subjectType = getSubjectTypeFromMethod(method);
        UUID entityId = extractEntityIdFromArgs(joinPoint.getArgs());

        if (actionType != null && subjectType != null && entityId != null) {
            System.out.println("[AdminActionAspect] Logging admin action: adminId=" + adminId +
                    ", actionType=" + actionType + ", entityId=" + entityId + ", subjectType=" + subjectType);
            adminActionLogService.logAction(adminId, actionType, entityId, subjectType);
        }
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
            if (arg instanceof java.util.Map map) {
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
