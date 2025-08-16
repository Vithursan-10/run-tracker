package com.example.runtracker;

import com.example.runtracker.Run;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RunRepository extends JpaRepository<Run, Long> {
    // No extra methods needed for now
}

