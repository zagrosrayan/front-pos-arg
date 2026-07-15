/* eslint-disable */

import React from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@heroui/react'
import {
  DELETE_ORDER_LABEL,
  DELETE_LABEL,
  CANCEL_LABEL,
} from '@/app/constant/label'
import { DELETE_ORDER_TEXT } from '@/app/constant/text'

interface DeleteOrderModalProps {
  isOpen: boolean
  onOpenChange: () => void
  onClose: () => void
  handleDeleteOrder: () => void
  isDeleteLoading: boolean
}

const DeleteOrderModal = ({
  isOpen,
  onOpenChange,
  onClose,
  handleDeleteOrder,
  isDeleteLoading,
}: DeleteOrderModalProps) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {DELETE_ORDER_LABEL}
            </ModalHeader>
            <ModalBody>
              <p>{DELETE_ORDER_TEXT}</p>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                {CANCEL_LABEL}
              </Button>
              <Button
                color="danger"
                onPress={handleDeleteOrder}
                isLoading={isDeleteLoading}
              >
                {DELETE_LABEL}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default DeleteOrderModal
