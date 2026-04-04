package com.amdox.taskmanagement.service;

import com.amdox.taskmanagement.entity.Task;
import com.amdox.taskmanagement.repository.TaskRepository;
import com.amdox.taskmanagement.repository.UserRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public DashboardStats getStats() {
        long total = taskRepository.count();
        long todo = taskRepository.countByStatus(Task.Status.TODO);
        long inProgress = taskRepository.countByStatus(Task.Status.IN_PROGRESS);
        long inReview = taskRepository.countByStatus(Task.Status.IN_REVIEW);
        long done = taskRepository.countByStatus(Task.Status.DONE);
        long totalUsers = userRepository.count();

        Map<String, Long> byStatus = new HashMap<>();
        byStatus.put("TODO", todo);
        byStatus.put("IN_PROGRESS", inProgress);
        byStatus.put("IN_REVIEW", inReview);
        byStatus.put("DONE", done);

        return DashboardStats.builder()
                .totalTasks(total)
                .completedTasks(done)
                .inProgressTasks(inProgress)
                .pendingTasks(todo)
                .inReviewTasks(inReview)
                .totalMembers(totalUsers)
                .tasksByStatus(byStatus)
                .completionRate(total > 0 ? (double) done / total * 100 : 0)
                .build();
    }

    @Data
    @Builder
    public static class DashboardStats {
        private long totalTasks;
        private long completedTasks;
        private long inProgressTasks;
        private long pendingTasks;
        private long inReviewTasks;
        private long totalMembers;
        private double completionRate;
        private Map<String, Long> tasksByStatus;
    }
}