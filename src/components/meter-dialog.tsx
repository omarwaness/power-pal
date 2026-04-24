import { useState } from 'react'

import { PlusIcon } from 'lucide-react'

import type { MeterRequest } from '../../types/meter'
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

type MeterDialogProps = {
  onCreated: () => Promise<void> | void
}

function MeterDialog({ onCreated }: MeterDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const resetForm = () => {
    setName('')
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

    const payload: MeterRequest = {
      name
    }

    try {
      await window.api.createMeter(payload)
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
          <Button variant="outline" className="gap-2 rounded-full ">
            <PlusIcon className="size-4" />
            Add meter
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>Add meter</DialogTitle>
            <DialogDescription>
              Create a new meter to start tracking readings.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <Label htmlFor="meter-name">Meter name</Label>
              <Input
                id="meter-name"
                value={name}
                onChange={event => setName(event.target.value)}
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
            <Button
              type="submit"
              disabled={isSaving || name.trim().length === 0}
            >
              {isSaving ? 'Saving...' : 'Save meter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { MeterDialog }
