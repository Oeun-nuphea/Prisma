import express from "express";
import {Application, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


const app: Application = express();

const PORT = 4000



app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Primsa Operactions' })
});

app.post('/create', (req: Request, res: Response) => {
    const {name, email} = req.body;

    const user = prisma.user.create({
        data:{
            name,
            email
        }
    })
})

app.listen(PORT, () => {
  console.log(`Server is Fire at http://localhost:${PORT}`);
});