import NodeCache from 'node-cache';

// Create cache instances with different TTLs for different data types
const dashboardCache = new NodeCache({ stdTTL: 300 }); // 5 minutes
const participantCache = new NodeCache({ stdTTL: 600 }); // 10 minutes
const staffCache = new NodeCache({ stdTTL: 900 }); // 15 minutes
const kpiCache = new NodeCache({ stdTTL: 1800 }); // 30 minutes
const priceGuideCache = new NodeCache({ stdTTL: 86400 }); // 24 hours
const generalCache = new NodeCache({ stdTTL: 600 }); // 10 minutes default

// Cache key generators
export const cacheKeys = {
  dashboardStats: (userId?: string) => `dashboard:stats:${userId || 'all'}`,
  participantList: (filters?: string) => `participants:list:${filters || 'all'}`,
  participantDetails: (id: string) => `participant:${id}`,
  staffList: (department?: string) => `staff:list:${department || 'all'}`,
  staffAvailability: (staffId: string, week?: string) => `staff:availability:${staffId}:${week || 'current'}`,
  kpiMetrics: (role?: string, period?: string) => `kpi:${role || 'all'}:${period || 'current'}`,
  serviceSchedule: (date?: string) => `services:schedule:${date || 'today'}`,
  priceGuide: () => 'ndis:priceguide:current',
  invoiceStats: (period?: string) => `invoices:stats:${period || 'month'}`,
  shiftOffers: (staffId?: string) => `shifts:offers:${staffId || 'all'}`
};

// Cache wrapper functions
export async function getCachedData<T>(
  cache: NodeCache,
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached !== undefined) {
    return cached;
  }
  
  const data = await fetchFn();
  cache.set(key, data, ttl);
  return data;
}

// Dashboard stats cache
export async function getCachedDashboardStats(
  fetchFn: () => Promise<any>,
  userId?: string
): Promise<any> {
  return getCachedData(
    dashboardCache,
    cacheKeys.dashboardStats(userId),
    fetchFn
  );
}

// Participants cache
export async function getCachedParticipants(
  fetchFn: () => Promise<any>,
  filters?: string
): Promise<any> {
  return getCachedData(
    participantCache,
    cacheKeys.participantList(filters),
    fetchFn
  );
}

// Staff cache
export async function getCachedStaff(
  fetchFn: () => Promise<any>,
  department?: string
): Promise<any> {
  return getCachedData(
    staffCache,
    cacheKeys.staffList(department),
    fetchFn
  );
}

// KPI cache
export async function getCachedKPIs(
  fetchFn: () => Promise<any>,
  role?: string,
  period?: string
): Promise<any> {
  return getCachedData(
    kpiCache,
    cacheKeys.kpiMetrics(role, period),
    fetchFn
  );
}

// Price guide cache
export async function getCachedPriceGuide(
  fetchFn: () => Promise<any>
): Promise<any> {
  return getCachedData(
    priceGuideCache,
    cacheKeys.priceGuide(),
    fetchFn,
    86400 * 7 // Cache for 7 days
  );
}

// Cache invalidation functions
export function invalidateDashboardCache(userId?: string) {
  if (userId) {
    dashboardCache.del(cacheKeys.dashboardStats(userId));
  } else {
    dashboardCache.flushAll();
  }
}

export function invalidateParticipantCache(participantId?: string) {
  if (participantId) {
    participantCache.del(cacheKeys.participantDetails(participantId));
    // Also invalidate list cache
    const keys = participantCache.keys();
    keys.forEach(key => {
      if (key.startsWith('participants:list:')) {
        participantCache.del(key);
      }
    });
  } else {
    participantCache.flushAll();
  }
}

export function invalidateStaffCache(staffId?: string) {
  if (staffId) {
    const keys = staffCache.keys();
    keys.forEach(key => {
      if (key.includes(staffId)) {
        staffCache.del(key);
      }
    });
  } else {
    staffCache.flushAll();
  }
}

export function invalidateKPICache() {
  kpiCache.flushAll();
}

// Cache statistics
export function getCacheStats() {
  return {
    dashboard: {
      keys: dashboardCache.keys().length,
      hits: dashboardCache.getStats().hits,
      misses: dashboardCache.getStats().misses,
      hitRate: dashboardCache.getStats().hits / (dashboardCache.getStats().hits + dashboardCache.getStats().misses) || 0
    },
    participant: {
      keys: participantCache.keys().length,
      hits: participantCache.getStats().hits,
      misses: participantCache.getStats().misses,
      hitRate: participantCache.getStats().hits / (participantCache.getStats().hits + participantCache.getStats().misses) || 0
    },
    staff: {
      keys: staffCache.keys().length,
      hits: staffCache.getStats().hits,
      misses: staffCache.getStats().misses,
      hitRate: staffCache.getStats().hits / (staffCache.getStats().hits + staffCache.getStats().misses) || 0
    },
    kpi: {
      keys: kpiCache.keys().length,
      hits: kpiCache.getStats().hits,
      misses: kpiCache.getStats().misses,
      hitRate: kpiCache.getStats().hits / (kpiCache.getStats().hits + kpiCache.getStats().misses) || 0
    }
  };
}

// Clear all caches
export function clearAllCaches() {
  dashboardCache.flushAll();
  participantCache.flushAll();
  staffCache.flushAll();
  kpiCache.flushAll();
  priceGuideCache.flushAll();
  generalCache.flushAll();
  console.log('✅ All caches cleared');
}

export {
  dashboardCache,
  participantCache,
  staffCache,
  kpiCache,
  priceGuideCache,
  generalCache
};