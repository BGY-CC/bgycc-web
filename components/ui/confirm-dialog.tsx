import { ReactNode } from "react";
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
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "destructive" | "outline" | "ghost";
}

/**
 * Reusable confirmation dialog.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  isLoading,
  icon,
  variant = "primary",
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="max-w-lg">
        <ModalHeader
          className="flex flex-col items-center text-center"
          icon={icon || <Trash2 className="h-6 w-6 text-red-500" />}
          title={title}
          description={description}
        />
        <ModalFooter className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto sm:min-w-[140px] rounded-xl h-11">
            Cancel
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            isLoading={isLoading}
            className="w-full sm:w-auto sm:min-w-[180px] rounded-xl h-11 whitespace-nowrap"
          >
            {confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
