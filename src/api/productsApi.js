export const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 800) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Server responded with HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }

    if (retries > 0) {
      console.warn(`[Network Retry] Retrying in ${backoff}ms... Attempts left: ${retries}`);
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }

    throw error;
  }
};