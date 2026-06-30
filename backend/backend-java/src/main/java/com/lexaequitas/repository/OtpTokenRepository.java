package com.lexaequitas.repository;

import com.lexaequitas.model.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OtpTokenRepository extends JpaRepository<OtpToken, String> {
}
