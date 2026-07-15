/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { ORDER_DETAIL_LABEL } from '@/app/constant/label'
import {
  Button,
  cn,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  Textarea,
} from '@heroui/react'
import { IoBagHandle } from 'react-icons/io5'
import CheckoutItem from '../CheckoutItem'
import Checkout from '../Checkout'

interface CheckoutProps {
  isOpen: boolean
  onOpenChange: (data: boolean) => void
}
const CheckoutDrawer = ({ isOpen, onOpenChange }: CheckoutProps) => {
  return (
    <>
      <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerBody className="pt-0">
                <Checkout className="mt-5 w-full min-w-full" />
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default CheckoutDrawer
