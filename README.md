# Mini Mercado Sinai - iDFlex Pro Integration

API para integrar com dispositivos de controle de acesso iDAccess iDFlex Pro da Control iD.

## Funcionalidades

- Consultar registros de acesso (logs de entrada/saida)
- Gerenciar usuarios no dispositivo
- Monitorar status do dispositivo
- Abrir portas/reles remotamente

## Requisitos

- Python 3.10+
- Poetry
- Dispositivo iDFlex Pro conectado na rede

## Instalacao

1. Clone o repositorio:
```bash
git clone https://github.com/isaacnattan2/minimercadosinai2-api.git
cd minimercadosinai2-api
```

2. Instale as dependencias:
```bash
poetry install
```

3. Configure as variaveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com o IP e credenciais do seu dispositivo
```

## Configuracao

Edite o arquivo `.env` com as configuracoes do seu dispositivo:

```env
DEVICE_IP=192.168.0.1      # IP do dispositivo iDFlex Pro
DEVICE_LOGIN=admin          # Usuario de acesso
DEVICE_PASSWORD=admin       # Senha de acesso
```

## Execucao

Inicie o servidor de desenvolvimento:
```bash
poetry run fastapi dev app/main.py
```

O servidor estara disponivel em `http://localhost:8000`

## Documentacao da API

Apos iniciar o servidor, acesse:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Endpoints Principais

### Status
- `GET /` - Informacoes da API
- `GET /health` - Health check
- `GET /status` - Status de conexao com o dispositivo

### Registros de Acesso
- `GET /access-logs` - Listar todos os registros de acesso
- `GET /access-logs/recent` - Registros mais recentes
- `GET /access-logs/by-user/{user_id}` - Registros por usuario

### Usuarios
- `GET /users` - Listar todos os usuarios
- `GET /users/{user_id}` - Obter usuario especifico
- `POST /users` - Criar novo usuario
- `PUT /users/{user_id}` - Atualizar usuario
- `DELETE /users/{user_id}` - Remover usuario
- `GET /users/{user_id}/cards` - Listar cartoes do usuario

### Acoes
- `POST /door/open` - Abrir porta/rele

## Referencia da API do iDFlex Pro

Este projeto utiliza a API REST dos dispositivos Control iD. Para mais informacoes:
- [Documentacao oficial](https://www.controlid.com.br/docs/access-api-en/)
- [Exemplos de codigo](https://github.com/controlid/integracao)

## Licenca

MIT
