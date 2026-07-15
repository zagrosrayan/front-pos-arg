import { cn, Switch, SwitchProps } from '@heroui/react'
import { useEffect } from 'react'
import {
  Control,
  Controller,
  ControllerProps,
  FieldValues,
  Path,
  PathValue,
  useFormContext,
} from 'react-hook-form'

interface SwitchFieldProps<T extends FieldValues>
  extends Omit<SwitchProps, 'checked' | 'onChange'> {
  name: Path<T>
  label?: string
  rules?: ControllerProps['rules']
  activeLabel?: string
  deactivateLabel?: string
}

const SwitchField = <T extends FieldValues>({
  name,
  rules,
  label,
  activeLabel,
  deactivateLabel,
  ...props
}: SwitchFieldProps<T>) => {
  const { control, setValue, getValues } = useFormContext<T>()

  // Ensure default value is false if not set
  useEffect(() => {
    if (getValues(name) === undefined) {
      setValue(name, false as PathValue<T, Path<T>>)
    }
  }, [name, getValues, setValue])

  return (
    <Controller
      name={name}
      control={control as Control<FieldValues>}
      rules={rules}
      render={({ field }) => (
        <div className="">
          <Switch
            checked={field.value ?? false}
            onChange={(e) => field.onChange(e.target.checked)}
            isDisabled={props.disabled}
            isSelected={field.value ?? false}
            classNames={{
              base: cn(
                'inline-flex flex-row-reverse w-full max-w-md bg-content1 hover:bg-content2 items-center',
                'justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-default-100'
              ),
              wrapper: 'p-0 h-4 overflow-visible',
              thumb: cn(
                'w-6 h-6 border-2 shadow-lg',
                'group-data-[hover=true]:border-primary',
                //selected
                'group-data-[selected=true]:ms-6',
                // pressed
                'group-data-[pressed=true]:w-7',
                'group-data-pressed:group-data-selected:ms-4'
              ),
              label: cn('text-default-600 text-sm'),
            }}
            {...props}
          >
            {label}
            {activeLabel && deactivateLabel && (
              <p className="mt-2 text-small text-default-500">
                {field.value ? activeLabel : deactivateLabel}
              </p>
            )}
          </Switch>
        </div>
      )}
    />
  )
}

export default SwitchField
