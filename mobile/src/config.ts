// Em desenvolvimento, aponte para o IP local da máquina que roda o backend
// (não use "localhost": o celular físico não consegue alcançar o localhost do PC).
// Configure isso criando um arquivo `.env` na raiz de `mobile/` com:
//   EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:4000
const FALLBACK_API_URL = "http://192.168.0.10:4000";

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? FALLBACK_API_URL;
