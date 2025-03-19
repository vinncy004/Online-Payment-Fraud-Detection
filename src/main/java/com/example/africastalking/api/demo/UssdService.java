package com.example.africastalking.api.demo;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class UssdService {

    @Value("${africastalking.username}")
    private String username;

    @Value("${africastalking.apiKey}")
    private String apiKey;

    private static final String MAIN_MENU = "Welcome! Please select an option:\n1. Register\n2. Main Menu";
    private static final String REGISTER_CONFIRMATION = "Congratulations, you are successfully registered!";

    // Handle USSD request for registration or main menu
    public String handleUssdRequest(String sessionId, String phoneNumber, String userInput) {
        if (userInput.equals("1")) {
            return registerUser(phoneNumber);
        } else if (userInput.equals("2")) {
            return showMainMenu();
        } else {
            return "Invalid Input. Please try again.";
        }
    }

    private String registerUser(String phoneNumber) {
        // Simulate registration
        // You can extend this logic to store user in a database or any other logic
        return REGISTER_CONFIRMATION;
    }

    private String showMainMenu() {
        return MAIN_MENU;
    }
}
