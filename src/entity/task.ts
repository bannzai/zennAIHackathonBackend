import { z } from "zod";
import { GroundingDataSchema } from "./grounding";

export const TaskSchema = z.object({
  id: z.string(),
  userID: z.string(),
  // 質問の内容
  question: z.string(),
  // TODOの質問の内容の回答をAIに渡して、AIが回答した内容
  todoAITextResponse: z.string(),
  // TODOのAIの回答のソースとなったもの
  todoGroundings: z.array(GroundingDataSchema),
  // 質問の内容を短く回答したもの
  shortAnswer: z.string(),
  // 質問の内容の対象となるトピック。例) question: 「確定申告の方法」だと「確定申告」
  topic: z.string(),
  // 質問の内容の対象となるトピックについての解説
  definition: z.string(),
  completed: z.boolean().default(false),
});

export type Task = z.infer<typeof TaskSchema>;
