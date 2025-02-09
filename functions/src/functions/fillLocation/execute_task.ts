import * as functions from "firebase-functions";
import { z } from "zod";
import { onTaskDispatched } from "firebase-functions/tasks";
import { fillTaskLocation } from "./flow";
import { FillLocationSchema } from "./input";
import { errorMessage } from "../../utils/error/message";
import { FillTODOLocationSchema } from "../fillTODOLocation/input";
import { fillTODOLocation } from "../fillTODOLocation/flow";

export const executeFillTaskLocation = onTaskDispatched(
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
    console.log("#executeFillTaskLocation");
    try {
      const input = req.data as z.infer<typeof FillLocationSchema>;
      const fillTaskLocationResponse = await fillTaskLocation(input);
      console.log({ fillTaskLocationResponse });
    } catch (err) {
      functions.logger.error(errorMessage(err));
    }
  }
);

export const executeFillTODOLocation = onTaskDispatched(
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
    console.log("#executeFillTODOLocation");
    try {
      const input = req.data as z.infer<typeof FillTODOLocationSchema>;
      const fillTODOLocationResponse = await fillTODOLocation(input);
      console.log({ fillTODOLocationResponse });
    } catch (err) {
      functions.logger.error(errorMessage(err));
    }
  }
);
