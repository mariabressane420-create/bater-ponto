# ESPECIFICAÇÕES DO SISTEMA (SPECS.MD)

## 1. Objetivo
Sistema web de registro de ponto eletrônico para funcionários com cálculo automático de horas e geração de comprovante em ticket.

## 2. Tecnologias
- Frontend: HTML5, CSS3 (Pico.css / Custom CSS), JavaScript (ES Modules).
- Backend / Banco de Dados: Supabase (PostgreSQL).
- Recursos Adicionais: Captura de foto via Webcam e Geração de QR Code no comprovante.

## 3. Estrutura do Banco de Dados (Supabase)
- Tabela `funcionarios`: `id`, `matricula`, `nome_completo`, `cargo`, `saldo_banco_horas`.
- Tabela `registros_ponto`: `id`, `funcionario_id`, `tipo_registro` (ENTRADA/SAÍDA), `data_hora`.

## 4. Requisitos Funcionais
- Validação da matrícula do funcionário no banco.
- Captura de foto do rosto no momento do registro.
- Registro do ponto na tabela `registros_ponto`.
- Exibição de comprovante de ponto com dados do funcionário, foto capturada e QR Code.
- Opção de impressão automática do comprovante.