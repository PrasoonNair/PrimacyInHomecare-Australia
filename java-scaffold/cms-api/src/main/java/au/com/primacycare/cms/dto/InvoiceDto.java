package au.com.primacycare.cms.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Invoice DTOs with Jakarta Validation for NDIS billing
 */
@Data
public class InvoiceDto {
    
    private String id;
    
    @NotNull(message = "Participant ID is required")
    private String participantId;
    
    private String planId;
    
    @NotBlank(message = "Invoice number is required")
    @Pattern(regexp = "^INV-\\d{6}$", message = "Invoice number must be format INV-XXXXXX")
    private String invoiceNumber;
    
    @NotNull(message = "Issue date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate issueDate;
    
    @Future(message = "Due date must be in the future")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dueDate;
    
    @DecimalMin(value = "0.00", message = "Subtotal must be positive")
    @Digits(integer = 10, fraction = 2)
    private BigDecimal subtotal;
    
    @DecimalMin(value = "0.00", message = "GST must be positive")
    @Digits(integer = 10, fraction = 2)
    private BigDecimal gst;
    
    @NotNull(message = "Total is required")
    @DecimalMin(value = "0.01", message = "Total must be greater than zero")
    @Digits(integer = 10, fraction = 2)
    private BigDecimal total;
    
    @NotNull(message = "Invoice status is required")
    private InvoiceStatusEnum status;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate paidDate;
    
    private PaymentMethodEnum paymentMethod;
    
    private String xeroInvoiceId;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime updatedAt;
    
    // Nested DTOs
    private ParticipantSummaryDto participant;
    private NdisPlanSummaryDto ndisPlan;
    private List<InvoiceLineDto> lineItems;
    
    // Invoice Status Enum
    public enum InvoiceStatusEnum {
        DRAFT("Draft"),
        PENDING("Pending"),
        SENT("Sent"),
        APPROVED("Approved"),
        PAID("Paid"),
        OVERDUE("Overdue"),
        CANCELLED("Cancelled"),
        DISPUTED("Disputed");
        
        private final String displayName;
        
        InvoiceStatusEnum(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    // Payment Method Enum
    public enum PaymentMethodEnum {
        BANK_TRANSFER("Bank Transfer"),
        CREDIT_CARD("Credit Card"),
        DIRECT_DEBIT("Direct Debit"),
        NDIS_PORTAL("NDIS Portal"),
        PLAN_MANAGER("Plan Manager"),
        SELF_MANAGED("Self Managed");
        
        private final String displayName;
        
        PaymentMethodEnum(String displayName) {
            this.displayName = displayName;
        }
    }
}

@Data
class InvoiceLineDto {
    
    @NotNull(message = "Service ID is required")
    private String serviceId;
    
    @NotBlank(message = "Description is required")
    @Size(max = 500)
    private String description;
    
    @Pattern(regexp = "^\\d{2}_\\d{3}_\\d{4}_\\d{1}_\\d{1}$", 
             message = "Item number must match NDIS format")
    private String itemNumber;
    
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Max(value = 999, message = "Quantity cannot exceed 999")
    private Integer quantity;
    
    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.01", message = "Unit price must be positive")
    @Digits(integer = 8, fraction = 2)
    private BigDecimal unitPrice;
    
    @DecimalMin(value = "0.00")
    @Digits(integer = 10, fraction = 2)
    private BigDecimal lineTotal;
    
    private String serviceDate;
    private String staffName;
}

@Data
class CreateInvoiceDto {
    
    @NotNull(message = "Participant ID is required")
    private String participantId;
    
    private String planId;
    
    @NotNull(message = "Issue date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate issueDate;
    
    @Future(message = "Due date must be in the future")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dueDate;
    
    @NotEmpty(message = "Invoice must have line items")
    @Valid
    private List<CreateInvoiceLineDto> lineItems;
    
    private InvoiceDto.InvoiceStatusEnum status = InvoiceDto.InvoiceStatusEnum.DRAFT;
}

@Data
class CreateInvoiceLineDto {
    
    @NotNull(message = "Service ID is required")
    private String serviceId;
    
    @NotBlank(message = "Description is required")
    @Size(max = 500)
    private String description;
    
    @Pattern(regexp = "^\\d{2}_\\d{3}_\\d{4}_\\d{1}_\\d{1}$")
    private String itemNumber;
    
    @NotNull(message = "Quantity is required")
    @Min(1)
    @Max(999)
    private Integer quantity;
    
    @NotNull(message = "Unit price is required")
    @DecimalMin("0.01")
    @Digits(integer = 8, fraction = 2)
    private BigDecimal unitPrice;
}

@Data
class UpdateInvoiceDto {
    
    private LocalDate issueDate;
    private LocalDate dueDate;
    private InvoiceDto.InvoiceStatusEnum status;
    private InvoiceDto.PaymentMethodEnum paymentMethod;
    private LocalDate paidDate;
    private List<CreateInvoiceLineDto> lineItems;
}

@Data
class NdisPlanSummaryDto {
    private String id;
    private String planNumber;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalBudget;
    private BigDecimal remainingBudget;
    private String status;
}