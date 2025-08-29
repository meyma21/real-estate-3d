package com.realestate.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.google.cloud.Timestamp;

import java.io.IOException;
import java.time.Instant;

public class TimestampDeserializer extends JsonDeserializer<Timestamp> {
    @Override
    public Timestamp deserialize(JsonParser jsonParser, DeserializationContext deserializationContext)
            throws IOException {
        String dateString = jsonParser.getValueAsString();
        if (dateString == null || dateString.isEmpty()) {
            return null;
        }
        
        try {
            // Parse ISO 8601 string to Instant, then convert to Timestamp
            Instant instant = Instant.parse(dateString);
            return Timestamp.ofTimeSecondsAndNanos(instant.getEpochSecond(), instant.getNano());
        } catch (Exception e) {
            // Fallback: try to parse as epoch milliseconds
            try {
                long epochMilli = Long.parseLong(dateString);
                return Timestamp.ofTimeSecondsAndNanos(epochMilli / 1000, (int) ((epochMilli % 1000) * 1_000_000));
            } catch (NumberFormatException nfe) {
                throw new IOException("Unable to parse timestamp: " + dateString, e);
            }
        }
    }
}
