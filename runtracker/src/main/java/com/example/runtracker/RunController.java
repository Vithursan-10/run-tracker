package com.example.runtracker;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;


@RestController
@RequestMapping("/api/runs")
@CrossOrigin(origins = "*") 
public class RunController {

private final RunRepository repository;

public RunController(RunRepository repository) {

this.repository = repository;


}


@GetMapping
    public List<Run> getAllRuns() {
        return repository.findAll();
    }

@PostMapping
    public Run saveRun(@RequestBody Run run) {
        return repository.save(run);
    }

@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteRun(@PathVariable Long id) {
    if (repository.existsById(id)) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    } else {
        return ResponseEntity.notFound().build();
    }
}



}
