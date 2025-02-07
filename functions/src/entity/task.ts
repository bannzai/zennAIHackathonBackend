import { z } from "zod";
import { GroundingDataSchema } from "./grounding";
import {
  FirestoreTimestampSchema,
  ServerTimestampSchema,
} from "./util/timestamp";
import { nullableSchema } from "../utils/stdlib/nullable";

export const TaskPreparedSchema = z
  .object({
    status: z.literal("prepared"),
    id: z.string(),
    userID: z.string(),
    // 質問の内容
    question: z.string(),
    // TODOの質問の内容の回答をAIに渡して、AIが回答した内容
    todosAITextResponseMarkdown: z.string(),
    // TODOのAIの回答のソースとなったもの
    todosGroundings: z.array(GroundingDataSchema),
    // 質問の内容を短く回答したもの
    shortAnswer: z.string(),
    // 質問の内容の対象となるトピック。例) question: 「確定申告の方法」だと「確定申告」
    topic: z.string(),
    // 質問の内容の対象となるトピックについての解説
    definitionAITextResponse: z.string(),
    // TODOのAIの回答のソースとなったもの
    definitionGroundings: z.array(GroundingDataSchema),
    completed: z.boolean(),

    preparedDateTime: FirestoreTimestampSchema,
  })
  .merge(ServerTimestampSchema);

export const TaskPreparingSchema = nullableSchema(TaskPreparedSchema.partial())
  .required({
    id: true,
    userID: true,
    question: true,
  })
  .omit({
    preparedDateTime: true,
    completed: true,
  })
  .merge(
    z.object({
      status: z.literal("preparing"),
    })
  );
export const TaskSchema = z.union([TaskPreparedSchema, TaskPreparingSchema]);

export type Task = z.infer<typeof TaskSchema>;
export type TaskPrepared = z.infer<typeof TaskPreparedSchema>;
export type TaskPreparing = z.infer<typeof TaskPreparingSchema>;
