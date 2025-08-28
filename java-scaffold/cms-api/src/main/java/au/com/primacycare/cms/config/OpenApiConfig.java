package au.com.primacycare.cms.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.examples.Example;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.parameters.Parameter;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Map;

/**
 * OpenAPI 3.1 specification configuration
 * Generates comprehensive API documentation matching Node.js endpoints
 */
@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "Primacy Care Australia CMS API",
        version = "2.0.0",
        description = """
            Comprehensive NDIS case management system API for managing participants, 
            staff, services, and compliance. This API provides full lifecycle management 
            for NDIS service delivery with enterprise-grade security and audit capabilities.
            
            ## Key Features
            - NDIS participant management
            - Staff scheduling and rostering
            - Service delivery tracking
            - NDIS plan management
            - Invoice generation and Xero integration
            - Compliance reporting
            - Real-time notifications
            
            ## Authentication
            All endpoints require Bearer token authentication via Keycloak OIDC.
            
            ## Rate Limiting
            - 1000 requests per minute per API key
            - 10,000 requests per hour per API key
            
            ## Environments
            - Development: http://localhost:5000/api
            - Staging: https://staging-api.primacycare.com.au
            - Production: https://api.primacycare.com.au
            """,
        contact = @Contact(
            name = "Primacy Care Support",
            email = "support@primacycare.com.au",
            url = "https://primacycare.com.au"
        ),
        license = @License(
            name = "Proprietary",
            url = "https://primacycare.com.au/license"
        )
    ),
    servers = {
        @Server(url = "http://localhost:5000/api", description = "Local Development"),
        @Server(url = "https://staging-api.primacycare.com.au", description = "Staging"),
        @Server(url = "https://api.primacycare.com.au", description = "Production")
    },
    security = @SecurityRequirement(name = "bearer-jwt")
)
@SecurityScheme(
    name = "bearer-jwt",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    description = "JWT Bearer token from Keycloak"
)
public class OpenApiConfig {
    
    @Bean
    public OpenApiCustomizer customerGlobalHeaderOpenApiCustomizer() {
        return openApi -> {
            // Add common parameters
            openApi.getPaths().values().forEach(pathItem -> {
                pathItem.readOperations().forEach(operation -> {
                    // Add common headers
                    operation.addParametersItem(correlationIdParameter());
                    
                    // Add common responses
                    ApiResponses responses = operation.getResponses();
                    if (responses != null) {
                        responses.putAll(commonErrorResponses());
                    }
                    
                    // Add pagination headers for GET operations
                    if ("GET".equals(operation.getMethod())) {
                        operation.addParametersItem(pageParameter());
                        operation.addParametersItem(limitParameter());
                        operation.addParametersItem(sortParameter());
                    }
                });
            });
            
            // Add webhook definitions
            addWebhookDefinitions(openApi);
            
            // Add callback definitions
            addCallbackDefinitions(openApi);
        };
    }
    
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .components(new io.swagger.v3.oas.models.Components()
                .addSchemas("Error", errorSchema())
                .addSchemas("ValidationError", validationErrorSchema())
                .addSchemas("PagedResponse", pagedResponseSchema())
                .addExamples("ParticipantExample", participantExample())
                .addExamples("StaffExample", staffExample())
                .addExamples("ServiceExample", serviceExample())
                .addExamples("InvoiceExample", invoiceExample())
                .addExamples("ErrorExample", errorExample())
                .addResponses("BadRequest", badRequestResponse())
                .addResponses("Unauthorized", unauthorizedResponse())
                .addResponses("Forbidden", forbiddenResponse())
                .addResponses("NotFound", notFoundResponse())
                .addResponses("Conflict", conflictResponse())
                .addResponses("ServerError", serverErrorResponse())
            );
    }
    
    private Parameter correlationIdParameter() {
        return new Parameter()
            .in("header")
            .name("X-Correlation-ID")
            .description("Unique request identifier for tracing")
            .required(false)
            .schema(new Schema().type("string").format("uuid"));
    }
    
    private Parameter pageParameter() {
        return new Parameter()
            .in("query")
            .name("page")
            .description("Page number (1-indexed)")
            .required(false)
            .schema(new Schema().type("integer").minimum(1).defaultValue(1));
    }
    
    private Parameter limitParameter() {
        return new Parameter()
            .in("query")
            .name("limit")
            .description("Number of items per page")
            .required(false)
            .schema(new Schema().type("integer").minimum(1).maximum(200).defaultValue(50));
    }
    
    private Parameter sortParameter() {
        return new Parameter()
            .in("query")
            .name("sort")
            .description("Sort field and direction (e.g., 'createdAt:desc')")
            .required(false)
            .schema(new Schema().type("string").pattern("^[a-zA-Z]+:(asc|desc)$"));
    }
    
    private Map<String, ApiResponse> commonErrorResponses() {
        return Map.of(
            "400", new ApiResponse().$ref("#/components/responses/BadRequest"),
            "401", new ApiResponse().$ref("#/components/responses/Unauthorized"),
            "403", new ApiResponse().$ref("#/components/responses/Forbidden"),
            "404", new ApiResponse().$ref("#/components/responses/NotFound"),
            "409", new ApiResponse().$ref("#/components/responses/Conflict"),
            "500", new ApiResponse().$ref("#/components/responses/ServerError")
        );
    }
    
    private Schema errorSchema() {
        return new Schema()
            .type("object")
            .required(List.of("error", "message", "timestamp", "path"))
            .addProperty("error", new Schema().type("string").description("Error type"))
            .addProperty("message", new Schema().type("string").description("Error message"))
            .addProperty("timestamp", new Schema().type("string").format("date-time"))
            .addProperty("path", new Schema().type("string").description("Request path"))
            .addProperty("correlationId", new Schema().type("string").format("uuid"));
    }
    
    private Schema validationErrorSchema() {
        return new Schema()
            .type("object")
            .required(List.of("errors"))
            .addProperty("errors", new Schema()
                .type("array")
                .items(new Schema()
                    .type("object")
                    .addProperty("field", new Schema().type("string"))
                    .addProperty("message", new Schema().type("string"))
                    .addProperty("code", new Schema().type("string"))
                )
            );
    }
    
    private Schema pagedResponseSchema() {
        return new Schema()
            .type("object")
            .required(List.of("data", "pagination"))
            .addProperty("data", new Schema().type("array").items(new Schema().$ref("#/components/schemas/Object")))
            .addProperty("pagination", new Schema()
                .type("object")
                .addProperty("page", new Schema().type("integer"))
                .addProperty("limit", new Schema().type("integer"))
                .addProperty("total", new Schema().type("integer"))
                .addProperty("pages", new Schema().type("integer"))
            );
    }
    
    private Example participantExample() {
        return new Example()
            .summary("Valid participant")
            .value(Map.of(
                "id", "550e8400-e29b-41d4-a716-446655440000",
                "firstName", "John",
                "lastName", "Smith",
                "ndisNumber", "430000001",
                "dateOfBirth", "1990-01-15",
                "email", "john.smith@example.com",
                "phone", "0412345678",
                "address", "123 Main St, Sydney NSW 2000",
                "fundingType", "Plan Managed",
                "createdAt", "2024-01-15T10:30:00.000Z",
                "updatedAt", "2024-01-15T10:30:00.000Z"
            ));
    }
    
    private Example staffExample() {
        return new Example()
            .summary("Valid staff member")
            .value(Map.of(
                "id", "660e8400-e29b-41d4-a716-446655440001",
                "firstName", "Jane",
                "lastName", "Doe",
                "email", "jane.doe@primacycare.com.au",
                "phone", "0498765432",
                "position", "Support Worker",
                "department", "SERVICE_DELIVERY",
                "employmentType", "FULL_TIME",
                "startDate", "2023-06-01",
                "qualifications", List.of("Certificate IV in Disability", "First Aid"),
                "createdAt", "2023-06-01T09:00:00.000Z"
            ));
    }
    
    private Example serviceExample() {
        return new Example()
            .summary("Valid service")
            .value(Map.of(
                "id", "770e8400-e29b-41d4-a716-446655440002",
                "participantId", "550e8400-e29b-41d4-a716-446655440000",
                "serviceType", "Personal Care",
                "category", "CORE",
                "itemNumber", "01_011_0107_1_1",
                "scheduledDate", "2024-02-01",
                "startTime", "09:00",
                "endTime", "11:00",
                "durationMinutes", 120,
                "rate", 65.09,
                "totalCost", 130.18,
                "assignedTo", "660e8400-e29b-41d4-a716-446655440001"
            ));
    }
    
    private Example invoiceExample() {
        return new Example()
            .summary("Valid invoice")
            .value(Map.of(
                "id", "880e8400-e29b-41d4-a716-446655440003",
                "participantId", "550e8400-e29b-41d4-a716-446655440000",
                "invoiceNumber", "INV-000001",
                "issueDate", "2024-01-31",
                "dueDate", "2024-02-14",
                "subtotal", 1301.80,
                "gst", 130.18,
                "total", 1431.98,
                "status", "SENT",
                "lineItems", List.of(
                    Map.of(
                        "description", "Personal Care - 2 hours",
                        "itemNumber", "01_011_0107_1_1",
                        "quantity", 10,
                        "unitPrice", 130.18,
                        "lineTotal", 1301.80
                    )
                )
            ));
    }
    
    private Example errorExample() {
        return new Example()
            .summary("Error response")
            .value(Map.of(
                "error", "ResourceNotFound",
                "message", "Participant not found with ID: 550e8400-e29b-41d4-a716-446655440000",
                "timestamp", "2024-01-15T10:30:00.000Z",
                "path", "/api/participants/550e8400-e29b-41d4-a716-446655440000",
                "correlationId", "990e8400-e29b-41d4-a716-446655440004"
            ));
    }
    
    private ApiResponse badRequestResponse() {
        return new ApiResponse()
            .description("Bad Request - Invalid input data")
            .content(new Content()
                .addMediaType("application/json", 
                    new MediaType().schema(new Schema().$ref("#/components/schemas/ValidationError"))));
    }
    
    private ApiResponse unauthorizedResponse() {
        return new ApiResponse()
            .description("Unauthorized - Invalid or missing authentication")
            .content(new Content()
                .addMediaType("application/json", 
                    new MediaType().schema(new Schema().$ref("#/components/schemas/Error"))));
    }
    
    private ApiResponse forbiddenResponse() {
        return new ApiResponse()
            .description("Forbidden - Insufficient permissions")
            .content(new Content()
                .addMediaType("application/json", 
                    new MediaType().schema(new Schema().$ref("#/components/schemas/Error"))));
    }
    
    private ApiResponse notFoundResponse() {
        return new ApiResponse()
            .description("Not Found - Resource does not exist")
            .content(new Content()
                .addMediaType("application/json", 
                    new MediaType().schema(new Schema().$ref("#/components/schemas/Error"))));
    }
    
    private ApiResponse conflictResponse() {
        return new ApiResponse()
            .description("Conflict - Resource already exists")
            .content(new Content()
                .addMediaType("application/json", 
                    new MediaType().schema(new Schema().$ref("#/components/schemas/Error"))));
    }
    
    private ApiResponse serverErrorResponse() {
        return new ApiResponse()
            .description("Internal Server Error")
            .content(new Content()
                .addMediaType("application/json", 
                    new MediaType().schema(new Schema().$ref("#/components/schemas/Error"))));
    }
    
    private void addWebhookDefinitions(OpenAPI openApi) {
        // TODO: Add webhook definitions for real-time events
        // - Participant created/updated
        // - Service scheduled/completed
        // - Invoice generated/paid
        // - Staff onboarded/offboarded
    }
    
    private void addCallbackDefinitions(OpenAPI openApi) {
        // TODO: Add callback definitions for async operations
        // - Report generation callbacks
        // - Bulk import callbacks
        // - Payment processing callbacks
    }
}