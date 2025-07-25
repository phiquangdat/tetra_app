package com.tetra.app.config;

import java.time.Duration;
import java.time.Instant;
import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.Scheduled;

import com.tetra.app.repository.BlacklistedTokenRepository;

@Configuration
@org.springframework.scheduling.annotation.EnableScheduling
public class BlacklistedTokenCleanupConfig {

    @Autowired
    private BlacklistedTokenRepository blacklistedTokenRepository;

    @Scheduled(fixedDelay = 60 * 60 * 1000)
    @org.springframework.transaction.annotation.Transactional
    public void cleanupOldTokens() {
        Date cutoff = Date.from(Instant.now().minus(Duration.ofHours(24)));
        blacklistedTokenRepository.deleteByBlacklistedAtBefore(cutoff);
    }
}
