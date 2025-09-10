import React from 'react';
import { Button } from './ui/button';

interface ModalConfirmationCheckoutPageProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ModalConfirmationCheckoutPage: React.FC<ModalConfirmationCheckoutPageProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-bold mb-4">Confirmar Pedido</h2>
        <p className="text-gray-700 mb-6">¿Estás seguro de que deseas confirmar el pedido y continuar a WhatsApp?</p>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmationCheckoutPage;
