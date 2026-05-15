\# CLAUDE.md — Gerador de Certificados em Lote



Este arquivo instrui o Claude Code sobre o contexto, regras e decisões deste módulo.



\---



\## Visão Geral do Módulo



Módulo chamado \*\*Gerador de Certificados em Lote\*\*.



Permite que o usuário preencha dados fixos de um curso, importe uma planilha Excel com Nome e CPF dos funcionários, valide os dados, visualize uma prévia e gere um PDF único com um certificado por página, pronto para impressão.



\---



\## Escopo da Primeira Versão



\### O que deve ser feito



\- Preencher dados fixos do certificado via formulário

\- Fazer upload de planilha Excel (.xlsx ou .xls)

\- Ler as colunas Nome e CPF

\- Validar os dados de cada funcionário

\- Mostrar tabela de conferência com status de validação

\- Exibir prévia visual do certificado

\- Gerar PDF único com um certificado por página

\- Baixar PDF com nome padronizado



\### O que NÃO deve ser implementado agora



\- Verso do certificado (será feito em Word/PDF separado e impresso manualmente)

\- Banco de dados ou persistência de dados

\- Histórico de certificados gerados

\- Modelos salvos de certificado

\- Assinatura digital

\- Upload de imagem de fundo

\- ZIP com certificados individuais

\- Controle por usuário ou permissões



\---



\## Estrutura de Arquivos



```

src/

&#x20; pages/

&#x20;   Certificados.tsx              ← Tela principal



&#x20; components/

&#x20;   certificados/

&#x20;     CertificateForm.tsx         ← Formulário de dados fixos

&#x20;     CertificateUpload.tsx       ← Upload de planilha Excel

&#x20;     CertificatePreview.tsx      ← Prévia visual do certificado

&#x20;     ImportedEmployeesTable.tsx  ← Tabela de funcionários importados



&#x20; lib/

&#x20;   certificados/

&#x20;     parseCertificateSpreadsheet.ts    ← Lê e converte a planilha Excel

&#x20;     validateCertificateEmployees.ts   ← Valida nome, CPF e duplicados

&#x20;     generateCertificatesPdf.ts        ← Gera o PDF final com jsPDF

&#x20;     cpf.ts                            ← Funções auxiliares de CPF

&#x20;     downloadSpreadsheetTemplate.ts    ← Gera e baixa o modelo .xlsx



&#x20; types/

&#x20;   certificados.ts               ← Tipos TypeScript do módulo

```



\---



\## Tipagens



```ts

// src/types/certificados.ts



export interface CertificateConfig {

&#x20; courseName: string;

&#x20; workload: string;

&#x20; courseDate: string;

&#x20; issueDate: string;

&#x20; location: string;

&#x20; companyName: string;

&#x20; responsibleName: string;

&#x20; responsibleRole: string;

&#x20; certificateText: string;

}



export interface CertificateEmployee {

&#x20; id: string;

&#x20; rowNumber: number;

&#x20; name: string;

&#x20; cpf: string;

&#x20; rawCpf: string;

&#x20; isValid: boolean;

&#x20; errors: string\[];

}



export interface SpreadsheetImportResult {

&#x20; employees: CertificateEmployee\[];

&#x20; validCount: number;

&#x20; invalidCount: number;

&#x20; errors: string\[];

}

```



\---



\## Dependências



```bash

npm install xlsx jspdf

```



| Biblioteca | Uso |

|---|---|

| `xlsx` | Leitura da planilha Excel |

| `jspdf` | Geração do PDF com os certificados |



\---



\## Regras de Negócio



\### Dados fixos (iguais para todos os certificados do lote)



\- Nome do curso

\- Carga horária

\- Data do curso

\- Data de emissão

\- Local

\- Empresa

\- Nome do responsável

\- Cargo do responsável

\- Texto base do certificado (editável)



\### Dados variáveis (mudam por funcionário)



Lidos da planilha. Colunas obrigatórias:



| Coluna | Obrigatório |

|---|---|

| Nome | Sim |

| CPF | Sim |



\### Substituição no certificado



Para cada funcionário, substituir no texto:



| Variável | Substituído por |

|---|---|

| `{NOME\_FUNCIONARIO}` | Nome do funcionário |

| `{CPF\_FUNCIONARIO}` | CPF formatado |

| `{NOME\_CURSO}` | Nome do curso |

| `{CARGA\_HORARIA}` | Carga horária |

| `{DATA\_CURSO}` | Data do curso |

| `{LOCAL}` | Local |

| `{EMPRESA}` | Empresa |

| `{NOME\_RESPONSAVEL}` | Nome do responsável |

| `{CARGO\_RESPONSAVEL}` | Cargo do responsável |

| `{DATA\_EMISSAO}` | Data de emissão |



\---



\## Validações Obrigatórias



\### Planilha



\- Arquivo deve ser .xlsx ou .xls

\- Deve conter a coluna Nome (aceitar: Nome, nome, NOME)

\- Deve conter a coluna CPF (aceitar: CPF, cpf, Cpf)

\- Deve ter pelo menos uma linha válida

\- Ignorar linhas completamente vazias



\### Nome do funcionário



\- Não pode estar vazio

\- Mínimo de 3 caracteres

\- Remover espaços duplicados e extras (trim + replace /\\s+/g)



\### CPF do funcionário



\- Não pode estar vazio

\- Remover todos os caracteres não numéricos

\- Deve ter exatamente 11 dígitos

\- Formatar como `000.000.000-00`

\- Detectar duplicados — marcar todas as ocorrências com erro



\### Mensagens de erro padronizadas



```

"Nome obrigatório"

"Nome muito curto (mínimo 3 caracteres)"

"CPF obrigatório"

"CPF inválido (deve ter 11 dígitos)"

"CPF duplicado na planilha"

"A planilha precisa conter as colunas Nome e CPF"

"Nenhum funcionário válido foi encontrado"

```



\---



\## Comportamento da Tela Principal



\### Estados



```ts

const \[config, setConfig] = useState<CertificateConfig>(initialConfig);

const \[employees, setEmployees] = useState<CertificateEmployee\[]>(\[]);

const \[isGenerating, setIsGenerating] = useState(false);

```



\### Valores derivados



```ts

const validEmployees = employees.filter(e => e.isValid);

const invalidEmployees = employees.filter(e => !e.isValid);

const canGenerate = validEmployees.length > 0 \&\& invalidEmployees.length === 0;

const firstValidEmployee = validEmployees\[0] ?? null;

```



\### Regra do botão de gerar



\- \*\*Desabilitado\*\* se `canGenerate === false`

\- \*\*Desabilitado\*\* se `isGenerating === true`

\- \*\*Texto dinâmico\*\*: `"Gerar X certificados"` (X = validEmployees.length)

\- \*\*Exibir alerta\*\* se `invalidEmployees.length > 0`: `"Corrija os erros na planilha antes de gerar os certificados."`



\---



\## Geração do PDF



| Configuração | Valor |

|---|---|

| Formato | A4 |

| Orientação | Paisagem (landscape) |

| Margem | Mínima |

| Páginas | Uma por funcionário válido |

| Arquivo | `certificados\_{nomeDoCurso}\_{dataDeEmissao}.pdf` |



\### Layout de cada página



1\. Título "CERTIFICADO" — centralizado, fonte grande

2\. Texto "Certificamos que" — centralizado

3\. Nome do funcionário — fonte grande, negrito, centralizado

4\. Texto base com variáveis substituídas

5\. Local e data de emissão

6\. Linha de assinatura + nome do funcionário (participante)

7\. Se responsável preenchido: segunda linha de assinatura + nome + cargo



\---



\## Planilha Modelo



Arquivo gerado: `modelo\_importacao\_certificados.xlsx`



Colunas: `Nome | CPF`



Exemplos de linhas:

```

João da Silva     | 123.456.789-00

Maria Oliveira    | 987.654.321-00

Carlos Souza      | 456.789.123-00

```



\---



\## Texto Padrão do Certificado



```

Certificamos que {NOME\_FUNCIONARIO}, portador(a) do CPF {CPF\_FUNCIONARIO}, 

participou do curso de {NOME\_CURSO}, com carga horária de {CARGA\_HORARIA}, 

realizado em {DATA\_CURSO}, abordando os conteúdos previstos no programa de treinamento.

```



O texto deve ser \*\*editável\*\* pelo usuário antes de gerar. Não travar no código.



\---



\## Fluxo do Usuário



```

1\. Preencher dados fixos do certificado

2\. (Opcional) Baixar modelo da planilha

3\. Importar planilha Excel com Nome e CPF

4\. Conferir tabela de funcionários e erros

5\. Visualizar prévia do certificado

6\. Clicar em "Gerar X certificados"

7\. Baixar o PDF gerado

8\. Imprimir e recolher assinaturas

```



\---



\## Ordem de Implementação Recomendada



1\. \*\*Tipos\*\* — `src/types/certificados.ts`

2\. \*\*Funções auxiliares\*\* — `cpf.ts`, `parseCertificateSpreadsheet.ts`, `validateCertificateEmployees.ts`, `generateCertificatesPdf.ts`, `downloadSpreadsheetTemplate.ts`

3\. \*\*Componentes\*\* — Form, Upload, Table, Preview

4\. \*\*Tela principal\*\* — `Certificados.tsx` + rota + menu

5\. \*\*Polimento visual\*\* — somente após validar que o PDF está sendo gerado corretamente



\---



\## Restrições Absolutas



\- \*\*Não criar banco de dados\*\* nesta versão

\- \*\*Não criar histórico\*\* de certificados

\- \*\*Não gerar o verso\*\* do certificado

\- \*\*Não implementar modelos salvos\*\*

\- \*\*Não adicionar autenticação ou controle de usuário\*\*

\- \*\*Não alterar regras de validação\*\* durante melhorias visuais

\- O botão de gerar deve \*\*sempre ficar desabilitado\*\* se houver qualquer funcionário inválido na planilha

