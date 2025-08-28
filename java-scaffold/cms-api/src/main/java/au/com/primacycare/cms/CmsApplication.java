package au.com.primacycare.cms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Main Spring Boot application class for Primacy Care Australia CMS
 * Mirrors the Node.js/Express server at server/index.ts
 */
@SpringBootApplication
@EnableCaching
@EnableAsync
@EnableScheduling
@EnableTransactionManagement
@EnableMethodSecurity(prePostEnabled = true)
public class CmsApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(CmsApplication.class, args);
    }
}