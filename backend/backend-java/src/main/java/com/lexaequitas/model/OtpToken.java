package com.lexaequitas.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "otp_tokens")
public class OtpToken {

    @Id
    private String email;

    private String otp;

    private Instant expiresAt;

    public OtpToken() {}

    public OtpToken(String email, String otp, Instant expiresAt) {
        this.email = email;
        this.otp = otp;
        this.expiresAt = expiresAt;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
}
