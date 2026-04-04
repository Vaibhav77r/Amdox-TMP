package com.amdox.taskmanagement.repository;

import com.amdox.taskmanagement.entity.Task;
import com.amdox.taskmanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByAssignee(User assignee);
    List<Task> findByCreatedBy(User createdBy);
    List<Task> findByStatus(Task.Status status);
    List<Task> findByPriority(Task.Priority priority);

    @Query("SELECT t FROM Task t ORDER BY t.createdAt DESC")
    List<Task> findAllOrderByCreatedAtDesc();

    @Query("SELECT COUNT(t) FROM Task t WHERE t.status = :status")
    long countByStatus(Task.Status status);
}