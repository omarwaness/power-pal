import { useMemo } from 'react'

import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import type { ReadingResponse } from '../../types/readings'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type MeterAreaChartProps = {
  meterName: string
  readings: ReadingResponse[]
}

const chartConfig = {
  consumption: {
    label: 'Consumption',
    color: '#ef4444',
  },
  production: {
    label: 'Production',
    color: '#22c55e',
  },
} satisfies ChartConfig

function MeterAreaChart({ meterName, readings }: MeterAreaChartProps) {
  const chartId = useMemo(
    () => meterName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    [meterName]
  )

  const chartData = useMemo(() => {
    return [...readings]
      .sort((left, right) => {
        return new Date(left.date).getTime() - new Date(right.date).getTime()
      })
      .map(reading => ({
        date: reading.date,
        consumption: reading.consumption,
        production: reading.production,
      }))
  }, [readings])

  return (
    <Card className="bg-[#101011] pt-0 border-b-0 rounded-none rounded-t-2xl">
      <CardHeader className="py-5">
        <div className="grid gap-1">
          <CardTitle className="text-xl">Consumption vs production</CardTitle>
          <CardDescription>
            Showing readings for {meterName}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          id={chartId}
          config={chartConfig}
          className="aspect-auto h-62.5 w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`${chartId}-consumption`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-consumption)" stopOpacity={0.6} />
                <stop offset="95%" stopColor="var(--color-consumption)" stopOpacity={0.08} />
              </linearGradient>
              <linearGradient id={`${chartId}-production`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-production)" stopOpacity={0.6} />
                <stop offset="95%" stopColor="var(--color-production)" stopOpacity={0.08} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={value => {
                const date = new Date(value)
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={value => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="consumption"
              type="natural"
              fill={`url(#${chartId}-consumption)`}
              stroke="var(--color-consumption)"
              strokeWidth={2}
            />
            <Area
              dataKey="production"
              type="natural"
              fill={`url(#${chartId}-production)`}
              stroke="var(--color-production)"
              strokeWidth={2}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export { MeterAreaChart }