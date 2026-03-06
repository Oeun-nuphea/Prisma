import express from "express";
import {Application, Request, Response } from "express";


const app: Application = express();

const PORT = 4000



app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Primsa Operactions' })
});

app.listen(PORT, () => {
  console.log(`Server is Fire at http://localhost:${PORT}`);
});