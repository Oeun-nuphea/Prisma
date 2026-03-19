# Express + Prisma (PostgreSQL)

## Run with Docker Compose

```bash
docker compose up --build
```

App URL: `http://localhost:4000`

## Run locally (without Docker)

1. Start PostgreSQL (for example with Docker):

```bash
docker compose up -d db
```

2. Set your local `DATABASE_URL` in `.env` to use localhost:

```env
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/mydb?schema=public"
```

3. Run app and migrations:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev
```

## Create migration after schema changes

```bash
npx prisma validate
npx prisma migrate dev --name your_change_name
npx prisma generate
```

## Open Prisma Studio

```bash
npx prisma studio
```
docker compose exec db psql -U note -d note_db


# new migration
npm run prisma:migrate
npx prisma generate


# seed admin
npm run prisma:seed


# prevent prisma reapply
prisma migrate resolve --applied