import { useState } from 'react'

import { PencilIcon } from 'lucide-react'

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
import { Field, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type UpdateReadingProps = {
  reading: ReadingResponse
  meterName: string
  onUpdated: () => Promise<void> | void
}

function UpdateReading({ reading, meterName, onUpdated }: UpdateReadingProps) {
  const [open, setOpen] = useState(false)
  const [consumption, setConsumption] = useState(String(reading.consumption))
  const [production, setProduction] = useState(String(reading.production))
  const [gas, setGas] = useState(String(reading.gas))
  const [isSaving, setIsSaving] = useState(false)

  const resetForm = () => {
    setConsumption(String(reading.consumption))
    setProduction(String(reading.production))
    setGas(String(reading.gas))
    setIsSaving(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (nextOpen) {
      resetForm()
      return
    }

    resetForm()
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      await window.api.updateReading(reading.id, {
        consumption: Number(consumption),
        production: Number(production),
        gas: Number(gas)
      })
      await onUpdated()
      handleOpenChange(false)
    } catch {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={`Edit reading for ${meterName} on ${reading.date}`}
          >
            <PencilIcon className="size-4" />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>Update reading</DialogTitle>
            <DialogDescription>
              Update the reading values for {meterName}.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <Label htmlFor={`update-consumption-${reading.id}`}>
                Consumption
              </Label>
              <Input
                id={`update-consumption-${reading.id}`}
                inputMode="decimal"
                value={consumption}
                onChange={event => setConsumption(event.target.value)}
              />
            </Field>

            <Field>
              <Label htmlFor={`update-production-${reading.id}`}>
                Production
              </Label>
              <Input
                id={`update-production-${reading.id}`}
                inputMode="decimal"
                value={production}
                onChange={event => setProduction(event.target.value)}
              />
            </Field>

            <Field>
              <Label htmlFor={`update-gas-${reading.id}`}>Gas</Label>
              <Input
                id={`update-gas-${reading.id}`}
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
              {isSaving ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { UpdateReading }