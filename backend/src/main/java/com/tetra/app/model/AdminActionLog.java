
package com.tetra.app.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "admin_action_logs")
public class AdminActionLog {

    @Id
    @SequenceGenerator(
        name = "admin_action_log_seq",
        sequenceName = "admin_action_log_seq",
        allocationSize = 1
    )
    @GeneratedValue(
        strategy = GenerationType.SEQUENCE,
        generator = "admin_action_log_seq"
    )
    private Long id;

    private UUID adminId;
    private String actionType;
    private String subjectType;
    private LocalDateTime timestamp;

    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UUID getAdminId() { return adminId; }
    public void setAdminId(UUID adminId) { this.adminId = adminId; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public String getSubjectType() { return subjectType; }
    public void setSubjectType(String subjectType) { this.subjectType = subjectType; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }

    @Override
    public String toString() {
        return "AdminActionLog{" +
                "id=" + id +
                ", adminId=" + adminId +
                ", actionType='" + actionType + '\'' +
                ", subjectType='" + subjectType + '\'' +
                ", timestamp=" + timestamp +
                ", subject=" + (subject != null ? subject.getId() : null) +
                '}';
    }
}