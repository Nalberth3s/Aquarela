# Aquarela do Saber — Sistema

Site institucional + Portal da Família + Painel de Gestão do **Centro Educacional Aquarela do Saber**
(Senador Canedo - GO).

- **Front-end:** React 19 · TypeScript · Vite · Tailwind CSS 4 · React Router 7 · Lucide
- **API:** Node 24 · TypeScript · Fastify · zod · JWT (bcrypt) — pasta `server/`
- **Banco:** PostgreSQL 16 (migrations em `server/db/migrations`, aplicadas ao subir a API)

## Rodando no seu PC (Docker)

```bash
docker compose up -d --build     # sobe tudo
docker compose logs -f api       # acompanha a API
docker compose down              # desliga (os dados continuam salvos)
docker compose down -v           # desliga e APAGA o banco (volta ao primeiro acesso)
```

| Serviço | Endereço |
|---------|----------|
| Site | http://localhost:5173 |
| API | http://localhost:3333/api/health |
| Adminer (ver o banco) | http://localhost:8080 — Sistema **PostgreSQL**, Servidor **db**, usuário/senha/base **aquarela** |
| PostgreSQL direto | `localhost:55432` (usuário/senha/base `aquarela`) |

Alterações no front (`src/`) aparecem na hora. Alterações na API (`server/src/`): `docker compose restart api`.

## Primeiro acesso

1. Abra http://localhost:5173/entrar — com o banco vazio, o sistema leva para **Primeiro acesso**.
2. Crie a conta da **coordenação** (nome, e-mail e senha).
3. Siga o card **Primeiros passos** no painel:
   1. *Equipe e acessos* → **Nova conta** para cada professora (gera senha provisória);
   2. *Turmas* → **Nova turma** e escolha a professora regente;
   3. *Alunos* → **Nova criança** (responsáveis, autorizados, saúde);
   4. Na ficha da criança → **Dar acesso ao Portal** para cada responsável com e-mail.
4. Professoras e famílias entram com a senha provisória e criam uma senha pessoal no primeiro login.

Só os **textos do site** (dados da escola, segmentos, atividades, rotina, FAQ e galeria de fotos reais) vêm
carregados no primeiro boot (`server/src/seed/content.json`). Calendário, equipe do site, turmas, crianças e
contas começam vazios.

## Interessados (mensagens do site)

O formulário **Contato → Envie uma mensagem** salva a mensagem e abre o WhatsApp configurado em
`school_settings.info.contactFormWhatsapp` (hoje **(62) 99535-8008**) com o texto pronto.

Cada pessoa que escreve ou faz pré-matrícula ganha um **perfil de interessado** (tabela `leads`), reconhecido pelo
e-mail ou telefone — várias mensagens da mesma pessoa ficam juntas. Em **Área interna → Interessados** a coordenação
vê as pessoas e a caixa de entrada, abre o mini perfil (dados, histórico, anotações) e muda a situação:
novo → em contato → visita agendada → matriculado (ou arquivado).

## Funcionárias

Ao criar a conta de uma professora (ou da coordenação) em **Equipe e acessos → Nova conta**, informe telefone e CPF.
O botão **Enviar para (62) …** abre o WhatsApp direto no número dela com o login e a senha provisória. O CPF também
serve para entrar no lugar do e-mail.

Em **Funcionárias** fica a ficha de cada uma: dados pessoais (nascimento, admissão, endereço, contato de emergência),
turmas, crianças, diários e chamadas dos últimos 30 dias, último acesso e anotações da coordenação.

## Google (SEO)

- Título/descrição por página, prévia de compartilhamento (`public/og-image.jpg`) e dados estruturados de escola (`index.html`).
- `/sitemap.xml` e `/robots.txt` gerados automaticamente; área interna e login ficam fora da busca.
- **Ao publicar:** defina `SITE_URL=https://seu-dominio` (Docker) ou `VITE_SITE_URL` (build) e envie o sitemap no Google Search Console.

## Perfis

| Perfil | Pode |
|--------|------|
| Coordenação | tudo: contas, turmas, crianças, calendário do site, equipe do site, pré-matrículas |
| Professora | só as próprias turmas: diário, chamada, relatórios, comunicados da turma, recados |
| Família | só as crianças vinculadas: diário (sem notas internas), relatórios publicados, comunicados, recados |

As permissões são aplicadas pela API (`server/src/lib/access.ts`), não só pela interface.

## Estrutura

```
docs/design/stitch/   referência visual (Google Stitch · "Aquarela Poética")
server/
  db/migrations/      tabelas (SQL)
  src/routes/         endpoints da API por domínio
  src/lib/            banco, autenticação, permissões, migrations
  src/seed/           conteúdo inicial do site
src/
  components/ pages/ hooks/ contexts/ routes/ utils/ types/
  services/           contratos + implementação HTTP (*.http.ts) e demonstração (*.mock.ts)
public/media/         fotos e vídeos reais usados no site
```

## Modo demonstração (sem servidor)

`VITE_USE_MOCKS=true npm run dev` roda só o front com dados fictícios no navegador
(logins de teste na tela de entrada, senha `aquarela`). Recursos de cadastro exigem o servidor.
