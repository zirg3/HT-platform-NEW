import PocketBase from "pocketbase"
import { getPocketBaseEnv } from "@/lib/pocketbase/env"

let client: PocketBase | null = null

export const getPocketBase = (): PocketBase => {
  const env = getPocketBaseEnv()
  if (!env.ok) {
    throw new Error(env.message)
  }

  if (!client) {
    client = new PocketBase(env.url)
    client.autoCancellation(false)
  }

  return client
}

export const resetPocketBaseClient = () => {
  client = null
}
