import { z } from "zod";
import { GroundingDataSchema } from "./grounding";
import {
  FirestoreTimestampSchema,
  ServerTimestampSchema,
} from "./util/timestamp";

export const TaskFullFilledSchema = z
  .object({
    status: z.literal("fulfilled"),
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
    completed: z.boolean().default(false),

    fullFilledDateTime: FirestoreTimestampSchema,
  })
  .merge(ServerTimestampSchema);

export const TaskLoadingSchema = TaskFullFilledSchema.partial()
  .required({
    id: true,
    userID: true,
    question: true,
    serverCreatedDateTime: true,
    serverUpdatedDateTime: true,
  })
  .omit({
    fullFilledDateTime: true,
    completed: true,
  })
  .merge(
    z.object({
      status: z.literal("loading"),
    })
  );
export const TaskSchema = z.union([TaskFullFilledSchema, TaskLoadingSchema]);

export type Task = z.infer<typeof TaskSchema>;
export type TaskFullFilled = z.infer<typeof TaskFullFilledSchema>;
export type TaskLoading = z.infer<typeof TaskLoadingSchema>;
