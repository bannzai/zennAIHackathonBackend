/* eslint-disable @typescript-eslint/no-var-requires */

import { initializeApp } from "firebase-admin/app";

initializeApp({
  serviceAccountId:
    process.env.GOOGLE_APPLICATION_CREDENTIALS_SERVICE_ACCOUNT_ID,
});

export const enqueueTaskCreate =
  require("./functions/taskCreate/enqueue_task").enqueueTaskCreate;
export const executeTaskCreate =
  require("./functions/taskCreate/execute_task").executeTaskCreate;

export const enqueueTODOPrepare =
  require("./functions/todoPrepare/enqueue_task").enqueueTODOPrepare;
export const executeTODOPrepare =
  require("./functions/todoPrepare/execute_task").executeTODOPrepare;

export const fillTODOLocation =
  require("./functions/fillTODOLocation/enqueue_task").fillTODOLocation;
