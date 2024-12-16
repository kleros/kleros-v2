export async function refetchWithRetry<T>(fn: () => Promise<T>, retryCount = 5, retryDelay = 2000) {
  let attempts = 0;

  while (attempts < retryCount) {
    try {
      const returnData = await fn();

      //@ts-expect-error data does exist
      if (returnData && returnData?.data !== undefined) {
        return returnData;
      }
    } catch (error) {
      console.error(`Attempt ${attempts + 1} failed with error:`, error);
    }

    attempts++;

    if (attempts >= retryCount) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, retryDelay));
  }
  return;
}
