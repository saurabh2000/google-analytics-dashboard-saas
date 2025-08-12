import { subscriptionPlans, getPlanById, formatPrice } from '@/lib/stripe-client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const planId = searchParams.get('planId')
    const includeFeatures = searchParams.get('includeFeatures') === 'true'
    const includeComparison = searchParams.get('includeComparison') === 'true'

    if (planId) {
      // Return specific plan
      const plan = getPlanById(planId)
      if (!plan) {
        return NextResponse.json(
          { error: 'Plan not found' },
          { status: 404 }
        )
      }

      const planData = {
        ...plan,
        formattedPrice: formatPrice(plan.price, plan.currency)
      }

      return NextResponse.json({ plan: planData })
    }

    // Return all plans with optional enhancements
    let plans = subscriptionPlans.map(plan => ({
      ...plan,
      formattedPrice: formatPrice(plan.price, plan.currency)
    }))

    if (includeFeatures) {
      // Add detailed feature breakdown
      plans = plans.map(plan => ({
        ...plan,
        featureCategories: {
          analytics: plan.features.filter(f => 
            f.toLowerCase().includes('analytics') || 
            f.toLowerCase().includes('dashboard') ||
            f.toLowerCase().includes('data')
          ),
          collaboration: plan.features.filter(f => 
            f.toLowerCase().includes('user') || 
            f.toLowerCase().includes('team') ||
            f.toLowerCase().includes('collaboration')
          ),
          support: plan.features.filter(f => 
            f.toLowerCase().includes('support') || 
            f.toLowerCase().includes('sla') ||
            f.toLowerCase().includes('training')
          ),
          advanced: plan.features.filter(f => 
            f.toLowerCase().includes('advanced') || 
            f.toLowerCase().includes('ml') ||
            f.toLowerCase().includes('custom') ||
            f.toLowerCase().includes('api')
          )
        }
      }))
    }

    if (includeComparison) {
      // Add plan comparison matrix
      const comparisonMatrix = {
        features: [
          'Basic Analytics Dashboard',
          'Advanced Analytics',
          'User Management',
          'Dashboard Creation',
          'Data Export',
          'A/B Testing',
          'Cohort Analysis',
          'API Access',
          'Priority Support',
          'Custom Branding'
        ],
        plans: plans.map(plan => ({
          id: plan.id,
          name: plan.name,
          price: plan.price,
          formattedPrice: plan.formattedPrice,
          features: plan.features,
          limits: plan.limits,
          popular: plan.popular
        }))
      }

      return NextResponse.json({
        plans,
        comparison: comparisonMatrix
      })
    }

    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, planId, newPlan } = await req.json()

    switch (action) {
      case 'compare':
        // Compare two or more plans
        if (!planId || !Array.isArray(planId)) {
          return NextResponse.json(
            { error: 'Plan IDs array required for comparison' },
            { status: 400 }
          )
        }

        const plansToCompare = planId.map(id => getPlanById(id)).filter(Boolean)
        if (plansToCompare.length < 2) {
          return NextResponse.json(
            { error: 'At least 2 valid plan IDs required for comparison' },
            { status: 400 }
          )
        }

        const comparison = {
          plans: plansToCompare.map(plan => ({
            ...plan,
            formattedPrice: formatPrice(plan!.price, plan!.currency)
          })),
          differences: {
            price: {
              min: Math.min(...plansToCompare.map(p => p!.price)),
              max: Math.max(...plansToCompare.map(p => p!.price)),
              range: Math.max(...plansToCompare.map(p => p!.price)) - Math.min(...plansToCompare.map(p => p!.price))
            },
            features: {
              unique: plansToCompare.flatMap(p => p!.features).filter((f, i, arr) => arr.indexOf(f) === i),
              common: plansToCompare.reduce((common, plan) => 
                common.filter(f => plan!.features.includes(f)), 
                plansToCompare[0]!.features
              )
            }
          }
        }

        return NextResponse.json({ comparison })

      case 'recommend':
        // Recommend plan based on usage
        const { users, dashboards, dataSources, budget } = newPlan
        let recommendedPlan = subscriptionPlans[0] // Default to starter

        if (users > 25 || dashboards > 10 || dataSources > 5 || budget > 200) {
          recommendedPlan = subscriptionPlans[2] // Enterprise
        } else if (users > 5 || dashboards > 3 || dataSources > 2 || budget > 50) {
          recommendedPlan = subscriptionPlans[1] // Professional
        }

        return NextResponse.json({
          recommendedPlan: {
            ...recommendedPlan,
            formattedPrice: formatPrice(recommendedPlan.price, recommendedPlan.currency)
          },
          reasoning: {
            users: users > recommendedPlan.limits.maxUsers ? 'Upgrade needed for user count' : 'Within plan limits',
            dashboards: dashboards > recommendedPlan.limits.maxDashboards ? 'Upgrade needed for dashboard count' : 'Within plan limits',
            dataSources: dataSources > recommendedPlan.limits.maxDataSources ? 'Upgrade needed for data source count' : 'Within plan limits',
            budget: budget > recommendedPlan.price ? 'Plan fits budget' : 'Consider lower tier'
          }
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error processing plan action:', error)
    return NextResponse.json(
      { error: 'Failed to process plan action' },
      { status: 500 }
    )
  }
}
