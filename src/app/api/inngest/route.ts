import { serve } from "inngest/next"
import { inngest } from "@/lib/inngest"
import {
  expireReservationsFunction,
  regenerateCompositeFunction,
  checkPriceTierFunction,
} from "@/lib/inngest-functions"

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    expireReservationsFunction,
    regenerateCompositeFunction,
    checkPriceTierFunction,
  ],
})
