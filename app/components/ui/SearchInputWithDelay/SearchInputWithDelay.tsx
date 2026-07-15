import { useEffect, useState } from 'react'
import { cn, Input } from '@heroui/react'
import { IoSearchOutline } from 'react-icons/io5'

const TextInputWithDelay = ({
  setValue,
}: {
  setValue: (value: string) => void
}) => {
  const [inputValue, setInputValue] = useState('')
  // const [lastValue, setLastValue] = useState('');
  const [timer, setTimer] = useState(setTimeout(() => {}))

  const handleChange = (value: string) => {
    setInputValue(value)

    // اگر تایمر قبلاً تنظیم شده باشد، آن را پاک کنید
    if (timer) {
      clearTimeout(timer)
    }
    // if (value != '')
    //   setValue(value)

    // تایمر جدید برای 2 ثانیه تنظیم کنید
    setTimer(
      setTimeout(() => {
        setValue(value)
        // setLastValue(e.target.value);
      }, 2000)
    )
  }
  useEffect(() => {}, [setValue])
  return (
    <Input
      startContent={<IoSearchOutline className="size-5" />}
      placeholder="نام را وارد نمایید..."
      classNames={{
        base: cn('max-w-md'),
      }}
      value={inputValue}
      onValueChange={handleChange}
    />
  )
}

export default TextInputWithDelay
