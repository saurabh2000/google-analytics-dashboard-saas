// Statistical calculation utilities for A/B testing and analytics
export interface StatisticalResult {
  isSignificant: boolean
  confidence: number
  pValue: number
  zScore: number
  sampleSize: number
}

export interface ConfidenceInterval {
  lower: number
  upper: number
  margin: number
}

// Calculate statistical significance between two proportions (A/B test)
export function calculateStatisticalSignificance(
  controlConversions: number,
  controlSample: number,
  treatmentConversions: number,
  treatmentSample: number,
  confidenceLevel: number = 95
): StatisticalResult {
  
  // Calculate conversion rates
  const p1 = controlSample > 0 ? controlConversions / controlSample : 0
  const p2 = treatmentSample > 0 ? treatmentConversions / treatmentSample : 0
  
  // Calculate pooled probability
  const pooledP = (controlConversions + treatmentConversions) / (controlSample + treatmentSample)
  
  // Calculate standard error
  const standardError = Math.sqrt(pooledP * (1 - pooledP) * (1/controlSample + 1/treatmentSample))
  
  // Calculate z-score
  const zScore = standardError > 0 ? (p2 - p1) / standardError : 0
  
  // Calculate p-value (two-tailed test)
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore)))
  
  // Determine significance
  const alpha = (100 - confidenceLevel) / 100
  const isSignificant = pValue < alpha
  
  return {
    isSignificant,
    confidence: confidenceLevel,
    pValue,
    zScore,
    sampleSize: controlSample + treatmentSample
  }
}

// Calculate confidence interval for proportion difference
export function calculateConfidenceInterval(
  p1: number, // Control rate
  p2: number, // Treatment rate
  n1: number, // Control sample size
  n2: number, // Treatment sample size
  confidenceLevel: number = 95
): ConfidenceInterval {
  
  // Calculate standard error for difference in proportions
  const se = Math.sqrt((p1 * (1 - p1)) / n1 + (p2 * (1 - p2)) / n2)
  
  // Get z-score for confidence level
  const alpha = (100 - confidenceLevel) / 100
  const zScore = normalInverse(1 - alpha / 2)
  
  // Calculate margin of error
  const margin = zScore * se
  
  // Calculate difference
  const diff = p2 - p1
  
  return {
    lower: diff - margin,
    upper: diff + margin,
    margin
  }
}

// Calculate sample size needed for A/B test
export function calculateSampleSize(
  baselineRate: number,
  minimumDetectableEffect: number, // percentage
  power: number = 80, // statistical power
  significanceLevel: number = 5 // alpha
): number {
  
  const p1 = baselineRate
  const p2 = baselineRate * (1 + minimumDetectableEffect / 100)
  
  const alpha = significanceLevel / 100
  const beta = (100 - power) / 100
  
  // Z-scores for alpha and beta
  const zAlpha = normalInverse(1 - alpha / 2)
  const zBeta = normalInverse(1 - beta)
  
  // Sample size calculation
  const numerator = Math.pow(zAlpha + zBeta, 2) * (p1 * (1 - p1) + p2 * (1 - p2))
  const denominator = Math.pow(p2 - p1, 2)
  
  return Math.ceil(numerator / denominator)
}

// Calculate test duration needed
export function calculateTestDuration(
  sampleSizeNeeded: number,
  dailyTraffic: number
): number {
  return Math.ceil(sampleSizeNeeded / dailyTraffic)
}

// Calculate lift (percentage improvement)
export function calculateLift(
  controlRate: number,
  treatmentRate: number
): number {
  if (controlRate === 0) return 0
  return ((treatmentRate - controlRate) / controlRate) * 100
}

// Bayesian probability that treatment is better
export function calculateBayesianProbability(
  controlConversions: number,
  controlSample: number,
  treatmentConversions: number,
  treatmentSample: number,
  iterations: number = 10000
): number {
  
  // Using Beta distribution (conjugate prior for Binomial)
  // Prior: Beta(1,1) - uniform prior
  
  let treatmentWins = 0
  
  for (let i = 0; i < iterations; i++) {
    // Sample from posterior Beta distributions
    const controlBeta = betaRandom(controlConversions + 1, controlSample - controlConversions + 1)
    const treatmentBeta = betaRandom(treatmentConversions + 1, treatmentSample - treatmentConversions + 1)
    
    if (treatmentBeta > controlBeta) {
      treatmentWins++
    }
  }
  
  return treatmentWins / iterations
}

// Helper functions for statistical calculations

// Normal cumulative distribution function
function normalCDF(z: number): number {
  return 0.5 * (1 + erf(z / Math.sqrt(2)))
}

// Inverse normal CDF (approximation)
function normalInverse(p: number): number {
  // Approximation using rational function
  if (p <= 0 || p >= 1) {
    throw new Error('Probability must be between 0 and 1')
  }
  
  const c0 = 2.515517
  const c1 = 0.802853
  const c2 = 0.010328
  const d1 = 1.432788
  const d2 = 0.189269
  const d3 = 0.001308
  
  let x: number
  
  if (p > 0.5) {
    x = p
  } else {
    x = 1 - p
  }
  
  const t = Math.sqrt(-2 * Math.log(x))
  
  const numerator = c0 + c1 * t + c2 * t * t
  const denominator = 1 + d1 * t + d2 * t * t + d3 * t * t * t
  
  let result = t - numerator / denominator
  
  if (p < 0.5) {
    result = -result
  }
  
  return result
}

// Error function approximation
function erf(x: number): number {
  // Abramowitz and Stegun approximation
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911
  
  const sign = x >= 0 ? 1 : -1
  x = Math.abs(x)
  
  const t = 1.0 / (1.0 + p * x)
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
  
  return sign * y
}

// Generate random number from Beta distribution
function betaRandom(alpha: number, beta: number): number {
  // Using the fact that if X ~ Gamma(alpha, 1) and Y ~ Gamma(beta, 1)
  // then X/(X+Y) ~ Beta(alpha, beta)
  
  const x = gammaRandom(alpha)
  const y = gammaRandom(beta)
  
  return x / (x + y)
}

// Generate random number from Gamma distribution
function gammaRandom(shape: number, scale: number = 1): number {
  // Marsaglia and Tsang method
  if (shape < 1) {
    return gammaRandom(shape + 1, scale) * Math.pow(Math.random(), 1 / shape)
  }
  
  const d = shape - 1/3
  const c = 1 / Math.sqrt(9 * d)
  
  while (true) {
    let x = 0
    let v = 0
    
    do {
      x = normalRandom()
      v = 1 + c * x
    } while (v <= 0)
    
    v = v * v * v
    const u = Math.random()
    
    if (u < 1 - 0.0331 * x * x * x * x) {
      return d * v * scale
    }
    
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
      return d * v * scale
    }
  }
}

// Generate random number from normal distribution
function normalRandom(): number {
  // Box-Muller transform
  let hasSpare = false
  let spare = 0
  
  if (hasSpare) {
    hasSpare = false
    return spare
  }
  
  hasSpare = true
  const u = Math.random()
  const v = Math.random()
  const mag = Math.sqrt(-2 * Math.log(u))
  
  spare = mag * Math.cos(2 * Math.PI * v)
  return mag * Math.sin(2 * Math.PI * v)
}

// Test result interpretation
export interface TestInterpretation {
  conclusion: 'winner' | 'no_winner' | 'insufficient_data' | 'continue_test'
  recommendation: string
  confidenceDescription: string
  riskAssessment: 'low' | 'medium' | 'high'
  businessImpact: string
}

export function interpretTestResults(
  significance: StatisticalResult,
  lift: number,
  sampleSize: number,
  testDuration: number,
  minimumSampleSize: number = 1000,
  minimumDuration: number = 7 // days
): TestInterpretation {
  
  // Check if we have enough data
  if (sampleSize < minimumSampleSize || testDuration < minimumDuration) {
    return {
      conclusion: 'insufficient_data',
      recommendation: `Continue test until you reach at least ${minimumSampleSize.toLocaleString()} total visitors and ${minimumDuration} days of runtime.`,
      confidenceDescription: 'Insufficient sample size for reliable results',
      riskAssessment: 'high',
      businessImpact: 'Cannot determine business impact with current sample size'
    }
  }
  
  // Interpret results
  if (!significance.isSignificant) {
    if (Math.abs(lift) < 1) {
      return {
        conclusion: 'no_winner',
        recommendation: 'No significant difference detected. Consider testing a more dramatic change or stopping the test.',
        confidenceDescription: `Not statistically significant (p-value: ${significance.pValue.toFixed(4)})`,
        riskAssessment: 'low',
        businessImpact: 'Minimal business impact expected'
      }
    } else {
      return {
        conclusion: 'continue_test',
        recommendation: 'Test shows promise but needs more data to reach statistical significance.',
        confidenceDescription: `Trending but not significant (p-value: ${significance.pValue.toFixed(4)})`,
        riskAssessment: 'medium',
        businessImpact: `Potential ${Math.abs(lift).toFixed(1)}% ${lift > 0 ? 'improvement' : 'decrease'} if confirmed`
      }
    }
  }
  
  // Test is significant
  const direction = lift > 0 ? 'winner' : 'loser'
  
  if (direction === 'winner') {
    return {
      conclusion: 'winner',
      recommendation: `Implement the winning variant. It shows a ${lift.toFixed(1)}% improvement with ${significance.confidence}% confidence.`,
      confidenceDescription: `Statistically significant with ${significance.confidence}% confidence (p-value: ${significance.pValue.toFixed(4)})`,
      riskAssessment: significance.confidence >= 99 ? 'low' : 'medium',
      businessImpact: `Expected ${lift.toFixed(1)}% improvement in conversion rate`
    }
  } else {
    return {
      conclusion: 'no_winner',
      recommendation: `Stop test and keep original version. The variant shows a ${Math.abs(lift).toFixed(1)}% decrease.`,
      confidenceDescription: `Statistically significant decrease (p-value: ${significance.pValue.toFixed(4)})`,
      riskAssessment: 'low',
      businessImpact: `Avoiding a ${Math.abs(lift).toFixed(1)}% decrease in conversion rate`
    }
  }
}

// Alias for backwards compatibility
export const calculateSignificance = calculateStatisticalSignificance

// Export utility functions
export {
  normalCDF,
  normalInverse,
  erf,
  betaRandom,
  gammaRandom,
  normalRandom
}