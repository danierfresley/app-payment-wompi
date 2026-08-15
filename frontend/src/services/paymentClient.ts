import { appEnv } from '../config';

const WOMPI_BASE = appEnv.wompiBaseUrl;
const PUBLIC_KEY = appEnv.wompiPublicKey;

export interface AcceptanceInfo {
  acceptanceToken: string;
  acceptPersonalAuth: string;
  permalink: string;
  personalPermalink: string;
}

export interface CardTokenInput {
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  cardHolder: string;
}

export const fetchAcceptance = async (): Promise<AcceptanceInfo> => {
  const response = await fetch(`${WOMPI_BASE}/merchants/${PUBLIC_KEY}`);
  const body = (await response.json()) as {
    data?: {
      presigned_acceptance?: { acceptance_token: string; permalink: string };
      presigned_personal_data_auth?: {
        acceptance_token: string;
        permalink: string;
      };
    };
  };
  const acceptance = body.data?.presigned_acceptance;
  const personal = body.data?.presigned_personal_data_auth;
  if (!acceptance?.acceptance_token || !personal?.acceptance_token) {
    throw new Error('No fue posible obtener los contratos de aceptación');
  }
  return {
    acceptanceToken: acceptance.acceptance_token,
    acceptPersonalAuth: personal.acceptance_token,
    permalink: acceptance.permalink,
    personalPermalink: personal.permalink,
  };
};

export const tokenizeCard = async (input: CardTokenInput): Promise<string> => {
  const response = await fetch(`${WOMPI_BASE}/tokens/cards`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PUBLIC_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      number: input.number,
      cvc: input.cvc,
      exp_month: input.expMonth.padStart(2, '0'),
      exp_year: input.expYear.slice(-2).padStart(2, '0'),
      card_holder: input.cardHolder,
    }),
  });
  const body = (await response.json()) as {
    data?: { id: string };
    error?: { reason?: string };
  };
  if (!response.ok || !body.data?.id) {
    throw new Error(body.error?.reason ?? 'No se pudo tokenizar la tarjeta');
  }
  return body.data.id;
};
