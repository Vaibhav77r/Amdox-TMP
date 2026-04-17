package com.amdox.taskmanagement.dto;

import com.amdox.taskmanagement.entity.Task;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

public class TaskDTO {

    @Data
    public static class CreateRequest {
        @NotBlank(message = "Title is required")
        private String title;

        private String description;

        // Default to MEDIUM if null — avoid NPE in service
        private Task.Priority priority = Task.Priority.MEDIUM;

        private LocalDateTime dueDate;

        private Long assigneeId;
    }

    @Data
    public static class UpdateRequest {
        private String title;
        private String description;
        private Task.Priority priority;
        private Task.Status status;
        private LocalDateTime dueDate;
        private Long assigneeId;
    }

    @Data
    @Builder
    public static class Response {
        private Long id;
        private String title;
        private String description;
        private Task.Status status;
        private Task.Priority priority;
        private LocalDateTime dueDate;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private UserDTO.Summary assignee;
        private UserDTO.Summary createdBy;
        private int commentCount;
    }

    @Data
    @Builder
    public static class KanbanResponse {
        private List<Response> todo;
        private List<Response> inProgress;
        private List<Response> inReview;
        private List<Response> done;
    }
}