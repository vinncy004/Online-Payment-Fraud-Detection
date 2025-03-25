package com.example.Frauddetection.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    // Landing Page Route
    @GetMapping("/")
    public String landingPage() {
        return "logspage"; // Serve logspage.html from static folder
    }

    // Create Account Page Route
    @GetMapping("/sign_in")
    public String createAccountPage() {
        return "sign_inpage"; // Serve sign_inpage.html from templates folder
    }

    // Login Page Route
    @GetMapping("/login")
    public String loginPage() {
        return "loginpage"; // Serve loginpage.html from templates folder
    }

}
