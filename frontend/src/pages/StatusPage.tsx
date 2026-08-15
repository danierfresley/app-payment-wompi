import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetCheckout, setStep } from '../features/checkout/checkoutSlice';
import { fetchProducts } from '../features/product/productSlice';
import { clearTransaction, refreshTransaction } from '../features/transaction/transactionSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { formatCop } from '../utils/money';

const copy: Record<string, { title: string; text: string }> = {
  APPROVED: {
    title: 'Pago aprobado',
    text: 'El producto ya está asignado a tu entrega. El stock se actualizó.',
  },
  DECLINED: {
    title: 'Pago rechazado',
    text: 'La entidad declinó la transacción. El inventario no se descontó.',
  },
  ERROR: {
    title: 'No se pudo cobrar',
    text: 'Hubo un error con el procesador. Intenta de nuevo en un momento.',
  },
  PENDING: {
    title: 'Pago en proceso',
    text: 'Estamos confirmando el resultado con el procesador.',
  },
};

export function StatusPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const transaction = useAppSelector((state) => state.transaction.current);

  useEffect(() => {
    if (!transaction) {
      navigate('/');
      return;
    }
    if (transaction.status === 'PENDING') {
      const timer = window.setInterval(() => {
        void dispatch(refreshTransaction(transaction.id));
      }, 2000);
      return () => window.clearInterval(timer);
    }
    return undefined;
  }, [dispatch, navigate, transaction]);

  if (!transaction) {
    return null;
  }

  const view = copy[transaction.status] ?? copy.PENDING;

  const goHome = () => {
    dispatch(resetCheckout());
    dispatch(clearTransaction());
    void dispatch(fetchProducts());
    dispatch(setStep('product'));
    navigate('/');
  };

  return (
    <main className="page status-page">
      <p className="eyebrow">Paso 4 de 4</p>
      <h1>{view.title}</h1>
      <p className="lead">{view.text}</p>
      <dl className="status-card">
        <div>
          <dt>Referencia</dt>
          <dd className="break">{transaction.reference}</dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>{transaction.status}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{formatCop(transaction.totalAmount)}</dd>
        </div>
      </dl>
      <button type="button" className="btn primary" onClick={goHome}>
        Volver a la tienda
      </button>
    </main>
  );
}
