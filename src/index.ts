import { genkitAI } from "./utils/ai/ai";

export const taskCreate = require("./flows/taskCreate/flow");

genkitAI.startFlowServer({ flows: [taskCreate] });
