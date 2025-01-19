import express, { Application, Request, Response, NextFunction } from "express";
import admin from 'firebase-admin';
import { authMiddleware } from './middleware/authMiddleware';
import { AIRequestSchema } from './entity/types';
import { TaskSchema } from './entity/types';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// エラーハンドリングミドルウェア
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

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

// AI処理エンドポイント
app.post('/ai/process', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { input } = req.body;
    const userId = (req as any).user.uid;

    // AI処理のモック実装
    const response = `AI response for: ${input}`;

    // Firestoreに保存
    const aiRequest = {
      id: admin.firestore().collection('AIRequests').doc().id,
      userId,
      request: input,
      response,
      createdAt: new Date().toISOString()
    };

    await admin.firestore().collection('AIRequests').doc(aiRequest.id).set(aiRequest);

    res.status(200).json({ response });
  } catch (error) {
    next(error);
  }
});

// AIリクエスト履歴取得エンドポイント
app.get('/ai-requests', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.uid;
    const snapshot = await admin.firestore()
      .collection('AIRequests')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const requests = snapshot.docs.map(doc => doc.data());
    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
});

// タスク管理エンドポイント
app.get('/tasks', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.uid;
    const snapshot = await admin.firestore()
      .collection('Tasks')
      .where('userId', '==', userId)
      .get();

    const tasks = snapshot.docs.map(doc => doc.data());
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
});

app.post('/tasks', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.uid;
    const taskData = TaskSchema.parse(req.body);
    
    const task = {
      ...taskData,
      id: admin.firestore().collection('Tasks').doc().id,
      userId,
      completed: false
    };

    await admin.firestore().collection('Tasks').doc(task.id).set(task);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

// タスク更新エンドポイント
app.put('/tasks/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.uid;
    const taskId = req.params.id;
    const taskData = TaskSchema.partial().parse(req.body);

    const taskRef = admin.firestore().collection('Tasks').doc(taskId);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists || taskDoc.data()?.userId !== userId) {
      res.status(404).json({ message: 'タスクが見つかりません' });
      return;
    }

    await taskRef.update(taskData);
    const updatedTask = { ...taskDoc.data(), ...taskData };
    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
});

// タスク削除エンドポイント
app.delete('/tasks/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.uid;
    const taskId = req.params.id;

    const taskRef = admin.firestore().collection('Tasks').doc(taskId);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists || taskDoc.data()?.userId !== userId) {
      res.status(404).json({ message: 'タスクが見つかりません' });
      return;
    }

    await taskRef.delete();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

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