'use client';

interface Props {
  productId: string;
}

export function DeleteProductButton({ productId }: Props) {
  const onClick = async () => {
    if (!confirm('Delete this product?')) return;
    const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
    if (!res.ok) { alert('Failed to delete'); return; }
    window.location.reload();
  };

  return (
    <button type="button" className="text-red-600 hover:text-red-800" onClick={onClick}>
      Delete
    </button>
  );
}


