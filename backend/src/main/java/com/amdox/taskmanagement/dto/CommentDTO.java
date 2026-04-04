package com.amdox.taskmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

public class CommentDTO {

    @Data
    public static class CreateRequest {
        @NotBlank
        private String content;
    }

    @Data
    @Builder
    public static class Response {
        private Long id;
        private String content;
        private LocalDateTime createdAt;
        private UserDTO.Summary user;
    }
}