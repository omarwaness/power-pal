import { useEffect, useState } from 'react'

import { MeterAreaChart } from '@/components/meter-area-chart'
import { MeterDifferenceChart } from '@/components/meter-difference-chart'
import { MeterGasChart } from '@/components/meter-gas-chart'
import type { MeterResponse } from '../../types/meter'
import type { ReadingResponse } from '../../types/readings'

type MeterWithReadings = MeterResponse & {
  readings: ReadingResponse[]
}

function MetricsSection() {
  const [meters, setMeters] = useState<MeterWithReadings[]>([])

  useEffect(() => {
    let isMounted = true

    const loadMetricsData = async () => {
      try {
        const meterList = await window.api.getMeters()
        const meterReadings = await Promise.all(
          meterList.map(async meter => ({
            ...meter,
            readings: await window.api.getReadingsByMeterId(meter.id),
          }))
        )

        if (isMounted) {
          setMeters(meterReadings)
        }
      } catch {
        if (isMounted) {
          setMeters([])
        }
      }
    }

    void loadMetricsData()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="w-full">
      <div className="flex flex-col gap-12">
        {meters.map(meter => (
          <section key={meter.id} className="flex flex-col gap-4">
            <h2 className="text-xl font-medium tracking-tight">{meter.name}</h2>

            <div className="grid md:grid-cols-2">
              <article className="md:col-span-2">
                <MeterAreaChart meterName={meter.name} readings={meter.readings} />
              </article>

              <article className="h-full">
                <MeterDifferenceChart
                  meterName={meter.name}
                  readings={meter.readings}
                />
              </article>

              <article className="h-full">
                <MeterGasChart meterName={meter.name} readings={meter.readings} />
              </article>
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}

export { MetricsSection }
