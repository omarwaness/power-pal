import { useCallback, useEffect, useState } from 'react'

import { ReadingDialog } from '@/components/reading-dialog'
import { cn, formatReadingDate } from '@/lib/utils'
import type { MeterResponse } from '../../types/meter'
import type { ReadingResponse } from '../../types/readings'

type MeterWithReadings = MeterResponse & {
  readings: ReadingResponse[]
}

type OverviewSectionProps = {
  refreshKey?: number
}

function OverviewSection({ refreshKey = 0 }: OverviewSectionProps) {
  const [meterCount, setMeterCount] = useState(0)
  const [meters, setMeters] = useState<MeterWithReadings[]>([])

  const loadMeters = useCallback(async () => {
    try {
      const meterList = await window.api.getMeters()
      const meterReadings = await Promise.all(
        meterList.map(async meter => ({
          ...meter,
          readings: await window.api.getReadingsByMeterId(meter.id)
        }))
      )

      setMeterCount(meterList.length)
      setMeters(meterReadings)
    } catch {
      setMeterCount(0)
      setMeters([])
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadOverview = async () => {
      try {
        if (isMounted) {
          await loadMeters()
        }
      } catch {
        if (isMounted) {
          setMeterCount(0)
          setMeters([])
        }
      }
    }

    void loadOverview()

    return () => {
      isMounted = false
    }
  }, [loadMeters, refreshKey])

  const cards = [
    { label: 'Number of meter', value: String(meterCount) },
    { label: 'Monthly usage', value: '-' },
    { label: 'Latest update', value: '-' }
  ]

  return (
    <section className="w-full">
      <div className="flex flex-col gap-14">
        <div className="grid gap-8 md:grid-cols-3">
          {cards.map(card => (
            <article
              key={card.label}
              className="rounded-xl p-6"
              style={{ backgroundColor: '#171719' }}
            >
              <div className="flex flex-col gap-3">
                <p className="text-muted-foreground">{card.label}</p>
                <p className="text-3xl tracking-tight">{card.value}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-col gap-14">
          {meters.map(meter => (
            <section key={meter.id} className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4 px-1">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-medium tracking-tight">
                    {meter.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    showing most recent readings
                  </p>
                </div>

                <ReadingDialog
                  meterId={meter.id}
                  meterName={meter.name}
                  onCreated={loadMeters}
                />
              </div>

              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full min-w-180 border-collapse">
                  <thead>
                    <tr
                      className="text-left"
                      style={{ backgroundColor: '#171719' }}
                    >
                      <th className="px-6 py-4 text-sm font-medium">Date</th>
                      <th className="px-6 py-4 text-sm font-medium">
                        Consumption
                      </th>
                      <th className="px-6 py-4 text-sm font-medium">
                        Production
                      </th>
                      <th className="px-6 py-4 text-sm font-medium">
                        Difference
                      </th>
                      <th className="px-6 py-4 text-sm font-medium">Gas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meter.readings.length > 0 ? (
                      meter.readings.map(reading => (
                        <tr
                          key={reading.id}
                          className="border-b last:border-b-0 hover:bg-transparent"
                          onMouseEnter={event => {
                            event.currentTarget.style.backgroundColor =
                              '#171719'
                          }}
                          onMouseLeave={event => {
                            event.currentTarget.style.backgroundColor =
                              'transparent'
                          }}
                        >
                          <td className="px-6 py-4 text-sm">
                            {formatReadingDate(reading.date)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {reading.consumption}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {reading.production}
                          </td>
                          <td
                            className={cn(
                              'px-6 py-4 text-sm',
                              reading.difference < 0 && 'text-red-500',
                              reading.difference > 0 && 'text-green-500'
                            )}
                          >
                            {reading.difference}
                          </td>
                          <td className="px-6 py-4 text-sm">{reading.gas}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-6 text-center text-sm text-muted-foreground"
                        >
                          No readings available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  )
}

export { OverviewSection }
