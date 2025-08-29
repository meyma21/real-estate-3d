package com.realestate.dto;

import com.realestate.model.Hotspot;
import java.util.List;
import java.util.Map;

public class HotspotUpdateRequest {
    private List<Hotspot> topViewHotspots;
    private Map<String, List<Hotspot>> angleHotspots;

    public List<Hotspot> getTopViewHotspots() {
        return topViewHotspots;
    }

    public void setTopViewHotspots(List<Hotspot> topViewHotspots) {
        this.topViewHotspots = topViewHotspots;
    }

    public Map<String, List<Hotspot>> getAngleHotspots() {
        return angleHotspots;
    }

    public void setAngleHotspots(Map<String, List<Hotspot>> angleHotspots) {
        this.angleHotspots = angleHotspots;
    }
} 