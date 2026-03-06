# Express + Prisma (SQLite)

## Run project

```bash
npm install
npm run prisma:migrate -- --name init
npm run dev
```

## Create new migration after schema changes

```bash
npx prisma validate
npx prisma migrate dev --name your_change_name
npx prisma generate
```

## Open Prisma Studio

```bash
npx prisma studio
```

## Notes

- Prisma config uses SQLite at `file:./prisma/dev.db` via `prisma.config.ts`.
- In Prisma 7, datasource URL belongs in `prisma.config.ts`, not `schema.prisma`.
