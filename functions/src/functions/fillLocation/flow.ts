import { genkit, z } from "genkit";
import { genkitAI, googleSearchGroundingData } from "../../utils/ai/ai";
import { TODOSchema } from "../../entity/todo";
import { database } from "../../utils/firebase/firebase";
import {
  DataResponseSchema,
  errorResponse,
  ErrorResponseSchema,
} from "../../entity/response";
import { Timestamp } from "firebase-admin/firestore";
import { GroundingDataSchema } from "../../entity/grounding";
import { zodTypeGuard } from "../../utils/stdlib/type_guard";
import { TODOPrepareSchema } from "../todoPrepare/input";
import { FillLocationSchema } from "./input";
import { nonNullable, nullable } from "../../utils/stdlib/nullable";
import { TaskPreparedSchema, TaskSchema } from "../../entity/task";

export const ResponseSchema = z.union([
  DataResponseSchema.extend({
    data: z.object({
      todo: TODOSchema,
    }),
  }),
  ErrorResponseSchema,
]);

const TODOLocationSchema = z.object({
  aiTextResponse: z.string(),
  groundings: z.array(GroundingDataSchema),
  locationName: z.string().nullish(),
  address: z.string().nullish(),
  email: z.string().nullish(),
  tel: z.string().nullish(),
});

const todoLocation = genkitAI.defineTool(
  {
    name: "todoLocation",
    description: "todoLocation",
    inputSchema: z.object({
      todo: TODOSchema,
      taskQuestion: z.string(),
      userLocation: z.object({
        name: z.string(),
        latitude: z.number(),
        longitude: z.number(),
      }),
    }),
    outputSchema: TODOLocationSchema,
  },
  async (input) => {
    const { todo, taskQuestion, userLocation } = input;

    const { aiTextResponse, groundings } = await googleSearchGroundingData(
      `
        ${userLocation.name}」に居住している人が、 「${taskQuestion}」に関する 「${todo.content}。${todo.supplement ?? ""}」 に対応してくれる場所を出力してください。
        出力はmarkdown形式にしてください
        以下の情報を取得してください
        - 場所の名前
        - 場所の住所
        - 場所のEmail
        - 場所の電話番号
        `
    );

    const todoLocationRAGSchema = TODOLocationSchema.omit({
      aiTextResponse: true,
      groundings: true,
    });
    const todoLocationRAGResponse = await genkitAI.generate({
      prompt: `
      次のマークダウンからスキーマに定義されている情報を抜き出してください
      ${aiTextResponse}
      `,
      output: {
        schema: todoLocationRAGSchema,
      },
    });

    const response: z.infer<typeof TODOLocationSchema> = {
      ...todoLocationRAGResponse,
      aiTextResponse,
      groundings,
    };
    return response;
  }
);

// このflowはCloud Taskから使用されるのでエラーハンドリングは慎重に
export const fillLocation = genkitAI.defineFlow(
  {
    name: "fillLocation",
    inputSchema: FillLocationSchema,
    outputSchema: ResponseSchema,
  },
  async (input) => {
    console.log(`#fillLocation: ${JSON.stringify({ input }, null, 2)}`);
    try {
      const {
        taskID,
        userLocation,
        userRequest: { userID },
      } = input;

      const taskDocRef = database
        .collection(`/users/${userID}/tasks`)
        .doc(taskID);
      const taskSnapshot = await taskDocRef.get();
      const task = taskSnapshot.data();
      if (!zodTypeGuard(TaskPreparedSchema, task)) {
        return errorResponse(
          new Error(`task loading parse error. taskLoading: ${task}`)
        );
      }

      const todosCollectionRef = database.collection(
        `/users/${userID}/tasks/${taskID}/todos`
      );
      const todoDocRefs = await todosCollectionRef.listDocuments();
      const todoPromises = await Promise.allSettled(
        todoDocRefs.map(async (todoDocRef) => {
          const todoSnapshot = await todoDocRef.get();
          const todo = todoSnapshot.data();
          if (!zodTypeGuard(TODOSchema, todo)) {
            // 変換できなかったものに関してはスルーする。位置情報等が埋まらないだけ
            return null;
          }
          return todo;
        })
      );
      const todos = todoPromises
        .map((todoPromise) =>
          todoPromise.status === "fulfilled" ? todoPromise.value : null
        )
        .filter(nonNullable);

      for (const todo of todos) {
        const {
          aiTextResponse,
          groundings,
          locationName,
          address,
          email,
          tel,
        } = await todoLocation({
          todo,
          taskQuestion: task.question,
          userLocation,
        });
      }

      const todoSnapshot = await todoDocRef.get();
      const todo = todoSnapshot.data();
      if (!zodTypeGuard(TODOSchema, todo)) {
        return errorResponse(
          new Error(`todo loading parse error. todoLoading: ${todo}`)
        );
      }
      if (todo.groundings != null && todo.aiTextResponseMarkdown != null) {
        const response: z.infer<typeof ResponseSchema> = {
          result: "OK",
          statusCode: 200,
          data: { todo },
        };
        return response;
      }

      const { aiTextResponse, groundings } = await todoWithGrounding({
        question,
        content,
        supplement,
      });
      const updatedTodo: z.infer<typeof TODOSchema> = {
        ...todo,
        aiTextResponseMarkdown: aiTextResponse,
        groundings,
        serverUpdatedDateTime: Timestamp.now(),
      };

      await todoDocRef.set(updatedTodo, { merge: true });

      const response: z.infer<typeof ResponseSchema> = {
        result: "OK",
        statusCode: 200,
        data: {
          todo: updatedTodo,
        },
      };

      return response;
    } catch (error) {
      return errorResponse(error);
    }
  }
);
