package com.example.runtracker;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Run {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

private int minutes;
private int seconds;
private double distance;
private double pace;
private LocalDateTime date;


    public Long getId() { return id; }
    


    public int getMinutes() { return minutes; }
    public void setMinutes(int minutes) { this.minutes = minutes; }

    public int getSeconds() { return seconds; }
    public void setSeconds(int seconds) { this.seconds = seconds; }

    public double getDistance() { return distance; }
    public void setDistance(double distance) { this.distance = distance; }

    public double getPace() { return pace; }
    public void setPace(double pace) { this.pace = pace; }

     public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

}
