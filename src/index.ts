import express, { Application, Request, Response } from "express";
import admin from 'firebase-admin';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req: Request, res: Response) => {
  res.status(200).send({
    message: "Hello World!",
  });
});

// Firebase Admin SDKの初期化
const serviceAccountKeyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
if (!serviceAccountKeyPath) {
  console.error("環境変数 FIREBASE_SERVICE_ACCOUNT_KEY_PATH が設定されていません。");
  process.exit(1);
}

const serviceAccount = require(serviceAccountKeyPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
console.log("Firebase Admin SDK initialized.");

const port = process.env.PORT || 8000;
try {
  app.listen(port, () => {
    console.log(`Running at Port ${port}...`);
  });
} catch (e) {
  if (e instanceof Error) {
    console.error(e.message);
  }
}