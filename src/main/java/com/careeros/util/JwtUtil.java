package com.careeros.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import com.careeros.util.DatabaseManager;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Properties;
import java.util.logging.Logger;

public class JwtUtil {

    private static final Logger logger = Logger.getLogger(JwtUtil.class.getName());
    private static final Properties props = DatabaseManager.getInstance().getProperties();
    private static final String SECRET = props.getProperty("jwt.secret");
    private static final long EXPIRY = Long.parseLong(props.getProperty("jwt.expiry", "86400000"));

    private static SecretKey getSigningKey() {
        byte[] keyBytes = SECRET.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public static String generateToken(long userId, String email, String role) {
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("email", email)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRY))
                .signWith(getSigningKey())
                .compact();
    }

    public static Claims validateToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            logger.warning("Invalid JWT token: " + e.getMessage());
            return null;
        }
    }

    public static long getUserIdFromToken(String token) {
        Claims claims = validateToken(token);
        if (claims != null) {
            return Long.parseLong(claims.getSubject());
        }
        return -1;
    }

    public static String getRoleFromToken(String token) {
        Claims claims = validateToken(token);
        if (claims != null) {
            return claims.get("role", String.class);
        }
        return null;
    }

    public static boolean isTokenValid(String token) {
        return validateToken(token) != null;
    }
}