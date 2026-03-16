"use client";

import { Trash2 } from "lucide-react";
import { Modal, ModalContent, ModalHeader, ModalFooter } from "./modal";
import { Button } from "./button";

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isLoading?: boolean;
}

/**
 * Reusable destructive-action confirmation dialog.
 * Red trash icon, Cancel + Delete buttons.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  isLoading,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="max-w-sm text-center">
        {/* Close is handled inside ModalHeader */}
        <ModalHeader
          icon={<Trash2 className="h-5 w-5 text-red-500" />}
          title={title}
          description={description}
        />
        <ModalFooter className="justify-center">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1"
          >
            {confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
