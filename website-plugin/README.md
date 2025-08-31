# Primacy Care Australia - Website Application Plugin

This plugin automatically captures job applications from your website and sends them directly to your Primacy Care Australia CMS for immediate screening and processing.

## Features

- 🔄 **Automatic Application Capture** - Detects job application form submissions
- 📤 **Real-time CMS Integration** - Instantly sends applications to your CMS 
- 🎯 **Smart Field Mapping** - Automatically maps form fields to CMS structure
- 📎 **Document Handling** - Captures uploaded files (resumes, cover letters)
- 🛡️ **Error Handling** - Graceful fallbacks and error reporting
- 🔧 **Customizable** - Easy configuration for different website setups

## Quick Setup

### 1. Include the Plugin Script

Add this script to your job application pages:

```html
<script src="primacy-care-form-plugin.js"></script>
```

### 2. Configure Your CMS URL

Update the webhook URL in the plugin:

```javascript
PrimacyCarePlugin.config.cmsWebhookUrl = 'https://your-cms-domain.replit.app/api/intake/website-webhook';
```

### 3. Test the Integration

- Submit a test application on your website
- Check your CMS "Website Import" tab to see the application appear
- Applications will automatically start the screening process

## Configuration Options

### Basic Configuration

```javascript
PrimacyCarePlugin.config.cmsWebhookUrl = 'https://your-cms.replit.app/api/intake/website-webhook';
PrimacyCarePlugin.config.autoSubmit = true; // Automatically send to CMS
PrimacyCarePlugin.config.debug = false; // Set to true for testing
```

### Custom Form Selectors

If your forms have specific selectors:

```javascript
PrimacyCarePlugin.config.formSelectors = [
    '#my-job-form',
    '.application-form',
    'form[data-job-application]'
];
```

### Field Mappings

Map your form fields to CMS fields:

```javascript
PrimacyCarePlugin.config.fieldMappings = {
    name: ['applicant_name', 'full_name'],
    email: ['email_address', 'contact_email'],
    position: ['job_title', 'applying_for'],
    // Add more mappings as needed
};
```

## Integration Examples

### WordPress Job Board

```html
<!-- Add to your theme's functions.php or job application template -->
<script src="primacy-care-form-plugin.js"></script>
<script>
    // Configure for WordPress
    PrimacyCarePlugin.config.formSelectors = [
        '.job_application_form',
        '#job-manager-job-application-form'
    ];
</script>
```

### Custom Contact Form 7

```html
<script src="primacy-care-form-plugin.js"></script>
<script>
    // Configure for Contact Form 7
    PrimacyCarePlugin.config.formSelectors = [
        '.wpcf7-form[data-job-application]'
    ];
</script>
```

### Gravity Forms

```html
<script src="primacy-care-form-plugin.js"></script>
<script>
    // Configure for Gravity Forms
    PrimacyCarePlugin.config.formSelectors = [
        '#gform_1', // Replace with your form ID
        '.gform_wrapper form'
    ];
</script>
```

### Custom HTML Form

```html
<form id="job-application" class="application-form">
    <input name="full_name" type="text" placeholder="Full Name" required>
    <input name="email" type="email" placeholder="Email Address" required>
    <input name="phone" type="tel" placeholder="Phone Number">
    <select name="position">
        <option value="support-worker">Support Worker</option>
        <option value="team-coordinator">Team Coordinator</option>
    </select>
    <input name="resume" type="file" accept=".pdf,.doc,.docx">
    <textarea name="cover_letter" placeholder="Cover Letter"></textarea>
    <button type="submit">Apply Now</button>
</form>

<script src="primacy-care-form-plugin.js"></script>
```

## Advanced Usage

### Manual Form Submission

```javascript
// For custom integration with your application logic
const form = document.getElementById('my-job-form');
PrimacyCarePlugin.submitApplication(form)
    .then(result => {
        console.log('Application submitted:', result);
        // Show success message
    })
    .catch(error => {
        console.error('Submission failed:', error);
        // Handle error
    });
```

### Custom Data Processing

```javascript
// Extract and modify data before sending
const form = document.getElementById('my-job-form');
const data = PrimacyCarePlugin.extractFormData(form);

// Add custom fields
data.applicationData.referralSource = 'company-website';
data.applicationData.campaignId = 'summer-2025';

// Send manually
fetch('https://your-cms.replit.app/api/intake/website-webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
});
```

## Data Structure

Applications sent to your CMS include:

```javascript
{
    "websiteSource": "your-website.com",
    "applicantName": "John Smith",
    "email": "john@email.com",
    "phone": "+61 4 1234 5678",
    "position": "Support Worker Level 2",
    "submittedAt": "2025-01-03T10:30:00.000Z",
    "documents": [
        {
            "name": "resume.pdf",
            "type": "application/pdf",
            "size": 2048576,
            "lastModified": 1735826400000
        }
    ],
    "applicationData": {
        "experience": "2 years in disability support",
        "availability": "Full-time",
        "transport": "Own vehicle",
        "cover_letter": "I am passionate about..."
    }
}
```

## Troubleshooting

### Plugin Not Working?

1. **Check Console Errors**: Open browser dev tools and look for errors
2. **Enable Debug Mode**: Set `PrimacyCarePlugin.config.debug = true`
3. **Verify Webhook URL**: Ensure your CMS URL is correct and accessible
4. **Check Form Selectors**: Make sure the plugin can find your forms

### Common Issues

**Forms Not Detected**
```javascript
// Add your specific form selectors
PrimacyCarePlugin.config.formSelectors.push('#your-custom-form');
```

**Fields Not Mapping**
```javascript
// Add custom field mappings
PrimacyCarePlugin.config.fieldMappings.email.push('your_email_field');
```

**CORS Errors**
Your CMS is configured to accept requests from any domain. If you have issues, contact support.

## Security

- All data is transmitted securely via HTTPS
- No sensitive data is stored in the plugin
- File uploads are handled securely by your CMS
- The plugin only captures data from forms the user submits

## Support

For technical support or custom integration assistance:
- Email: support@primacycare.com.au
- Documentation: Check your CMS admin panel for detailed guides
- Custom Setup: We offer integration assistance for complex websites

## Version History

- **v1.0.0** - Initial release with automatic form detection
- **v1.1.0** - Added file upload support and custom field mappings
- **v1.2.0** - Enhanced WordPress and form builder compatibility