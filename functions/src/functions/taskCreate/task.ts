import { z } from "zod";
import { onTaskDispatched } from "firebase-functions/tasks";
import { taskCreate } from "./flow";
import { TaskCreateSchema } from "./input";
import { UserRequestSchema } from "../../entity/userRequest";

export const executeTaskCreate = onTaskDispatched(
  {
    retryConfig: {
      maxAttempts: 5,
      minBackoffSeconds: 60,
    },
    rateLimits: {
      maxConcurrentDispatches: 6,
    },
  },
  async (req) => {
    console.log("#executeTaskCreate");
    const task = req.data as z.infer<typeof TaskCreateSchema>;
    const result = await taskCreate(task);
    // TODO: Change state `Task` to `Done`;
    return;
  }
);
