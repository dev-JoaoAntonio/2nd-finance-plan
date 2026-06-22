// Entry serverless da Vercel. Importa o app Nest já compilado (apps/api/dist)
// e delega o request para o handler Express cacheado.
import { bootstrapServer } from '../apps/api/dist/serverless';

export default async function handler(req: any, res: any) {
  const app = await bootstrapServer();
  return app(req, res);
}
