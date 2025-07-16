package com.tetra.app.dto;

import com.tetra.app.model.Role;

import java.util.UUID;

public class LoginResponse {

    private UUID id;
    private Role role;
    private String token;

    public LoginResponse() {
    }

    public LoginResponse(UUID id, Role role, String token) {
        this.id = id;
        this.role = role;
        this.token = token;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}