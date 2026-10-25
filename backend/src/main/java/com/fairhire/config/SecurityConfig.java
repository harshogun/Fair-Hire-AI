package com.fairhire.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationEntryPoint customAuthenticationEntryPoint() {
        return (request, response, authException) -> {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"status\":401,\"error\":\"UNAUTHORIZED\",\"message\":\"Full authentication is required to access this resource\"}");
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .headers(headers -> headers.frameOptions(frame -> frame.disable())) // Allows H2 console
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(customAuthenticationEntryPoint())
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"status\":403,\"error\":\"FORBIDDEN\",\"message\":\"Access denied: Insufficient role permissions for this resource.\"}");
                        })
                )
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/v1/auth/**",
                                "/api/health/**",
                                "/api/v1/health/**",
                                "/api/jobs/*/self-screen/**",
                                "/api/v1/jobs/*/self-screen/**",
                                "/api/jobs/*/apply/**",
                                "/api/v1/jobs/*/apply/**",
                                "/api/sample-jds/**",
                                "/api/v1/sample-jds/**",
                                "/api/run-comparison/**",
                                "/api/v1/run-comparison/**",
                                "/api/analyze-jd/**",
                                "/api/results/**",
                                "/api/v1/results/**",
                                "/api/export/**",
                                "/api/v1/export/**",
                                "/api/reports/export",
                                "/api/v1/reports/export",
                                "/h2-console/**",
                                "/error"
                        ).permitAll()
                        // Research / Admin endpoints - STRICT ADMIN ROLE REQUIRED
                        .requestMatchers(
                                "/api/reports/**",
                                "/api/v1/reports/**"
                        ).hasRole("ADMIN")
                        // Audit history endpoints - AUTHENTICATED ACCESS REQUIRED
                        .requestMatchers(
                                "/api/history/**",
                                "/api/v1/history/**"
                        ).authenticated()
                        // Phase 4 matching endpoints - STRICT AUTHENTICATION REQUIRED
                        .requestMatchers(
                                "/api/v1/jobs/*/matches",
                                "/api/v1/jobs/*/matches/**",
                                "/api/jobs/*/matches",
                                "/api/jobs/*/matches/**"
                        ).authenticated()
                        // Maintain existing access for other endpoints
                        .anyRequest().permitAll()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
