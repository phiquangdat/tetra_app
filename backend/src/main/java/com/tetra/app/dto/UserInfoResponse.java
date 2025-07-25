package com.tetra.app.dto;

public class UserInfoResponse {
    private String name;
    private String email;
    private String role;

    public UserInfoResponse(String name, String email, String role) {
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
}
