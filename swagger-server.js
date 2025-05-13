// Para compatibilidade com o tipo de módulo "module" definido no package.json
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Ler o arquivo YAML
const swaggerFile = fs.readFileSync(path.join(__dirname, 'swagger.yaml'), 'utf8');
const swaggerDocument = YAML.parse(swaggerFile);

// Configurar rota para o Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rota principal
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor Swagger rodando em http://localhost:${PORT}/api-docs`);
  console.log(`Documentação da API Mouros Moto Hub agora disponível!`);
});
