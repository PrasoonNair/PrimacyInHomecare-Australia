/**
 * Australian NDIS Terminology Helper
 * Ensures consistent use of Australian English and NDIS-specific terms
 */

export const AustralianTerminology = {
  // NDIS-specific terms
  participant: "Participant", // Not "Client" or "Customer"
  supportWorker: "Support Worker", // Not "Carer" or "Assistant"
  supportCoordinator: "Support Coordinator",
  planManager: "Plan Manager", 
  localAreaCoordinator: "Local Area Coordinator (LAC)",
  ndis: "NDIS",
  ndia: "NDIA", // National Disability Insurance Agency
  ndisCommission: "NDIS Quality and Safeguards Commission",
  
  // Australian English spelling
  organisation: "Organisation", // Not "Organization"
  centre: "Centre", // Not "Center"
  programme: "Programme", // Not "Program"
  licence: "Licence", // Not "License"
  practise: "Practise", // verb, Not "Practice"
  practice: "Practice", // noun
  colour: "Colour", // Not "Color"
  behaviour: "Behaviour", // Not "Behavior"
  cancelled: "Cancelled", // Not "Canceled"
  travelled: "Travelled", // Not "Traveled"
  
  // Service types
  sil: "Supported Independent Living (SIL)",
  sta: "Short Term Accommodation (STA)",
  respite: "Respite",
  communityAccess: "Community Access",
  assistiveTechnology: "Assistive Technology (AT)",
  
  // Common Australian phrases
  greeting: {
    morning: "G'day",
    afternoon: "Good arvo",
    evening: "Good evening",
    thanks: "Cheers",
    noWorries: "No worries",
    allGood: "All good"
  },
  
  // States and Territories
  states: {
    NSW: "New South Wales",
    VIC: "Victoria",
    QLD: "Queensland",
    WA: "Western Australia",
    SA: "South Australia",
    TAS: "Tasmania",
    ACT: "Australian Capital Territory",
    NT: "Northern Territory"
  },
  
  // Major cities
  cities: {
    sydney: "Sydney",
    melbourne: "Melbourne",
    brisbane: "Brisbane",
    perth: "Perth",
    adelaide: "Adelaide",
    hobart: "Hobart",
    darwin: "Darwin",
    canberra: "Canberra"
  },
  
  // Date/Time formats
  dateFormat: "DD/MM/YYYY",
  timeFormat12: "h:mm a",
  timeFormat24: "HH:mm",
  
  // Phone formats
  phoneFormat: {
    mobile: "04XX XXX XXX",
    landline: "(0X) XXXX XXXX",
    emergency: "000",
    ndisHotline: "1800 800 110"
  },
  
  // Currency
  currency: {
    symbol: "$",
    code: "AUD",
    format: "$X,XXX.XX"
  },
  
  // Measurements
  measurements: {
    distance: "kilometres",
    weight: "kilograms",
    temperature: "Celsius"
  },
  
  // NDIS Plan terminology
  plan: {
    goals: "Goals",
    outcomes: "Outcomes",
    coreSupports: "Core Supports",
    capacityBuilding: "Capacity Building",
    capitalSupports: "Capital Supports",
    statedSupports: "Stated Supports",
    planReview: "Plan Review",
    planReassessment: "Plan Reassessment"
  },
  
  // Funding terminology
  funding: {
    selfManaged: "Self-Managed",
    planManaged: "Plan-Managed", 
    agencyManaged: "Agency-Managed (NDIA-Managed)",
    registeredProvider: "Registered Provider",
    unregisteredProvider: "Unregistered Provider"
  },
  
  // Common NDIS abbreviations
  abbreviations: {
    AAT: "Administrative Appeals Tribunal",
    AT: "Assistive Technology",
    CBS: "Capacity Building Supports",
    ECEI: "Early Childhood Early Intervention",
    ILC: "Information, Linkages and Capacity Building",
    LAC: "Local Area Coordinator",
    NDIA: "National Disability Insurance Agency",
    NDIS: "National Disability Insurance Scheme",
    OT: "Occupational Therapist",
    PBS: "Positive Behaviour Support",
    SCHADS: "Social, Community, Home Care and Disability Services Award",
    SDA: "Specialist Disability Accommodation",
    SIL: "Supported Independent Living",
    STA: "Short Term Accommodation"
  }
};

/**
 * Helper function to format Australian phone numbers
 */
export function formatAustralianPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  // Mobile number
  if (cleaned.startsWith('04') || cleaned.startsWith('4')) {
    const mobile = cleaned.startsWith('4') ? '0' + cleaned : cleaned;
    return mobile.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  
  // Landline
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2 $3');
  }
  
  return phone;
}

/**
 * Helper function to format Australian dates
 */
export function formatAustralianDate(date: Date | string): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Helper function to format Australian currency
 */
export function formatAustralianCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Helper function to validate Australian postcode
 */
export function validateAustralianPostcode(postcode: string): boolean {
  const cleaned = postcode.replace(/\s/g, '');
  
  // Australian postcodes are 4 digits
  if (!/^\d{4}$/.test(cleaned)) {
    return false;
  }
  
  const code = parseInt(cleaned, 10);
  
  // Valid ranges for each state/territory
  const validRanges = [
    { min: 1000, max: 2599 }, // NSW
    { min: 2619, max: 2899 }, // NSW
    { min: 2921, max: 2999 }, // NSW
    { min: 2600, max: 2618 }, // ACT
    { min: 2900, max: 2920 }, // ACT
    { min: 3000, max: 3999 }, // VIC
    { min: 4000, max: 4999 }, // QLD
    { min: 5000, max: 5799 }, // SA
    { min: 5800, max: 5999 }, // SA
    { min: 6000, max: 6797 }, // WA
    { min: 6800, max: 6999 }, // WA
    { min: 7000, max: 7799 }, // TAS
    { min: 7800, max: 7999 }, // TAS
    { min: 800, max: 899 },   // NT
    { min: 900, max: 999 }    // NT
  ];
  
  return validRanges.some(range => code >= range.min && code <= range.max);
}

/**
 * Get Australian public holidays
 */
export function getAustralianPublicHolidays(year: number, state: string) {
  const holidays = [
    { date: `${year}-01-01`, name: "New Year's Day", national: true },
    { date: `${year}-01-26`, name: "Australia Day", national: true },
    { date: `${year}-04-25`, name: "ANZAC Day", national: true },
    { date: `${year}-12-25`, name: "Christmas Day", national: true },
    { date: `${year}-12-26`, name: "Boxing Day", national: true }
  ];
  
  // Add state-specific holidays
  switch(state) {
    case 'NSW':
      holidays.push({ date: `${year}-06-12`, name: "Queen's Birthday", national: false });
      break;
    case 'VIC':
      holidays.push({ date: `${year}-11-07`, name: "Melbourne Cup Day", national: false });
      break;
    // Add more state-specific holidays as needed
  }
  
  return holidays;
}