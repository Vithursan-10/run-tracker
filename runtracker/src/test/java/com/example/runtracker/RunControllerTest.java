package com.example.runtracker;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RunController.class)
class RunControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RunRepository runRepository;

    @Test
    void getAllRuns_returnsListOfRuns() throws Exception {
        Run run1 = createRun(1L, 30, 0, 5.0, 6.0, LocalDateTime.now());
        Run run2 = createRun(2L, 45, 30, 10.0, 4.5, LocalDateTime.now());

        when(runRepository.findAll()).thenReturn(List.of(run1, run2));

        mockMvc.perform(get("/api/runs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].minutes").value(30))
                .andExpect(jsonPath("$[1].distance").value(10.0));
    }

    @Test
    void saveRun_returnsSavedRun() throws Exception {
        Run run = createRun(null, 25, 15, 7.2, 5.2, LocalDateTime.now());
        Run savedRun = createRun(1L, 25, 15, 7.2, 5.2, run.getDate());

        when(runRepository.save(any(Run.class))).thenReturn(savedRun);

        mockMvc.perform(post("/api/runs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(run)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.minutes").value(25))
                .andExpect(jsonPath("$.seconds").value(15))
                .andExpect(jsonPath("$.distance").value(7.2))
                .andExpect(jsonPath("$.pace").value(5.2));
    }

    @Test
    void deleteRun_whenRunExists_returnsNoContent() throws Exception {
        Long runId = 1L;
        when(runRepository.existsById(runId)).thenReturn(true);

        mockMvc.perform(delete("/api/runs/{id}", runId))
                .andExpect(status().isNoContent());

        verify(runRepository, times(1)).deleteById(runId);
    }

    @Test
    void deleteRun_whenRunDoesNotExist_returnsNotFound() throws Exception {
        Long runId = 999L;
        when(runRepository.existsById(runId)).thenReturn(false);

        mockMvc.perform(delete("/api/runs/{id}", runId))
                .andExpect(status().isNotFound());

        verify(runRepository, never()).deleteById(anyLong());
    }

    // Helper method to build runs
    private Run createRun(Long id, int minutes, int seconds, double distance, double pace, LocalDateTime date) {
        Run run = new Run();
        if (id != null) {
            try {
                var field = Run.class.getDeclaredField("id");
                field.setAccessible(true);
                field.set(run, id);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
        run.setMinutes(minutes);
        run.setSeconds(seconds);
        run.setDistance(distance);
        run.setPace(pace);
        run.setDate(date);
        return run;
    }
}
