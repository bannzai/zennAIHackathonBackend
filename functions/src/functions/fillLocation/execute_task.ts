import * as functions from "firebase-functions";
import { z } from "zod";
import { onTaskDispatched } from "firebase-functions/tasks";
import { fillLocation } from "./flow";
import { FillLocationSchema } from "./input";
import { errorMessage } from "../../utils/error/message";

export const executeFillLocation = onTaskDispatched(
  {
    retryConfig: {
      maxAttempts: 3,
      minBackoffSeconds: 60,
    },
    rateLimits: {
      maxConcurrentDispatches: 3,
    },
    timeoutSeconds: 10 * 60,
    memory: "1GiB",
  },
  async (req) => {
    console.log("#executeFillLocation");
    try {
      const input = req.data as z.infer<typeof FillLocationSchema>;
      const response = await fillLocation(input);
      console.log(response);
    } catch (err) {
      functions.logger.error(errorMessage(err));
    }
  }
);
