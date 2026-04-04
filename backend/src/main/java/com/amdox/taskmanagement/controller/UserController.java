package com.amdox.taskmanagement.controller;

import com.amdox.taskmanagement.dto.UserDTO;
import com.amdox.taskmanagement.entity.User;
import com.amdox.taskmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<UserDTO.Summary>> getAllUsers() {
        List<UserDTO.Summary> users = userRepository.findAll().stream()
                .map(u -> UserDTO.Summary.builder()
                        .id(u.getId())
                        .fullName(u.getFullName())
                        .email(u.getEmail())
                        .role(u.getRole().name())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }
}