import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { ProductForm } from '../../app/admin/productos/ProductForm';
import { supabaseBrowser } from '@/utils/supabaseClientBrowser';

interface ProductQuickCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const ProductQuickCreateModal: React.FC<ProductQuickCreateModalProps> = ({ open, onClose, onCreated }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(values: any) {
    setSubmitting(true);
    setError(null);
    try {
  // Eliminar id y d si existen antes de insertar
  const { id, d, ...productData } = values;
  const { error } = await supabaseBrowser.from('products').insert([productData]);
      if (error) throw error;
      onCreated?.();
      onClose();
    } catch (e: any) {
      setError(e.message || 'Error al crear producto');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTitle>Alta rápida de producto</DialogTitle>
      <DialogContent>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <ProductForm
          onSave={handleSave}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProductQuickCreateModal;
