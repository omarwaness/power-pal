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

type MeterDifferenceChartProps = {
  meterName: string
  readings: ReadingResponse[]
}

const chartConfig = {
  difference: {
    label: 'Difference',
    color: '#3b82f6',
  },
} satisfies ChartConfig

function MeterDifferenceChart({ meterName, readings }: MeterDifferenceChartProps) {
  const chartId = useMemo(
    () => `${meterName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-difference`,
    [meterName]
  )

  const chartData = useMemo(() => {
    return [...readings]
      .sort((left, right) => {
        return new Date(left.date).getTime() - new Date(right.date).getTime()
      })
      .map(reading => ({
        date: reading.date,
        difference: reading.difference,
      }))
  }, [readings])

  return (
    <Card className="bg-[#101011] h-full rounded-none rounded-bl-2xl border-t-0 py-0">
      <CardHeader className="py-5">
        <div className="grid gap-1">
          <CardTitle className="text-xl">Difference over time</CardTitle>
          <CardDescription>
            Showing difference readings for {meterName}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          id={chartId}
          config={chartConfig}
          className="aspect-auto h-62.5 w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`${chartId}-fill`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-difference)" stopOpacity={0.6} />
                <stop offset="95%" stopColor="var(--color-difference)" stopOpacity={0.08} />
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
              dataKey="difference"
              type="natural"
              fill={`url(#${chartId}-fill)`}
              stroke="var(--color-difference)"
              strokeWidth={2}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export { MeterDifferenceChart }