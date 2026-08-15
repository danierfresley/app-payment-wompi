import { useEffect, useState } from 'react';
import {
  setAcceptance,
  setAcceptedPersonal,
  setAcceptedTerms,
  setCardToken,
  setCustomer,
  setDelivery,
  setIds,
  setStep,
  type CheckoutCustomer,
  type CheckoutDelivery,
} from '../features/checkout/checkoutSlice';
import { api } from '../services/api';
import { fetchAcceptance, tokenizeCard } from '../services/paymentClient';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  detectCardBrand,
  digitsOnly,
  formatCardNumber,
  isSupportedBrand,
  isValidCvc,
  isValidExpiry,
  luhnValid,
} from '../utils/card';
import { CardBrandMarks } from './CardBrandMarks';

export function PaymentModal() {
  const dispatch = useAppDispatch();
  const checkout = useAppSelector((state) => state.checkout);
  const [cardNumber, setCardNumber] = useState('');
  const [holder, setHolder] = useState(checkout.customer.name);
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [customer, setCustomerForm] = useState<CheckoutCustomer>(checkout.customer);
  const [delivery, setDeliveryForm] = useState<CheckoutDelivery>(checkout.delivery);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const brand = detectCardBrand(cardNumber);

  useEffect(() => {
    fetchAcceptance()
      .then((info) => dispatch(setAcceptance(info)))
      .catch(() => {
        setError('No se pudieron cargar los contratos de aceptación');
      });
  }, [dispatch]);

  const onClose = () => dispatch(setStep('product'));

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const number = digitsOnly(cardNumber);
    if (!luhnValid(number) || !isSupportedBrand(brand)) {
      setError('Ingresa una tarjeta Visa o Mastercard válida');
      return;
    }
    if (!isValidExpiry(expMonth, expYear)) {
      setError('La fecha de vencimiento no es válida');
      return;
    }
    if (!isValidCvc(cvc)) {
      setError('El CVC debe tener 3 o 4 dígitos');
      return;
    }
    if (!holder.trim()) {
      setError('El nombre del titular es obligatorio');
      return;
    }
    if (!checkout.acceptedTerms || !checkout.acceptedPersonal) {
      setError('Debes aceptar los contratos para continuar');
      return;
    }

    setBusy(true);
    try {
      const token = await tokenizeCard({
        number,
        cvc,
        expMonth,
        expYear,
        cardHolder: holder.trim(),
      });
      const savedCustomer = await api.upsertCustomer(customer);
      const savedDelivery = await api.createDelivery({
        customerId: savedCustomer.id,
        ...delivery,
      });
      dispatch(setCustomer(customer));
      dispatch(setDelivery(delivery));
      dispatch(setIds({ customerId: savedCustomer.id, deliveryId: savedDelivery.id }));
      dispatch(setCardToken({ token, last4: number.slice(-4), brand }));
      setCardNumber('');
      setCvc('');
      dispatch(setStep('summary'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo validar el pago');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="overlay" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pay-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-head">
          <div className="modal-head-copy">
            <p className="eyebrow">Paso 2 de 4</p>
            <h2 id="pay-title">Pago y entrega</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>

        <form className="form" onSubmit={onSubmit}>
          <section>
            <h3>Tarjeta</h3>
            <CardBrandMarks brand={brand} />
            <label>
              Número
              <input
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="4242 4242 4242 4242"
                value={formatCardNumber(cardNumber)}
                onChange={(event) => setCardNumber(event.target.value)}
              />
            </label>
            <label>
              Titular
              <input
                autoComplete="cc-name"
                value={holder}
                onChange={(event) => setHolder(event.target.value)}
              />
            </label>
            <div className="row card-extra">
              <label>
                Mes
                <input
                  inputMode="numeric"
                  placeholder="12"
                  maxLength={2}
                  value={expMonth}
                  onChange={(event) => setExpMonth(digitsOnly(event.target.value).slice(0, 2))}
                />
              </label>
              <label>
                Año
                <input
                  inputMode="numeric"
                  placeholder="29"
                  maxLength={4}
                  value={expYear}
                  onChange={(event) => setExpYear(digitsOnly(event.target.value).slice(0, 4))}
                />
              </label>
              <label>
                CVC
                <input
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  maxLength={4}
                  value={cvc}
                  onChange={(event) => setCvc(digitsOnly(event.target.value).slice(0, 4))}
                />
              </label>
            </div>
          </section>

          <section>
            <h3>Cliente</h3>
            <label>
              Nombre
              <input
                value={customer.name}
                onChange={(event) =>
                  setCustomerForm({ ...customer, name: event.target.value })
                }
              />
            </label>
            <label>
              Correo
              <input
                type="email"
                value={customer.email}
                onChange={(event) =>
                  setCustomerForm({ ...customer, email: event.target.value })
                }
              />
            </label>
            <div className="row">
              <label>
                Teléfono
                <input
                  value={customer.phone}
                  onChange={(event) =>
                    setCustomerForm({ ...customer, phone: event.target.value })
                  }
                />
              </label>
              <label>
                Documento
                <input
                  value={customer.documentNumber}
                  onChange={(event) =>
                    setCustomerForm({ ...customer, documentNumber: event.target.value })
                  }
                />
              </label>
            </div>
          </section>

          <section>
            <h3>Entrega</h3>
            <label>
              Dirección
              <input
                value={delivery.address}
                onChange={(event) =>
                  setDeliveryForm({ ...delivery, address: event.target.value })
                }
              />
            </label>
            <div className="row">
              <label>
                Ciudad
                <input
                  value={delivery.city}
                  onChange={(event) =>
                    setDeliveryForm({ ...delivery, city: event.target.value })
                  }
                />
              </label>
              <label>
                Región
                <input
                  value={delivery.region}
                  onChange={(event) =>
                    setDeliveryForm({ ...delivery, region: event.target.value })
                  }
                />
              </label>
            </div>
            <label>
              Código postal
              <input
                value={delivery.postalCode}
                onChange={(event) =>
                  setDeliveryForm({ ...delivery, postalCode: event.target.value })
                }
              />
            </label>
          </section>

          <section className="legal">
            <label className="check">
              <input
                type="checkbox"
                checked={checkout.acceptedTerms}
                onChange={(event) => dispatch(setAcceptedTerms(event.target.checked))}
              />
              <span>
                Acepto los{' '}
                <a href={checkout.permalink ?? '#'} target="_blank" rel="noreferrer">
                  términos de uso
                </a>
              </span>
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={checkout.acceptedPersonal}
                onChange={(event) => dispatch(setAcceptedPersonal(event.target.checked))}
              />
              <span>
                Autorizo el{' '}
                <a href={checkout.personalPermalink ?? '#'} target="_blank" rel="noreferrer">
                  tratamiento de datos
                </a>
              </span>
            </label>
          </section>

          {error ? <p className="form-error">{error}</p> : null}
          <div className="form-actions">
            <button type="submit" className="btn primary" disabled={busy}>
              {busy ? 'Validando…' : 'Continuar al resumen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
