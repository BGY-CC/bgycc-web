"use client";

import { CheckCircle2 } from "lucide-react";
import { Modal, ModalContent, ModalFooter, Button } from "@/components/ui";

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

export function SuccessModal({
  open,
  onClose,
  title,
  description,
}: SuccessModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="max-w-sm text-center">
        <div className="flex flex-col items-center gap-3 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="mt-1 break-words text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <ModalFooter className="justify-center">
          <Button onClick={onClose} className="min-h-11 w-full sm:w-auto sm:min-w-32">
            Continue
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
