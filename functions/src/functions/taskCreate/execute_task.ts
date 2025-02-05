import { z } from "zod";
import { onTaskDispatched } from "firebase-functions/tasks";
import { taskCreate } from "./flow";
import { TaskCreateSchema } from "./input";
import { error } from "firebase-functions/logger";
import { errorMessage } from "../../utils/error/message";

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
    try {
      const task = req.data as z.infer<typeof TaskCreateSchema>;
      const response = await taskCreate(task);
      console.log(response);
      // TODO: Change state `Task` to `Done`;
      return;
    } catch (err) {
      console.error(errorMessage(err));
      return;
    }
  }
);
