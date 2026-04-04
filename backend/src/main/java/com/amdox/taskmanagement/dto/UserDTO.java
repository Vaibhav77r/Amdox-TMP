package com.amdox.taskmanagement.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

public class UserDTO {
    @Data
    @Builder
    public static class Summary {
        private Long id;
        private String fullName;
        private String email;
        private String role;
    }
}