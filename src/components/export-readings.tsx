import { useState } from 'react'

import { format } from 'date-fns'
import { DownloadIcon, FileSpreadsheetIcon, FileTextIcon } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import type { MeterResponse } from '../../types/meter'
import type { ReadingResponse } from '../../types/readings'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { formatReadingDate } from '@/lib/utils'

type MeterWithReadings = MeterResponse & {
  readings: ReadingResponse[]
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  link.click()

  URL.revokeObjectURL(url)
}

function escapeCsvValue(value: string | number) {
  const stringValue = String(value)

  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n')
  ) {
    return `"${stringValue.replaceAll('"', '""')}"`
  }

  return stringValue
}

async function getMetersWithReadings() {
  const meters = await window.api.getMeters()

  const meterReadings = await Promise.all(
    meters.map(async meter => ({
      ...meter,
      readings: await window.api.getReadingsByMeterId(meter.id)
    }))
  )

  return meterReadings
}

function buildCsvContent(meters: MeterWithReadings[]) {
  return meters
    .map(meter => {
      const rows = meter.readings.map(reading =>
        [
          formatReadingDate(reading.date),
          reading.consumption,
          reading.production,
          reading.difference,
          reading.gas
        ]
          .map(escapeCsvValue)
          .join(',')
      )

      return [
        escapeCsvValue(meter.name),
        ['Date', 'Consumption', 'Production', 'Difference', 'Gas'].join(','),
        ...(rows.length > 0 ? rows : ['No readings available']),
        ''
      ].join('\n')
    })
    .join('\n')
}

function buildPdfDocument(meters: MeterWithReadings[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const downloadedAt = format(new Date(), 'PPP')

  doc.setFillColor(255, 255, 255)
  doc.rect(
    0,
    0,
    doc.internal.pageSize.getWidth(),
    doc.internal.pageSize.getHeight(),
    'F'
  )

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(18)
  doc.text('Readings export', 40, 40)
  doc.setFontSize(11)
  doc.text(`Downloaded ${downloadedAt}`, 40, 60)

  let currentY = 84

  meters.forEach((meter, index) => {
    doc.setFontSize(14)
    doc.text(meter.name, 40, currentY)

    autoTable(doc, {
      startY: currentY + 12,
      head: [['Date', 'Consumption', 'Production', 'Difference', 'Gas']],
      body:
        meter.readings.length > 0
          ? meter.readings.map(reading => [
              formatReadingDate(reading.date),
              String(reading.consumption),
              String(reading.production),
              String(reading.difference),
              String(reading.gas)
            ])
          : [['No readings available', '', '', '', '']],
      theme: 'grid',
      styles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        lineColor: [212, 212, 216],
        lineWidth: 1,
        fontSize: 10,
        cellPadding: 8
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      didParseCell: hookData => {
        if (hookData.section !== 'head') {
          return
        }

        const palette: [number, number, number][] = [
          [255, 255, 255],
          [248, 113, 113],
          [74, 222, 128],
          [229, 231, 235],
          [161, 161, 170]
        ]

        hookData.cell.styles.fillColor = palette[hookData.column.index] ?? [255, 255, 255]
        hookData.cell.styles.textColor = [0, 0, 0]
      },
      margin: { left: 40, right: 40 }
    })

    currentY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? currentY + 60
    currentY += 24

    if (index < meters.length - 1 && currentY > doc.internal.pageSize.getHeight() - 120) {
      doc.addPage('a4', 'landscape')
      doc.setFillColor(255, 255, 255)
      doc.rect(
        0,
        0,
        doc.internal.pageSize.getWidth(),
        doc.internal.pageSize.getHeight(),
        'F'
      )
      currentY = 40
    }
  })

  return doc
}

function ExportReadings() {
  const [open, setOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const exportReadings = async (type: 'csv' | 'pdf') => {
    setIsExporting(true)

    try {
      const meters = await getMetersWithReadings()
      const filename = `readings_${format(new Date(), 'yyyy-MM-dd')}`

      if (type === 'csv') {
        const csvContent = buildCsvContent(meters)
        downloadBlob(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }), `${filename}.csv`)
      } else {
        const pdfDocument = buildPdfDocument(meters)
        pdfDocument.save(`${filename}.pdf`)
      }

      setOpen(false)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="secondary" className="gap-2 rounded-full">
            <DownloadIcon className="size-4" />
            Download
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download readings</DialogTitle>
          <DialogDescription>
            Export all meter readings as a CSV file or a styled PDF.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            className="h-auto justify-start gap-3 rounded-xl px-4 py-4"
            onClick={() => exportReadings('csv')}
            disabled={isExporting}
          >
            <FileSpreadsheetIcon className="size-5" />
            CSV
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-auto justify-start gap-3 rounded-xl px-4 py-4"
            onClick={() => exportReadings('pdf')}
            disabled={isExporting}
          >
            <FileTextIcon className="size-5" />
            PDF
          </Button>
        </div>

        <DialogFooter>
          <DialogClose
            render={
              <Button variant="outline" type="button" disabled={isExporting}>
                Close
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { ExportReadings }