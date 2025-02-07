import { z } from "genkit";
import { genkitAI, googleSearchGroundingData } from "../../utils/ai/ai";
import { TODOSchema } from "../../entity/todo";
import { database } from "../../utils/firebase/firebase";
import {
  DataResponseSchema,
  errorResponse,
  ErrorResponseSchema,
} from "../../entity/response";
import { Timestamp } from "firebase-admin/firestore";
import { TODOPrepareSchema } from "./input";
import { GroundingDataSchema } from "../../entity/grounding";
import { zodTypeGuard } from "../../utils/stdlib/type_guard";

const todoWithGrounding = genkitAI.defineTool(
  {
    name: "todoWithGrounding",
    description: "todoWithGrounding",
    inputSchema: z.object({
      question: z.string(),
      content: z.string(),
      supplement: z.string().optional(),
    }),
    outputSchema: z.object({
      aiTextResponse: z.string(),
      groundings: z.array(GroundingDataSchema),
    }),
  },
  async (input) => {
    console.log(`#todoWithGrounding: ${JSON.stringify(input, null, 2)}`);
    const { question, content, supplement } = input;

    if (!supplement) {
      const { aiTextResponse, groundings } = await googleSearchGroundingData(
        `「${question}」に関する 「${content}」 に関して詳細に説明してください。出力はmarkdown形式にしてください`
      );

      return {
        aiTextResponse,
        groundings,
      };
    } else {
      const { aiTextResponse, groundings } = await googleSearchGroundingData(
        `「${question}」に関する 「${content}。${supplement}」 に関して詳細に説明してください。出力はmarkdown形式にしてください`
      );

      return {
        aiTextResponse,
        groundings,
      };
    }
  }
);

export const ResponseSchema = z.union([
  DataResponseSchema.extend({
    data: z.object({
      todo: TODOSchema,
    }),
  }),
  ErrorResponseSchema,
]);

// このflowはCloud Taskから使用されるのでエラーハンドリングは慎重に
export const todoPrepare = genkitAI.defineFlow(
  {
    name: "todoPrepare",
    inputSchema: TODOPrepareSchema,
    outputSchema: ResponseSchema,
  },
  async (input) => {
    console.log(`#todoPrepare: ${JSON.stringify({ input }, null, 2)}`);
    try {
      const {
        taskID,
        todoID,
        question,
        content,
        supplement,
        userRequest: { userID },
      } = input;

      const todoDocRef = database
        .collection(`/users/${userID}/tasks/${taskID}/todos`)
        .doc(todoID);
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
