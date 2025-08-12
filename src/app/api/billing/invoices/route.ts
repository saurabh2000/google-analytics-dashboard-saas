import { usageTracking } from '@/lib/usage-tracking'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period')
    const tenantId = searchParams.get('tenantId') || session.user.email

    if (!period) {
      return NextResponse.json(
        { error: 'Period parameter is required' },
        { status: 400 }
      )
    }

    // Generate invoice data for the specified period
    const invoiceData = await usageTracking.generateInvoiceData(tenantId, period)

    if (!invoiceData) {
      return NextResponse.json(
        { error: 'No invoice data available for this period' },
        { status: 404 }
      )
    }

    return NextResponse.json(invoiceData)
  } catch (error) {
    console.error('Error generating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { tenantId, period, customCharges } = await req.json()

    if (!tenantId || !period) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId and period' },
        { status: 400 }
      )
    }

    // Generate base invoice data
    const invoiceData = await usageTracking.generateInvoiceData(tenantId, period)

    if (!invoiceData) {
      return NextResponse.json(
        { error: 'No invoice data available for this period' },
        { status: 404 }
      )
    }

    // Add custom charges if provided
    if (customCharges && Array.isArray(customCharges)) {
      invoiceData.customCharges = customCharges
      invoiceData.charges.total += customCharges.reduce((sum: number, charge: any) => sum + charge.amount, 0)
      
      // Add custom charges to line items
      customCharges.forEach((charge: any) => {
        invoiceData.lineItems.push({
          description: charge.description,
          quantity: charge.quantity || 1,
          unitPrice: charge.unitPrice || charge.amount,
          amount: charge.amount,
          type: 'custom'
        })
      })
    }

    // Generate invoice number
    invoiceData.invoiceNumber = `INV-${period.replace('-', '')}-${Date.now().toString().slice(-6)}`
    invoiceData.generatedAt = new Date().toISOString()

    // Format the invoice data for display
    const formattedInvoice = {
      ...invoiceData,
      formattedCharges: {
        base: `$${invoiceData.charges.base.toFixed(2)}`,
        overages: `$${invoiceData.charges.overages.toFixed(2)}`,
        total: `$${invoiceData.charges.total.toFixed(2)}`
      },
      formattedMetrics: {
        apiCalls: invoiceData.usage.metrics.apiCalls.toLocaleString(),
        dataProcessed: `${(invoiceData.usage.metrics.dataProcessed / 1000000000).toFixed(2)} GB`,
        storageUsed: `${(invoiceData.usage.metrics.storageUsed / 1000000000).toFixed(2)} GB`,
        userSessions: invoiceData.usage.metrics.userSessions.toLocaleString(),
        dashboardViews: invoiceData.usage.metrics.dashboardViews.toLocaleString(),
        reportGenerations: invoiceData.usage.metrics.reportGenerations.toLocaleString(),
        customQueries: invoiceData.usage.metrics.customQueries.toLocaleString()
      }
    }

    return NextResponse.json(formattedInvoice)
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}
