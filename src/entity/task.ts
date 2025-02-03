import { z } from "zod";
import { GroundingDataSchema } from "./grounding";

export const TaskSchema = z.object({
  id: z.string(),
  userID: z.string(),
  // 質問の内容
  question: z.string(),
  // 質問の内容の回答をAIに渡して、AIが回答した内容
  aiTextResponse: z.string(),
  // 質問の内容の回答を要約したもの
  summary: z.string(),
  // 質問の内容の対象となるトピック。例) question: 「確定申告の方法」だと「確定申告」
  topic: z.string(),
  // 質問の内容の対象となるトピックについての解説
  definition: z.string(),
  // AIの回答のソースとなったもの
  groundings: z.array(GroundingDataSchema),
  completed: z.boolean().default(false),
});

export type Task = z.infer<typeof TaskSchema>;
