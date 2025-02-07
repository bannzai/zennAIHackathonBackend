import * as functions from "firebase-functions";
import { z } from "zod";
import { onTaskDispatched } from "firebase-functions/tasks";
import { TODOPrepareSchema } from "./input";
import { errorMessage } from "../../utils/error/message";
import { todoPrepare } from "./flow";

export const executeTODOPrepare = onTaskDispatched(
  {
    retryConfig: {
      maxAttempts: 10,
      minBackoffSeconds: 60,
    },
    rateLimits: {
      maxConcurrentDispatches: 3,
    },
    timeoutSeconds: 10 * 60,
    memory: "1GiB",
  },
  async (req) => {
    console.log("#executeTODOPrepare");
    try {
      const todoInput = req.data as z.infer<typeof TODOPrepareSchema>;
      const response = await todoPrepare(todoInput);
      console.log(response);
    } catch (err) {
      functions.logger.error(errorMessage(err));
    }
  }
);
