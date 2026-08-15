export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
}

export interface CustomerInput {
  name: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
}
