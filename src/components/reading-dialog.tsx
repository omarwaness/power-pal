import { useState } from 'react'

import { format } from 'date-fns'
import { ChevronDownIcon } from 'lucide-react'

import type { ReadingRequest } from '../../types/readings'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
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
import { Field, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type ReadingDialogProps = {
  meterId: number
  meterName: string
  onCreated: () => Promise<void> | void
}

function ReadingDialog({ meterId, meterName, onCreated }: ReadingDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [showCalendar, setShowCalendar] = useState(false)
  const [consumption, setConsumption] = useState('')
  const [production, setProduction] = useState('')
  const [gas, setGas] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const resetForm = () => {
    setSelectedDate(undefined)
    setShowCalendar(false)
    setConsumption('')
    setProduction('')
    setGas('')
    setIsSaving(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (!nextOpen) {
      resetForm()
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)

    const payload: ReadingRequest = {
      meter_id: meterId,
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
      consumption: Number(consumption),
      production: Number(production),
      gas: Number(gas)
    }

    try {
      await window.api.createReading(payload)
      await onCreated()
      handleOpenChange(false)
    } catch {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline" className="rounded-full">
            Add reading
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>Add reading</DialogTitle>
            <DialogDescription>
              Add a new reading for {meterName}.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <Label>Date</Label>
              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  variant="outline"
                  data-empty={!selectedDate}
                  className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                  onClick={() => setShowCalendar(current => !current)}
                >
                  {selectedDate ? (
                    format(selectedDate, 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <ChevronDownIcon />
                </Button>

                {showCalendar && (
                  <div className="w-fit rounded-xl border">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={date => {
                        setSelectedDate(date)
                        setShowCalendar(false)
                      }}
                      defaultMonth={selectedDate}
                    />
                  </div>
                )}
              </div>
            </Field>

            <Field>
              <Label htmlFor={`consumption-${meterId}`}>Consumption</Label>
              <Input
                id={`consumption-${meterId}`}
                inputMode="decimal"
                value={consumption}
                onChange={event => setConsumption(event.target.value)}
              />
            </Field>

            <Field>
              <Label htmlFor={`production-${meterId}`}>Production</Label>
              <Input
                id={`production-${meterId}`}
                inputMode="decimal"
                value={production}
                onChange={event => setProduction(event.target.value)}
              />
            </Field>

            <Field>
              <Label htmlFor={`gas-${meterId}`}>Gas</Label>
              <Input
                id={`gas-${meterId}`}
                inputMode="decimal"
                value={gas}
                onChange={event => setGas(event.target.value)}
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              }
            />
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save reading'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { ReadingDialog }
