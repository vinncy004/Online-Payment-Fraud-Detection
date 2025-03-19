package com.example.africastalking.api.demo;

import com.example.africastalking.api.demo.UssdService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ussd")
public class UssdController {

    @Autowired
    private UssdService ussdService;

    // Endpoint to process USSD requests
    @PostMapping("/process")
    public String processUssdRequest(
            @RequestParam("sessionId") String sessionId,
            @RequestParam("phoneNumber") String phoneNumber,
            @RequestParam("userInput") String userInput
    ) {
        // Log or print the incoming data for debugging purposes
        System.out.println("Session ID: " + sessionId);
        System.out.println("Phone Number: " + phoneNumber);
        System.out.println("User Input: " + userInput);

        // Ensure there are no extra spaces in userInput
        userInput = userInput.trim();

        // Process the USSD request and return the response
        String response = ussdService.handleUssdRequest(sessionId, phoneNumber, userInput);

        // If the response is empty or invalid, return a default "CON Invalid input" message
        if (response == null || response.trim().isEmpty()) {
            response = "CON Invalid input. Please try again.";
        }

        // Log the response for debugging purposes
        System.out.println("Response: " + response);

        // Return the formatted USSD response
        return response;
    }
}
