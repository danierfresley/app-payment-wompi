import { useNavigate } from 'react-router-dom';
import { setStep } from '../features/checkout/checkoutSlice';
import { payTransaction } from '../features/transaction/transactionSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { appEnv } from '../config';
import { formatCop } from '../utils/money';

const BASE_FEE = appEnv.baseFeeCents;
const DELIVERY_FEE = appEnv.deliveryFeeCents;

export function SummaryBackdrop() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const product = useAppSelector((state) =>
    state.product.items.find((item) => item.id === state.product.selectedId),
  );
  const checkout = useAppSelector((state) => state.checkout);
  const paying = useAppSelector((state) => state.transaction.status === 'paying');
  const payError = useAppSelector((state) => state.transaction.error);

  if (!product) {
    return null;
  }

  const productAmount = product.priceInCents * checkout.quantity;
  const total = productAmount + BASE_FEE + DELIVERY_FEE;

  const onPay = async () => {
    if (
      !checkout.customerId ||
      !checkout.deliveryId ||
      !checkout.cardToken ||
      !checkout.acceptanceToken ||
      !checkout.acceptPersonalAuth
    ) {
      return;
    }
    const result = await dispatch(
      payTransaction({
        productId: product.id,
        customerId: checkout.customerId,
        deliveryId: checkout.deliveryId,
        quantity: checkout.quantity,
        cardToken: checkout.cardToken,
        last4: checkout.last4 ?? undefined,
        cardBrand: checkout.cardBrand ?? undefined,
        acceptanceToken: checkout.acceptanceToken,
        acceptPersonalAuth: checkout.acceptPersonalAuth,
      }),
    );
    if (payTransaction.fulfilled.match(result)) {
      dispatch(setStep('status'));
      navigate('/status');
    }
  };

  return (
    <div className="backdrop">
      <div className="backdrop-back">
        <p className="eyebrow">Resumen</p>
        <h2>{product.name}</h2>
        <p>
          {checkout.quantity} unidad{checkout.quantity > 1 ? 'es' : ''} · **** {checkout.last4}{' '}
          {checkout.cardBrand}
        </p>
        <p className="muted break">
          {checkout.delivery.address}, {checkout.delivery.city}
        </p>
      </div>
      <section className="backdrop-front" aria-label="Detalle de cobro">
        <p className="eyebrow">Paso 3 de 4</p>
        <h3>Confirma el pago</h3>
        <dl className="totals">
          <div>
            <dt>Producto</dt>
            <dd>{formatCop(productAmount)}</dd>
          </div>
          <div>
            <dt>Tarifa base</dt>
            <dd>{formatCop(BASE_FEE)}</dd>
          </div>
          <div>
            <dt>Envío</dt>
            <dd>{formatCop(DELIVERY_FEE)}</dd>
          </div>
          <div className="total">
            <dt>Total</dt>
            <dd>{formatCop(total)}</dd>
          </div>
        </dl>
        {payError ? <p className="form-error">{payError}</p> : null}
        <div className="actions">
          <button type="button" className="btn ghost" onClick={() => dispatch(setStep('form'))}>
            Volver
          </button>
          <button type="button" className="btn confirm" onClick={onPay} disabled={paying}>
            {paying ? 'Procesando…' : 'Pagar ahora'}
          </button>
        </div>
      </section>
    </div>
  );
}
