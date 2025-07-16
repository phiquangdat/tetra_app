package com.tetra.app.security;

import com.tetra.app.model.Role;
import com.tetra.app.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
  "jwt.secret=super-secret-key-change-me-very-long-and-secure"
})
public class JwtUtilTest {

    @Autowired
    private JwtUtil jwtUtil;

    @Test
    public void testTokenExpirationWithin24Hours() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("test@example.com");
        user.setRole(Role.LEARNER);

        String secret = "super-secret-key-change-me-very-long-and-secure";

        String token = jwtUtil.generateToken(user);

        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        Date expiration = claims.getExpiration();
        Date now = new Date();

        assertNotNull(expiration);
        assertTrue(expiration.after(now));

        assertTrue((expiration.getTime() - now.getTime()) <= 86400000);
    }
}
