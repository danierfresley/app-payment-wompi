import { CreateDeliveryUseCase } from './create-delivery.use-case';
import { UpsertCustomerUseCase } from './upsert-customer.use-case';

const customer = {
  id: 'c1',
  name: 'Ana',
  email: 'ana@test.com',
  phone: '300',
  documentType: 'CC',
  documentNumber: '1',
};

describe('customer and delivery use cases', () => {
  it('validates and upserts a customer', async () => {
    const useCase = new UpsertCustomerUseCase({
      findById: async () => customer,
      upsertByEmail: async (input) => ({ ...customer, ...input, id: 'c1' }),
    });
    const invalid = await useCase.execute({
      name: '',
      email: 'bad',
      phone: '',
      documentType: '',
      documentNumber: '',
    });
    expect(invalid.ok).toBe(false);
    expect(
      (
        await useCase.execute({
          name: 'Ana',
          email: 'ana@test.com',
          phone: '',
          documentType: 'CC',
          documentNumber: '1',
        })
      ).ok,
    ).toBe(false);
    expect(
      (
        await useCase.execute({
          name: 'Ana',
          email: 'ana@test.com',
          phone: '300',
          documentType: '',
          documentNumber: '',
        })
      ).ok,
    ).toBe(false);
    const valid = await useCase.execute({
      name: 'Ana',
      email: 'ana@test.com',
      phone: '300',
      documentType: 'CC',
      documentNumber: '1',
    });
    expect(valid.ok).toBe(true);
  });

  it('creates a delivery only for an existing customer', async () => {
    const useCase = new CreateDeliveryUseCase(
      {
        findById: async (id) => (id === 'c1' ? customer : null),
        upsertByEmail: async () => customer,
      },
      {
        findById: async () => null,
        create: async (input) => ({
          id: 'd1',
          status: 'PENDING',
          ...input,
        }),
      },
    );
    expect(
      (
        await useCase.execute({
          customerId: 'c1',
          address: '',
          city: '',
          region: '',
          postalCode: '',
        })
      ).ok,
    ).toBe(false);
    expect(
      (
        await useCase.execute({
          customerId: 'missing',
          address: 'Cra 1',
          city: 'Bogotá',
          region: 'Cundinamarca',
          postalCode: '110111',
        })
      ).ok,
    ).toBe(false);
    expect(
      (
        await useCase.execute({
          customerId: 'c1',
          address: 'Cra 1',
          city: 'Bogotá',
          region: 'Cundinamarca',
          postalCode: '',
        })
      ).ok,
    ).toBe(false);
    expect(
      (
        await useCase.execute({
          customerId: 'c1',
          address: 'Cra 1',
          city: 'Bogotá',
          region: 'Cundinamarca',
          postalCode: '110111',
        })
      ).ok,
    ).toBe(true);
  });
});
