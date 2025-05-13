# Makefile para o projeto Mouros Moto Hub

.PHONY: setup start stop dev-frontend dev-backend install-frontend install-backend

# Instalação inicial do projeto
setup: install-frontend install-backend

# Instalação das dependências do frontend
install-frontend:
	@echo "Instalando dependências do frontend..."
	cd frontend && npm install

# Instalação das dependências do backend
install-backend:
	@echo "Instalando dependências do backend..."
	cd backend && npm install

# Iniciar o projeto completo
start: start-backend start-frontend

# Iniciar apenas o frontend
start-frontend:
	@echo "Iniciando o frontend..."
	cd frontend && npm run dev

# Iniciar apenas o backend
start-backend:
	@echo "Iniciando o backend..."
	cd backend && npm run dev

# Parar todos os serviços
stop:
	@echo "Parando todos os serviços..."
	@-pkill -f "npm run dev" 2>/dev/null || true

# Desenvolvimento do frontend
dev-frontend:
	@echo "Iniciando o frontend em modo de desenvolvimento..."
	cd frontend && npm run dev

# Desenvolvimento do backend
dev-backend:
	@echo "Iniciando o backend em modo de desenvolvimento..."
	cd backend && npm run dev

# Desenvolvimento completo (frontend e backend)
dev:
	@echo "Iniciando o ambiente de desenvolvimento completo..."
	@chmod +x ./start-dev.sh
	./start-dev.sh

# Build do projeto
build: build-frontend build-backend

# Build do frontend
build-frontend:
	@echo "Construindo o frontend..."
	cd frontend && npm run build

# Build do backend
build-backend:
	@echo "Construindo o backend..."
	cd backend && npm run build

# Método alternativo para iniciar o frontend e backend
dev-manual:
	@echo "Iniciando o ambiente de desenvolvimento manualmente..."
	@chmod +x ./start-manual.sh
	./start-manual.sh
	cd backend && npm run build

# Limpar arquivos temporários
clean:
	@echo "Limpando arquivos temporários..."
	rm -rf frontend/dist
	rm -rf frontend/node_modules
	rm -rf backend/node_modules
