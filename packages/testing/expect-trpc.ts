/**
 * Asserts a tRPC call rejects with a specific error code.
 *
 * Do not use `expect(...).rejects.toThrow(/FORBIDDEN/)` for this: toThrow
 * matches the error *message*, and TRPCError messages are human text like
 * "Water meter does not belong to user community". A guard that works would
 * look like a failure, and worse, a guard that throws the wrong code would
 * look like a pass whenever the message happened to contain the word.
 *
 * This also fails when the promise resolves, which is what makes the
 * see-it-fail-first step meaningful.
 */
export async function expectTrpcCode(promise: Promise<unknown>, code: string): Promise<void> {
  try {
    await promise
  } catch (error) {
    const actual = (error as { code?: string }).code
    if (actual !== code) {
      throw new Error(
        `Expected tRPC code ${code}, got ${actual ?? '<none>'}: ${(error as Error).message}`
      )
    }
    return
  }
  throw new Error(`Expected the call to reject with tRPC code ${code}, but it resolved`)
}

export async function expectForbidden(promise: Promise<unknown>): Promise<void> {
  return expectTrpcCode(promise, 'FORBIDDEN')
}
