package com.lexaequitas.service;

import java.time.Instant;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.lexaequitas.model.User;
import com.lexaequitas.repository.UserRepository;
import com.lexaequitas.config.JwtUtil;

@Service
public class AuthService {

    // OTP expires after 5 minutes
    private static final long OTP_TTL_SECONDS = 300;

    // In-memory store: email → { otp, expiresAt }
    // For production, replace with a Redis cache or a DB table.
    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private JavaMailSender mailSender;

    // ── register ──────────────────────────────────────────────────────────────

    public String register(User user) {
        String email = user.getEmail().toLowerCase();
        user.setEmail(email);

        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        user.setPassword(encoder.encode(user.getPassword()));
        userRepository.save(user);
        return "User registered successfully";
    }

    // ── Step 1: validate credentials, send OTP ────────────────────────────────

    public void initiateLogin(User request) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!encoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // Generate a 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(1_000_000));

        // Store with expiry
        otpStore.put(email, new OtpEntry(otp, Instant.now().plusSeconds(OTP_TTL_SECONDS)));

        // Send the OTP via email
        sendOtpEmail(email, otp);

        System.out.println("OTP sent to: " + email);
    }

    // ── Step 2: verify OTP, return JWT ────────────────────────────────────────

    public String verifyOtp(String email, String otp) {
        if (email == null || otp == null) {
            throw new RuntimeException("Email and OTP are required");
        }

        email = email.trim().toLowerCase();
        OtpEntry entry = otpStore.get(email);

        if (entry == null) {
            throw new RuntimeException("No OTP requested for this email");
        }

        if (Instant.now().isAfter(entry.expiresAt())) {
            otpStore.remove(email);
            throw new RuntimeException("OTP has expired. Please log in again");
        }

        if (!entry.otp().equals(otp.trim())) {
            throw new RuntimeException("Invalid OTP");
        }

        // OTP is valid — consume it (one-time use)
        otpStore.remove(email);

        return jwtUtil.generateToken(email);
    }

    // ── Email helper ──────────────────────────────────────────────────────────

    private void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Your LexAequitas Login Code");
        message.setText(
            "Hello,\n\n" +
            "Your one-time login code is:\n\n" +
            "  " + otp + "\n\n" +
            "This code expires in 5 minutes. Do not share it with anyone.\n\n" +
            "If you did not request this, please ignore this email.\n\n" +
            "— LexAequitas Security"
        );
        mailSender.send(message);
    }

    // ── Inner record for OTP storage ──────────────────────────────────────────

    private record OtpEntry(String otp, Instant expiresAt) {}
}