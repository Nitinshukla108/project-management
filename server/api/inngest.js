import { serve } from "inngest/next";
import { inngest, functions } from "../server/inngest/index.js";

export default serve({
  client: inngest,
  functions,
});