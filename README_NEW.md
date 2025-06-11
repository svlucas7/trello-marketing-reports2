# 📊 Relatórios de Marketing - Trello

Uma ferramenta web profissional para transformar dados exportados do Trello em relatórios executivos automáticos.

🔗 **[Acesse a Ferramenta Online](https://svlucas7.github.io/trello-marketing-reports2/)**

## 🎯 Objetivo

Resolver a necessidade de relatórios mensais da equipe de marketing, substituindo Power-Ups pagos do Trello por uma solução gratuita, offline e profissional.

## ✨ Funcionalidades

### 📥 Importação de Dados
- Importação via copy/paste ou upload de JSON do Trello
- Validação automática do formato
- Feedback visual do processamento

### 📊 Dashboard de Métricas
- Cards visuais com KPIs principais
- Resumo executivo com percentuais
- Performance por colaborador
- Distribuição por status

### 📋 Relatório Detalhado
- Lista completa de todas as tarefas
- Busca e filtros por pessoa, status, data
- Ordenação por colunas
- Destaque visual para atrasos

### 📄 Exportação Múltipla
- **PDF**: Relatório formatado para apresentação
- **Excel**: Planilha com dados estruturados
- **Texto**: Para copiar em email/WhatsApp
- **JSON**: Para integrações futuras

## 🔧 Como Usar

### 1. Exportar do Trello
1. Acesse seu quadro de Marketing no Trello
2. Clique no menu do quadro (três pontos)
3. Selecione "Mais" → "Imprimir e Exportar" → "Exportar JSON"
4. Copie todo o conteúdo do arquivo JSON

### 2. Gerar Relatório
1. Acesse a [ferramenta online](https://svlucas7.github.io/trello-marketing-reports2/)
2. Cole o JSON na primeira tela
3. Selecione o período desejado
4. Visualize o dashboard e relatório detalhado
5. Exporte no formato necessário

## 📈 Estrutura do Workflow

A ferramenta reconhece automaticamente as seguintes listas do Trello:

- **PLANEJANDO ESTRATÉGIAS** → Status: Planejamento
- **ATIVIDADES RECORRENTES** → Status: Recorrente  
- **EM PROCESSO DE CONTEÚDO** → Status: Em Andamento
- **EM PROCESSO DE QUALIDADE** → Status: Em Andamento
- **EM PROCESSO DE EDIÇÃO E REVISÃO** → Status: Em Andamento
- **EM PROCESSO DE MONTAGEM** → Status: Em Andamento
- **EM PROCESSO DE REVISÃO** → Status: Em Andamento
- **AGUARDANDO RETORNO DE CORREÇÕES** → Status: Bloqueado
- **EM PROCESSO DE ENVIO** → Status: Finalizando
- **FEITO** → Status: Concluído

### Regras de Classificação
- **Concluídas**: Somente lista "FEITO"
- **Em Andamento**: Listas 3-7 (todos os "EM PROCESSO")
- **Atrasadas**: Qualquer card com data de vencimento passada (exceto FEITO)
- **Bloqueadas**: "AGUARDANDO RETORNO DE CORREÇÕES"

## 🛠️ Tecnologias

- **React 18** + **TypeScript** - Interface moderna e type-safe
- **Vite** - Build tool rápido e otimizado
- **Lucide React** - Ícones profissionais
- **jsPDF** - Geração de PDFs
- **XLSX** - Exportação para Excel
- **date-fns** - Manipulação de datas
- **CSS Variables** - Design system consistente

## 🎨 Design

- **Moderno e Profissional**: Interface corporativa
- **Responsivo**: Funciona em desktop, tablet e mobile
- **Acessível**: Navegação por teclado, contrastes adequados
- **Cores**: Azul empresarial, verde para sucesso, vermelho para alertas

## 🚀 Desenvolvimento Local

```bash
# Clonar o repositório
git clone https://github.com/svlucas7/trello-marketing-reports2.git
cd trello-marketing-reports2

# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 📱 Deploy

O projeto é automaticamente deployado no GitHub Pages via GitHub Actions sempre que há push na branch `main`.

## 🔒 Privacidade

- **100% Offline**: Todos os dados são processados localmente no navegador
- **Sem Servidor**: Nenhum dado é enviado para servidores externos
- **Seguro**: JSON do Trello permanece no seu dispositivo

## 📄 Licença

Este projeto foi desenvolvido especificamente para a equipe de marketing e está disponível sob licença MIT.

---

**Desenvolvido com ❤️ para otimizar o workflow da equipe de marketing**
