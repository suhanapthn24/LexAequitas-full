package com.lexaequitas.service;

import org.springframework.stereotype.Service;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.util.retry.Retry;

import java.time.Duration;

@Service
public class DocumentAnalyzerService {

    private final WebClient webClient;

    public DocumentAnalyzerService() {
        this.webClient = WebClient.builder()
                .baseUrl("https://mpj-backend-python-1.onrender.com")
                .codecs(c -> c.defaultCodecs().maxInMemorySize(4 * 1024 * 1024))
                .build();
    }

    public String analyseDocument(byte[] fileBytes) {
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("file", fileBytes)
               .filename("document.pdf")
               .contentType(MediaType.APPLICATION_OCTET_STREAM);

        return webClient.post()
                .uri("/analyse")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .bodyValue(builder.build())
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(120))
                .retryWhen(Retry.fixedDelay(2, Duration.ofSeconds(30))
                        .filter(e -> e instanceof WebClientResponseException &&
                                ((WebClientResponseException) e).getStatusCode().value() == 502))
                .block();
    }
}
