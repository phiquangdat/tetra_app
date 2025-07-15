package com.tetra.app.service;

import com.tetra.app.model.User;
import com.tetra.app.model.Role;
import com.tetra.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordHashingService passwordHashingService;

    @Autowired
    public UserService(UserRepository userRepository, PasswordHashingService passwordHashingService) {
        this.userRepository = userRepository;
        this.passwordHashingService = passwordHashingService;
    }

    public User createUser(String name, String email, String password, Role role) {
        if (name == null || name.isBlank())
            throw new IllegalArgumentException("Name is required");
        if (email == null || email.isBlank())
            throw new IllegalArgumentException("Email is required");
        if (password == null || password.length() < 6)
            throw new IllegalArgumentException("Password must be at least 6 characters");
        if (role == null)
            throw new IllegalArgumentException("Role is required");
        if (userRepository.existsByEmail(email))
            throw new IllegalArgumentException("Email already exists");

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setRole(role);
        user.setPassword(passwordHashingService.hashPassword(password));
        return userRepository.save(user);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
