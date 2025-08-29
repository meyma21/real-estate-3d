package com.realestate.config;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.Firestore;
import com.realestate.model.*;
import com.realestate.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private Firestore firestore;

    @Autowired
    private CustomUserDetailsService userService;

    @Autowired
    private FloorService floorService;

    @Autowired
    private ApartmentService apartmentService;

    @Autowired
    private BuyerService buyerService;

    private final List<String> requiredCollections = Arrays.asList(
        "floors", "apartments", "buyers", "pictures", "users"
    );

    @Override
    public void run(String... args) {
        initializeCollections();
        createInitialData();
    }

    private void initializeCollections() {
        for (String collectionName : requiredCollections) {
            try {
                // Check if collection exists by trying to get a document
                firestore.collection(collectionName).limit(1).get().get();
                logger.info("Collection '{}' exists", collectionName);
            } catch (Exception e) {
                // If collection doesn't exist, create it with a dummy document
                try {
                    firestore.collection(collectionName)
                            .document("initialization")
                            .set(new java.util.HashMap<String, Object>() {{
                                put("initialized", true);
                                put("timestamp", new java.util.Date());
                            }}).get();
                    logger.info("Created collection: {}", collectionName);
                    
                    // Delete the dummy document
                    firestore.collection(collectionName)
                            .document("initialization")
                            .delete()
                            .get();
                } catch (Exception ex) {
                    logger.error("Error creating collection {}: {}", collectionName, ex.getMessage());
                }
            }
        }
    }

    private void createInitialData() {
        try {
            // Check if admin user exists
            List<User> adminUsers = firestore.collection("users")
                .whereEqualTo("email", "admin@example.com")
                .get()
                .get()
                .toObjects(User.class);

            if (adminUsers.isEmpty()) {
                // Create admin user
                User adminUser = new User();
                adminUser.setEmail("admin@example.com");
                adminUser.setPassword("admin123"); // Will be encoded by the service
                adminUser.setRole("ROLE_ADMIN"); // Must match exactly with UserRole enum
                adminUser.setEnabled(true);
                adminUser.setCreatedAt(Timestamp.now());
                adminUser.setUpdatedAt(Timestamp.now());
                String adminId = userService.createUser(adminUser);
                logger.info("Created admin user with ID: {}", adminId);

                // Create a test floor
                Floor floor = new Floor();
                floor.setName("First Floor");
                floor.setFloorNumber(1);
                floor.setDescription("Ground level floor with garden access");
                String floorId = floorService.createFloor(floor, null);
                logger.info("Created floor with ID: {}", floorId);

                // Create ground floor
                Floor groundFloor = new Floor();
                groundFloor.setName("Ground Floor");
                groundFloor.setFloorNumber(0);
                groundFloor.setDescription("Ground floor with main entrance and lobby");
                String groundFloorId = floorService.createFloor(groundFloor, null);
                logger.info("Created ground floor with ID: {}", groundFloorId);

                // Create second floor
                Floor secondFloor = new Floor();
                secondFloor.setName("Second Floor");
                secondFloor.setFloorNumber(2);
                secondFloor.setDescription("Second floor with premium apartments");
                String secondFloorId = floorService.createFloor(secondFloor, null);
                logger.info("Created second floor with ID: {}", secondFloorId);

                // Create test apartments for ground floor
                Apartment groundApt1 = new Apartment();
                groundApt1.setFloorId(groundFloorId);
                groundApt1.setLotNumber("G01");
                groundApt1.setType("1 Bedroom");
                groundApt1.setArea(65.0);
                groundApt1.setPrice(new BigDecimal("180000"));
                groundApt1.setStatus(ApartmentStatus.AVAILABLE);
                groundApt1.setDescription("Cozy ground floor apartment with garden access");
                groundApt1.setCreatedAt(Timestamp.now());
                groundApt1.setUpdatedAt(Timestamp.now());
                String groundApt1Id = apartmentService.createApartment(groundApt1, null);
                logger.info("Created ground floor apartment with ID: {}", groundApt1Id);

                Apartment groundApt2 = new Apartment();
                groundApt2.setFloorId(groundFloorId);
                groundApt2.setLotNumber("G02");
                groundApt2.setType("2 Bedroom");
                groundApt2.setArea(85.0);
                groundApt2.setPrice(new BigDecimal("220000"));
                groundApt2.setStatus(ApartmentStatus.RESERVED);
                groundApt2.setDescription("Spacious ground floor apartment with patio");
                groundApt2.setCreatedAt(Timestamp.now());
                groundApt2.setUpdatedAt(Timestamp.now());
                String groundApt2Id = apartmentService.createApartment(groundApt2, null);
                logger.info("Created ground floor apartment with ID: {}", groundApt2Id);

                // Create test apartments for first floor
                Apartment apartment1 = new Apartment();
                apartment1.setFloorId(floorId);
                apartment1.setLotNumber("101");
                apartment1.setType("2 Bedroom");
                apartment1.setArea(85.5);
                apartment1.setPrice(new BigDecimal("250000"));
                apartment1.setStatus(ApartmentStatus.AVAILABLE);
                apartment1.setDescription("Spacious 2-bedroom apartment with garden view");
                apartment1.setCreatedAt(Timestamp.now());
                apartment1.setUpdatedAt(Timestamp.now());
                String apt1Id = apartmentService.createApartment(apartment1, null);
                logger.info("Created apartment with ID: {}", apt1Id);

                Apartment apartment2 = new Apartment();
                apartment2.setFloorId(floorId);
                apartment2.setLotNumber("102");
                apartment2.setType("3 Bedroom");
                apartment2.setArea(120.0);
                apartment2.setPrice(new BigDecimal("350000"));
                apartment2.setStatus(ApartmentStatus.AVAILABLE);
                apartment2.setDescription("Luxury 3-bedroom apartment with balcony");
                apartment2.setCreatedAt(Timestamp.now());
                apartment2.setUpdatedAt(Timestamp.now());
                String apt2Id = apartmentService.createApartment(apartment2, null);
                logger.info("Created apartment with ID: {}", apt2Id);

                // Create test apartments for second floor
                Apartment secondApt1 = new Apartment();
                secondApt1.setFloorId(secondFloorId);
                secondApt1.setLotNumber("201");
                secondApt1.setType("3 Bedroom");
                secondApt1.setArea(130.0);
                secondApt1.setPrice(new BigDecimal("380000"));
                secondApt1.setStatus(ApartmentStatus.SOLD);
                secondApt1.setDescription("Premium 3-bedroom apartment with city view");
                secondApt1.setCreatedAt(Timestamp.now());
                secondApt1.setUpdatedAt(Timestamp.now());
                String secondApt1Id = apartmentService.createApartment(secondApt1, null);
                logger.info("Created second floor apartment with ID: {}", secondApt1Id);

                // Create a test buyer
                Buyer buyer = new Buyer();
                buyer.setName("John Doe");
                buyer.setEmail("john.doe@example.com");
                buyer.setPhone("+1234567890");
                buyer.setStatus(BuyerStatus.INTERESTED);
                buyer.setNotes("Interested in 2-bedroom apartments");
                buyer.setBudget(500000.0);
                buyer.setContactDate(Timestamp.now());
                buyer.setCreatedAt(Timestamp.now());
                buyer.setUpdatedAt(Timestamp.now());
                buyerService.createBuyer(buyer);
                logger.info("Created buyer: {}", buyer.getName());
            } else {
                logger.info("Initial data already exists, skipping initialization");
            }
        } catch (Exception e) {
            logger.error("Error creating initial data: {}", e.getMessage(), e);
        }
    }
} 