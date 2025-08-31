/**
 * Primacy Care Australia - Website Application Plugin
 * Automatically captures job applications from your website and sends them to the CMS
 * 
 * Installation:
 * 1. Include this script on your careers/job application pages
 * 2. Configure your CMS webhook URL
 * 3. Customize form selectors as needed
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        // Replace with your actual CMS domain
        cmsWebhookUrl: 'https://your-cms-domain.replit.app/api/intake/website-webhook',
        
        // Form selectors - customize for your website
        formSelectors: [
            'form[id*="job"]',
            'form[id*="application"]', 
            'form[id*="career"]',
            'form[class*="job"]',
            'form[class*="application"]',
            '.job-application-form',
            '#career-form',
            '#job-application'
        ],
        
        // Field mappings - map your form fields to CMS expected fields
        fieldMappings: {
            name: ['name', 'full_name', 'applicant_name', 'fullname'],
            firstName: ['first_name', 'fname', 'firstname'],
            lastName: ['last_name', 'lname', 'lastname', 'surname'],
            email: ['email', 'email_address', 'contact_email'],
            phone: ['phone', 'telephone', 'mobile', 'contact_number', 'phone_number'],
            position: ['position', 'job_title', 'role', 'job_position', 'applying_for'],
            experience: ['experience', 'work_experience', 'previous_experience', 'years_experience'],
            availability: ['availability', 'available_hours', 'preferred_hours'],
            transport: ['transport', 'transportation', 'reliable_transport'],
            cover_letter: ['cover_letter', 'motivation', 'why_apply', 'message'],
            resume: ['resume', 'cv', 'curriculum_vitae'],
            certifications: ['certifications', 'qualifications', 'certificates']
        },

        // Auto-submit to CMS after form submission
        autoSubmit: true,
        
        // Debug mode - set to false in production
        debug: false
    };

    // Utility functions
    function log(message, data = null) {
        if (CONFIG.debug) {
            console.log('[Primacy Care Plugin]', message, data);
        }
    }

    function getWebsiteSource() {
        return window.location.hostname;
    }

    function findFieldValue(form, fieldNames) {
        for (const fieldName of fieldNames) {
            // Try different selector patterns
            const selectors = [
                `[name="${fieldName}"]`,
                `[name*="${fieldName}"]`,
                `[id="${fieldName}"]`,
                `[id*="${fieldName}"]`,
                `[class*="${fieldName}"]`
            ];
            
            for (const selector of selectors) {
                const element = form.querySelector(selector);
                if (element) {
                    if (element.type === 'file') {
                        return element.files;
                    } else if (element.type === 'checkbox' || element.type === 'radio') {
                        return element.checked ? element.value : '';
                    } else {
                        return element.value;
                    }
                }
            }
        }
        return '';
    }

    function extractFormData(form) {
        const data = {
            websiteSource: getWebsiteSource(),
            submittedAt: new Date().toISOString(),
            applicationData: {},
            documents: []
        };

        // Extract mapped fields
        for (const [key, fieldNames] of Object.entries(CONFIG.fieldMappings)) {
            const value = findFieldValue(form, fieldNames);
            if (value) {
                if (key === 'name' && !data.applicantName) {
                    data.applicantName = value;
                } else if (key === 'firstName' || key === 'lastName') {
                    if (!data.applicantName) {
                        data.applicantName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
                    }
                    data[key] = value;
                } else if (['email', 'phone', 'position'].includes(key)) {
                    data[key] = value;
                } else if (value instanceof FileList) {
                    // Handle file uploads
                    for (const file of value) {
                        data.documents.push({
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            lastModified: file.lastModified
                        });
                    }
                } else {
                    data.applicationData[key] = value;
                }
            }
        }

        // If no applicantName found, try to construct from firstName + lastName
        if (!data.applicantName && (data.firstName || data.lastName)) {
            data.applicantName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
        }

        // Extract any additional form data not in mappings
        const formData = new FormData(form);
        for (const [key, value] of formData.entries()) {
            if (!data.applicationData[key] && value && typeof value === 'string') {
                data.applicationData[key] = value;
            }
        }

        return data;
    }

    async function sendToCMS(applicationData) {
        try {
            log('Sending application to CMS', applicationData);
            
            const response = await fetch(CONFIG.cmsWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(applicationData)
            });

            if (response.ok) {
                const result = await response.json();
                log('Application sent successfully', result);
                
                // Show success message to user (optional)
                if (CONFIG.debug) {
                    alert('Application submitted successfully to Primacy Care Australia CMS!');
                }
                
                return result;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('[Primacy Care Plugin] Error sending application:', error);
            
            // Optionally show error to user
            if (CONFIG.debug) {
                alert('There was an issue submitting your application. Please try again.');
            }
            
            throw error;
        }
    }

    function setupFormInterception() {
        // Find application forms on the page
        const forms = [];
        
        for (const selector of CONFIG.formSelectors) {
            const foundForms = document.querySelectorAll(selector);
            forms.push(...foundForms);
        }

        log(`Found ${forms.length} potential application forms`);

        forms.forEach((form, index) => {
            log(`Setting up form ${index + 1}`, form);
            
            form.addEventListener('submit', async function(event) {
                log('Form submission detected', form);
                
                if (!CONFIG.autoSubmit) {
                    return; // Let normal form submission proceed
                }

                try {
                    // Extract form data
                    const applicationData = extractFormData(form);
                    
                    // Validate required fields
                    if (!applicationData.applicantName || !applicationData.email) {
                        log('Missing required fields, skipping CMS submission');
                        return;
                    }

                    // Send to CMS (don't prevent normal form submission)
                    await sendToCMS(applicationData);
                    
                } catch (error) {
                    console.error('[Primacy Care Plugin] Error processing form submission:', error);
                }
            });
        });
    }

    // Manual submission function (for custom integration)
    function submitApplicationToCMS(formElement) {
        const applicationData = extractFormData(formElement);
        return sendToCMS(applicationData);
    }

    // Initialize when DOM is ready
    function initialize() {
        log('Initializing Primacy Care Application Plugin');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupFormInterception);
        } else {
            setupFormInterception();
        }
        
        // Also watch for dynamically added forms
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Element node
                            for (const selector of CONFIG.formSelectors) {
                                if (node.matches && node.matches(selector)) {
                                    log('New form detected, setting up interception');
                                    setupFormInterception();
                                    break;
                                }
                            }
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Expose public API
    window.PrimacyCarePlugin = {
        config: CONFIG,
        submitApplication: submitApplicationToCMS,
        extractFormData: extractFormData,
        initialize: initialize
    };

    // Auto-initialize
    initialize();

})();

/**
 * Usage Examples:
 * 
 * 1. Basic automatic setup (most common):
 *    Just include this script and it will automatically detect and intercept job application forms
 * 
 * 2. Custom form integration:
 *    PrimacyCarePlugin.submitApplication(document.getElementById('my-job-form'));
 * 
 * 3. Custom configuration:
 *    PrimacyCarePlugin.config.cmsWebhookUrl = 'https://your-cms.replit.app/api/intake/website-webhook';
 *    PrimacyCarePlugin.config.debug = true;
 * 
 * 4. Manual data extraction:
 *    const data = PrimacyCarePlugin.extractFormData(formElement);
 */