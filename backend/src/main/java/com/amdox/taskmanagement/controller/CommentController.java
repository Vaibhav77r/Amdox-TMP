package com.amdox.taskmanagement.controller;

import com.amdox.taskmanagement.dto.CommentDTO;
import com.amdox.taskmanagement.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks/{taskId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<CommentDTO.Response> addComment(@PathVariable Long taskId,
                                                           @Valid @RequestBody CommentDTO.CreateRequest request) {
        return ResponseEntity.ok(commentService.addComment(taskId, request));
    }

    @GetMapping
    public ResponseEntity<List<CommentDTO.Response>> getComments(@PathVariable Long taskId) {
        return ResponseEntity.ok(commentService.getComments(taskId));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long taskId,
                                               @PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}