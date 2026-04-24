import { useMemo } from 'react'

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

import type { ReadingResponse } from '../../types/readings'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

type MeterGasChartProps = {
  meterName: string
  readings: ReadingResponse[]
}

const chartConfig = {
  gas: {
    label: 'Gas',
    color: '#f59e0b'
  }
} satisfies ChartConfig

function MeterGasChart({ meterName, readings }: MeterGasChartProps) {
  const chartId = useMemo(
    () => `${meterName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-gas`,
    [meterName]
  )

  const chartData = useMemo(() => {
    return [...readings]
      .sort((left, right) => {
        return new Date(left.date).getTime() - new Date(right.date).getTime()
      })
      .map(reading => ({
        date: reading.date,
        gas: reading.gas
      }))
  }, [readings])

  return (
    <Card className="bg-[#101011] h-full rounded-none rounded-br-2xl border-t-0 py-0">
      <CardHeader className="py-5">
        <div className="grid gap-1">
          <CardTitle className="text-xl">Gas usage</CardTitle>
          <CardDescription>
            Showing gas readings for {meterName}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          id={chartId}
          config={chartConfig}
          className="aspect-auto h-62.5 w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12
            }}
          >
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
                  day: 'numeric'
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-37.5"
                  nameKey="gas"
                  labelFormatter={value => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  }}
                />
              }
            />
            <Bar dataKey="gas" fill="var(--color-gas)" radius={6} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export { MeterGasChart }
