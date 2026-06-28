// package com.lexaequitas.controller;

// import java.util.Map;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import com.lexaequitas.model.User;
// import com.lexaequitas.service.AuthService;

// @RestController
// @RequestMapping("/api/auth")
// public class AuthController {

//     @Autowired
//     private AuthService authService;

//     @PostMapping("/register")
//     public String register(@RequestBody User user) {
//         return authService.register(user);
//     }


//     @PostMapping("/login")
//     public ResponseEntity<?> login(@RequestBody User user) {
//         try {
//             String token = authService.login(user);

//             System.out.println("LOGIN SUCCESS, TOKEN: " + token); // 🔥 debug

//             return ResponseEntity.ok(Map.of("token", token));

//         } catch (RuntimeException e) {
//             System.out.println("LOGIN ERROR: " + e.getMessage());
//             return ResponseEntity.status(401).body(e.getMessage());
//         }
//     }
// }

package com.lexaequitas.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.lexaequitas.model.User;
import com.lexaequitas.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public String register(@RequestBody User user) {
        return authService.register(user);
    }

    /**
     * Step 1 of login: validate credentials, send OTP to email.
     * Returns HTTP 200 with { "mfaPending": true } on success — no JWT yet.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            authService.initiateLogin(user);
            return ResponseEntity.ok(Map.of("mfaPending", true));
        } catch (RuntimeException e) {
            System.out.println("LOGIN ERROR: " + e.getMessage());
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String otp   = body.get("otp");
            String token = authService.verifyOtp(email, otp);
            return ResponseEntity.ok(Map.of("token", token));
        } catch (RuntimeException e) {
            System.out.println("OTP ERROR: " + e.getMessage());
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }
}