// Mock cohort data for demo purposes
export interface Cohort {
  id: string
  name: string
  startDate: string
  size: number
  retention: number[] // Retention rates for each period (0-1)
  created: Date
}

export const cohorts: Cohort[] = [
  {
    id: 'cohort-2024-01',
    name: 'January 2024',
    startDate: '2024-01-01',
    size: 2450,
    retention: [1.0, 0.68, 0.52, 0.42, 0.35, 0.28, 0.24, 0.21, 0.19, 0.17, 0.15, 0.14],
    created: new Date('2024-01-01')
  },
  {
    id: 'cohort-2024-02',
    name: 'February 2024',
    startDate: '2024-02-01',
    size: 1890,
    retention: [1.0, 0.71, 0.55, 0.44, 0.38, 0.32, 0.27, 0.24, 0.22, 0.19, 0.17, 0.16],
    created: new Date('2024-02-01')
  },
  {
    id: 'cohort-2024-03',
    name: 'March 2024',
    startDate: '2024-03-01',
    size: 3210,
    retention: [1.0, 0.65, 0.49, 0.39, 0.33, 0.26, 0.22, 0.19, 0.17, 0.15, 0.13, 0.12],
    created: new Date('2024-03-01')
  },
  {
    id: 'cohort-2024-04',
    name: 'April 2024',
    startDate: '2024-04-01',
    size: 2780,
    retention: [1.0, 0.73, 0.58, 0.47, 0.41, 0.34, 0.29, 0.26, 0.23, 0.21, 0.19, 0.18],
    created: new Date('2024-04-01')
  },
  {
    id: 'cohort-2024-05',
    name: 'May 2024',
    startDate: '2024-05-01',
    size: 1675,
    retention: [1.0, 0.69, 0.53, 0.43, 0.36, 0.30, 0.25, 0.22, 0.20, 0.18, 0.16, 0.15],
    created: new Date('2024-05-01')
  },
  {
    id: 'cohort-2024-06',
    name: 'June 2024',
    startDate: '2024-06-01',
    size: 2940,
    retention: [1.0, 0.76, 0.61, 0.50, 0.43, 0.37, 0.32, 0.28, 0.25, 0.23, 0.21, 0.19],
    created: new Date('2024-06-01')
  },
  {
    id: 'cohort-2024-07',
    name: 'July 2024',
    startDate: '2024-07-01',
    size: 3520,
    retention: [1.0, 0.70, 0.54, 0.45, 0.38, 0.31, 0.26, 0.23, 0.20, 0.18, 0.16, 0.15],
    created: new Date('2024-07-01')
  },
  {
    id: 'cohort-2024-08',
    name: 'August 2024',
    startDate: '2024-08-01',
    size: 2150,
    retention: [1.0, 0.72, 0.56, 0.46, 0.39, 0.33, 0.28, 0.25, 0.22, 0.20, 0.18, 0.17],
    created: new Date('2024-08-01')
  }
]

// Calculate cohort metrics
export function calculateCohortMetrics(cohort: Cohort) {
  const day1Retention = cohort.retention[1] || 0
  const day7Retention = cohort.retention[7] || 0
  const day30Retention = cohort.retention[11] || 0
  
  return {
    id: cohort.id,
    name: cohort.name,
    size: cohort.size,
    day1Retention,
    day7Retention,
    day30Retention,
    lifetimeValue: cohort.size * day30Retention * 50, // Mock LTV calculation
    dropoffRate: 1 - day1Retention
  }
}

// Get retention comparison between cohorts
export function compareCohorts(cohortIds: string[]) {
  const selectedCohorts = cohorts.filter(c => cohortIds.includes(c.id))
  
  return selectedCohorts.map(cohort => ({
    ...cohort,
    metrics: calculateCohortMetrics(cohort)
  }))
}

// Get top performing cohorts
export function getTopCohorts(limit: number = 5) {
  return cohorts
    .map(cohort => ({
      ...cohort,
      metrics: calculateCohortMetrics(cohort)
    }))
    .sort((a, b) => b.metrics.day30Retention - a.metrics.day30Retention)
    .slice(0, limit)
}

// Calculate average retention across all cohorts
export function getAverageRetention() {
  const totalCohorts = cohorts.length
  if (totalCohorts === 0) return []
  
  const retentionPeriods = cohorts[0].retention.length
  const avgRetention = []
  
  for (let i = 0; i < retentionPeriods; i++) {
    const periodSum = cohorts.reduce((sum, cohort) => sum + (cohort.retention[i] || 0), 0)
    avgRetention.push(periodSum / totalCohorts)
  }
  
  return avgRetention
}