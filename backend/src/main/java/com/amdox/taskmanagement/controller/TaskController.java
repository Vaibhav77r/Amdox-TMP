package com.amdox.taskmanagement.controller;

import com.amdox.taskmanagement.dto.TaskDTO;
import com.amdox.taskmanagement.entity.Task;
import com.amdox.taskmanagement.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    public ResponseEntity<TaskDTO.Response> createTask(
            @Valid @RequestBody TaskDTO.CreateRequest request) {
        log.debug("Creating task: {}", request.getTitle());
        return ResponseEntity.ok(taskService.createTask(request));
    }

    @GetMapping
    public ResponseEntity<List<TaskDTO.Response>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @GetMapping("/kanban")
    public ResponseEntity<TaskDTO.KanbanResponse> getKanbanBoard() {
        return ResponseEntity.ok(taskService.getKanbanBoard());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO.Response> getTask(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTask(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    public ResponseEntity<TaskDTO.Response> updateTask(
            @PathVariable Long id,
            @RequestBody TaskDTO.UpdateRequest request) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskDTO.Response> updateStatus(
            @PathVariable Long id,
            @RequestParam("status") String status) {
        try {
            Task.Status taskStatus = Task.Status.valueOf(status.toUpperCase().trim());
            return ResponseEntity.ok(taskService.updateStatus(id, taskStatus));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status value: " + status +
                    ". Must be one of: TODO, IN_PROGRESS, IN_REVIEW, DONE");
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}