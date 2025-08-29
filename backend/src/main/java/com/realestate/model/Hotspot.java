package com.realestate.model;

public class Hotspot {
    private String apartmentId;
    private double x; // percentage 0-100
    private double y; // percentage 0-100
    private Double width;  // optional, percentage
    private Double height; // optional

    public Hotspot() {}

    public Hotspot(String apartmentId, double x, double y) {
        this.apartmentId = apartmentId;
        this.x = x;
        this.y = y;
    }

    public String getApartmentId() {
        return apartmentId;
    }

    public void setApartmentId(String apartmentId) {
        this.apartmentId = apartmentId;
    }

    public double getX() {
        return x;
    }

    public void setX(double x) {
        this.x = x;
    }

    public double getY() {
        return y;
    }

    public void setY(double y) {
        this.y = y;
    }

    public Double getWidth() {
        return width;
    }

    public void setWidth(Double width) {
        this.width = width;
    }

    public Double getHeight() {
        return height;
    }

    public void setHeight(Double height) {
        this.height = height;
    }
} 