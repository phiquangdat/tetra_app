package com.tetra.app.config;

import com.tetra.app.repository.BlacklistedTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.context.annotation.Configuration;
import java.time.Instant;
import java.time.Duration;
import java.util.Date;

@Configuration
@org.springframework.scheduling.annotation.EnableScheduling
public class BlacklistedTokenCleanupConfig {

    @Autowired
    private BlacklistedTokenRepository blacklistedTokenRepository;

    @Scheduled(fixedDelay = 60 * 60 * 1000)
    public void cleanupOldTokens() {
        Date cutoff = Date.from(Instant.now().minus(Duration.ofHours(24)));
        blacklistedTokenRepository.deleteByBlacklistedAtBefore(cutoff);
    }
}