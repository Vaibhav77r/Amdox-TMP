package com.amdox.taskmanagement.service;

import com.amdox.taskmanagement.dto.TaskDTO;
import com.amdox.taskmanagement.dto.UserDTO;
import com.amdox.taskmanagement.entity.Task;
import com.amdox.taskmanagement.entity.User;
import com.amdox.taskmanagement.repository.TaskRepository;
import com.amdox.taskmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    public TaskDTO.Response createTask(TaskDTO.CreateRequest request) {
        User currentUser = getCurrentUser();
        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .dueDate(request.getDueDate())
                .status(Task.Status.TODO)
                .createdBy(currentUser)
                .build();
        if (request.getAssigneeId() != null) {
            userRepository.findById(request.getAssigneeId()).ifPresent(task::setAssignee);
        }
        return toResponse(taskRepository.save(task));
    }

    public List<TaskDTO.Response> getAllTasks() {
        return taskRepository.findAllOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public TaskDTO.KanbanResponse getKanbanBoard() {
        List<Task> all = taskRepository.findAll();
        return TaskDTO.KanbanResponse.builder()
                .todo(filter(all, Task.Status.TODO))
                .inProgress(filter(all, Task.Status.IN_PROGRESS))
                .inReview(filter(all, Task.Status.IN_REVIEW))
                .done(filter(all, Task.Status.DONE))
                .build();
    }

    private List<TaskDTO.Response> filter(List<Task> tasks, Task.Status status) {
        return tasks.stream()
                .filter(t -> t.getStatus() == status)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TaskDTO.Response getTask(Long id) {
        return toResponse(taskRepository.findById(id).orElseThrow());
    }

    @Transactional
    public TaskDTO.Response updateTask(Long id, TaskDTO.UpdateRequest request) {
        Task task = taskRepository.findById(id).orElseThrow();
        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        if (request.getAssigneeId() != null) {
            userRepository.findById(request.getAssigneeId()).ifPresent(task::setAssignee);
        }
        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskDTO.Response updateStatus(Long id, Task.Status status) {
        Task task = taskRepository.findById(id).orElseThrow();
        task.setStatus(status);
        return toResponse(taskRepository.save(task));
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    public TaskDTO.Response toResponse(Task task) {
        return TaskDTO.Response.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .dueDate(task.getDueDate())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .assignee(task.getAssignee() != null ? toUserSummary(task.getAssignee()) : null)
                .createdBy(task.getCreatedBy() != null ? toUserSummary(task.getCreatedBy()) : null)
                .commentCount(task.getComments() != null ? task.getComments().size() : 0)
                .build();
    }

    private UserDTO.Summary toUserSummary(User user) {
        return UserDTO.Summary.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}