const app = require('./api/index');
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`[ESTÉTICA Backend] Server successfully running at http://localhost:${port}`);
});
