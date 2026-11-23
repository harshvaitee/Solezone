package com.solezone.controller;

import com.solezone.entity.User;
import com.solezone.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User savedUser = userService.registerUser(user);

            return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                    "message", "Registration successful",
                    "userId", savedUser.getUserId(),
                    "fullName", savedUser.getFullName(),
                    "email", savedUser.getEmail(),
                    "role", savedUser.getRole()
                )
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                Map.of("message", e.getMessage())
            );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        try {
            String email = loginData.get("email");
            String password = loginData.get("password");

            if (email == null || email.isBlank()
                    || password == null || password.isBlank()) {
                return ResponseEntity.badRequest().body(
                    Map.of("message", "Email and password are required")
                );
            }

            User user = userService.loginUser(email, password);

            return ResponseEntity.ok(
                Map.of(
                    "message", "Login successful",
                    "userId", user.getUserId(),
                    "fullName", user.getFullName(),
                    "email", user.getEmail(),
                    "role", user.getRole()
                )
            );

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("message", "Invalid email or password")
            );
        }
    }
}
