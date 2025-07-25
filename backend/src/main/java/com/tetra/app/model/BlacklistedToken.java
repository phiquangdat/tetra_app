package com.tetra.app.model;

import jakarta.persistence.*;
import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "blacklisted_tokens")
public class BlacklistedToken {
    @Id
    @Column(length = 512)
    private String token;

    @Column(name = "blacklisted_at")
    private Date blacklistedAt = new Date();

    @Column(name = "user_id", columnDefinition = "uuid")
    private UUID userId;

    public BlacklistedToken() {}

    public BlacklistedToken(String token, UUID userId) {
        this.token = token;
        this.userId = userId;
        this.blacklistedAt = new Date();
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Date getBlacklistedAt() { return blacklistedAt; }
    public void setBlacklistedAt(Date blacklistedAt) { this.blacklistedAt = blacklistedAt; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
}
