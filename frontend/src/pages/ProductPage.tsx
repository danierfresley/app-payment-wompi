import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PaymentModal } from '../components/PaymentModal';
import { SummaryBackdrop } from '../components/SummaryBackdrop';
import { setQuantity, setStep } from '../features/checkout/checkoutSlice';
import { fetchProducts, selectProduct } from '../features/product/productSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { productImageSrc } from '../utils/image';
import { formatCop } from '../utils/money';

export function ProductPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, selectedId, status, error } = useAppSelector((state) => state.product);
  const checkout = useAppSelector((state) => state.checkout);
  const product = items.find((item) => item.id === selectedId) ?? items[0];

  useEffect(() => {
    if (checkout.step === 'status') {
      navigate('/status');
    }
  }, [checkout.step, navigate]);

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchProducts());
    }
  }, [dispatch, status]);

  if (status === 'loading' || !product) {
    return (
      <main className="page">
        <p className="muted">Cargando catálogo…</p>
        {error ? <p className="form-error">{error}</p> : null}
      </main>
    );
  }

  const soldOut = product.stock < 1;

  return (
    <main className="page">
      <header className="topbar">
        <span className="mark">Tienda Danier</span>
        <span className="stock-pill">{product.stock} en stock</span>
      </header>

      <article className="product">
        <figure className="hero">
          <img
            src={productImageSrc(product.imageUrl, 800)}
            srcSet={`${productImageSrc(product.imageUrl, 480)} 480w, ${productImageSrc(product.imageUrl, 800)} 800w`}
            sizes="(max-width: 480px) 100vw, 480px"
            alt={product.name}
            width={800}
            height={640}
          />
        </figure>
        <div className="copy">
          <p className="eyebrow">Edición limitada</p>
          <h1>{product.name}</h1>
          <p className="price">{formatCop(product.priceInCents)}</p>
          <p className="lead">{product.description}</p>

          {items.length > 1 ? (
            <div className="picker" role="listbox" aria-label="Productos">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`chip ${item.id === product.id ? 'is-on' : ''}`}
                  onClick={() => dispatch(selectProduct(item.id))}
                >
                  {item.name}
                </button>
              ))}
            </div>
          ) : null}

          <div className="qty">
            <span>Unidades</span>
            <div className="qty-stepper">
              <button
                type="button"
                className="qty-btn"
                aria-label="Quitar unidad"
                disabled={checkout.quantity <= 1}
                onClick={() => dispatch(setQuantity(checkout.quantity - 1))}
              >
                −
              </button>
              <input
                type="number"
                min={1}
                max={product.stock}
                inputMode="numeric"
                value={checkout.quantity}
                onChange={(event) => dispatch(setQuantity(Number(event.target.value)))}
              />
              <button
                type="button"
                className="qty-btn"
                aria-label="Agregar unidad"
                disabled={checkout.quantity >= product.stock}
                onClick={() => dispatch(setQuantity(checkout.quantity + 1))}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </article>

      <div className="buy-bar">
        <button
          type="button"
          className="btn primary"
          disabled={soldOut}
          onClick={() => dispatch(setStep('form'))}
        >
          {soldOut ? 'Sin stock' : 'Pagar con tarjeta de crédito'}
        </button>
      </div>

      {checkout.step === 'form' ? <PaymentModal /> : null}
      {checkout.step === 'summary' ? <SummaryBackdrop /> : null}
    </main>
  );
}
