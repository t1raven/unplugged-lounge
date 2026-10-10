import {Button, Flex, Stack} from '@sanity/ui'
import {PatchEvent, set, type DateTimeInputProps} from 'sanity'

type TimePreset = {
  label: string
  hour: number
  minute: number
}

const PERFORMANCE_TIME_PRESETS = [
  {label: '15:00', hour: 15, minute: 0},
  {label: '19:30', hour: 19, minute: 30},
] as const

const SALES_TIME_PRESETS = [
  {label: '17:00', hour: 17, minute: 0},
  {label: '19:00', hour: 19, minute: 0},
] as const

function TimePresetInput({
  presets,
  ...props
}: DateTimeInputProps & {presets: readonly TimePreset[]}) {
  const selectedDate = props.value ? new Date(props.value) : null
  const hasValidDate =
    selectedDate !== null && !Number.isNaN(selectedDate.getTime())

  function applyTime(hour: number, minute: number) {
    if (!hasValidDate || !selectedDate) return

    const nextDate = new Date(selectedDate)
    nextDate.setHours(hour, minute, 0, 0)
    props.onChange(PatchEvent.from(set(nextDate.toISOString())))
  }

  function isSelected(hour: number, minute: number) {
    return (
      selectedDate?.getHours() === hour &&
      selectedDate?.getMinutes() === minute
    )
  }

  return (
    <Stack gap={2}>
      {props.renderDefault(props)}
      <Flex gap={2}>
        {presets.map(({label, hour, minute}) => (
          <Button
            key={label}
            type="button"
            text={label}
            mode={isSelected(hour, minute) ? 'default' : 'ghost'}
            disabled={!hasValidDate}
            onClick={() => applyTime(hour, minute)}
          />
        ))}
      </Flex>
    </Stack>
  )
}

export function PerformanceTimeInput(props: DateTimeInputProps) {
  return <TimePresetInput {...props} presets={PERFORMANCE_TIME_PRESETS} />
}

export function SalesTimeInput(props: DateTimeInputProps) {
  return <TimePresetInput {...props} presets={SALES_TIME_PRESETS} />
}