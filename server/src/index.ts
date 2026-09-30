import { app } from "./app.js";

const port = Number(process.env.PORT ?? 8093);
app.listen(port, () => {
  console.log(`API SERVER STARTED on http://localhost:${port}`);
});
