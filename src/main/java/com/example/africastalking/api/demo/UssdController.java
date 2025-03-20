package com.example.africastalking.api.demo;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

@RestController
public class UssdController {
    // POST method to handle USSD requests
    @PostMapping("/ussd")
    public ResponseEntity<String> handleUssdRequest(@RequestParam("sessionId") String sessionId,
                                                    @RequestParam("phoneNumber") String phoneNumber,
                                                   // @RequestParam("serviceCode") String serviceCode,
                                                    @RequestParam("text") String text) {

// Initialize the userinput ussd response
        StringBuilder response = new StringBuilder();

// Trim any  whitespace from the user input
        text = text.trim();

// Debug: Print the text value to check
        System.out.println("User input: " + text);

// First menu
        if (text.isEmpty()) {
            response.append("CON What would you like to check\n")
                    .append("\n1. Register\n")
                    .append("\n2. Main Menu");
        }
// User selects "Register"
        else if (text.equals("1")) {
            response.append("CON Register Account \n")
                    .append("\n1. Payment Account\n")
                    .append("\n2. Enter Phone Number");
        }
// User selects Main menu
        else if (text.equals("2")) {
            response.append("END Main Menu\n")
                    .append("\n1. Account Balance\n")
                    .append("\n2. Make Payment\n")
                    .append("\n3. Buy Airtime");
        }
// User selects Payment Account or Phone Number in Register Menu
        else if (text.equals("1*1")) {
            response.append("CON Please enter the payment account details.");
        } else if (text.equals("1*2")) {
            response.append("CON Please enter your phone number.");
        }
// Invalid choice or any other input
        else {
            response.append("CON Invalid choice. Please try again.");
        }

// Return the response
        return ResponseEntity.ok(response.toString());

    }
}
