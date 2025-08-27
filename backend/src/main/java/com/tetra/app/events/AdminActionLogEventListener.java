package com.tetra.app.events;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.beans.factory.annotation.Autowired;
import com.tetra.app.service.AdminActionLogService;

@Component
public class AdminActionLogEventListener {
    @Autowired
    private AdminActionLogService adminActionLogService;

    @TransactionalEventListener(phase = org.springframework.transaction.event.TransactionPhase.AFTER_COMMIT)
    public void handleAdminActionLogEvent(AdminActionLogEvent event) {
        adminActionLogService.logAction(
            event.getAdminId(),
            event.getActionType(),
            event.getEntityId(),
            event.getSubjectType()
        );
    }
}
