package com.amdox.taskmanagement.service;

import com.amdox.taskmanagement.dto.CommentDTO;
import com.amdox.taskmanagement.dto.UserDTO;
import com.amdox.taskmanagement.entity.Comment;
import com.amdox.taskmanagement.entity.Task;
import com.amdox.taskmanagement.entity.User;
import com.amdox.taskmanagement.repository.CommentRepository;
import com.amdox.taskmanagement.repository.TaskRepository;
import com.amdox.taskmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    public CommentDTO.Response addComment(Long taskId, CommentDTO.CreateRequest request) {
        Task task = taskRepository.findById(taskId).orElseThrow();
        User currentUser = getCurrentUser();
        Comment comment = Comment.builder()
                .content(request.getContent())
                .task(task)
                .user(currentUser)
                .build();
        return toResponse(commentRepository.save(comment));
    }

    public List<CommentDTO.Response> getComments(Long taskId) {
        Task task = taskRepository.findById(taskId).orElseThrow();
        return commentRepository.findByTaskOrderByCreatedAtDesc(task)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public void deleteComment(Long commentId) {
        commentRepository.deleteById(commentId);
    }

    private CommentDTO.Response toResponse(Comment comment) {
        return CommentDTO.Response.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .user(UserDTO.Summary.builder()
                        .id(comment.getUser().getId())
                        .fullName(comment.getUser().getFullName())
                        .email(comment.getUser().getEmail())
                        .role(comment.getUser().getRole().name())
                        .build())
                .build();
    }
}