export function getErrorMessage(error, fallback = 'Something went wrong') {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    error?.payload?.message ||
    error?.payload;

  if (Array.isArray(message)) return message.join(', ');
  return message || fallback;
}

export function handleThunkError(error) {
  const message = getErrorMessage(error);
  return { message, status: error?.response?.status, payload: error?.response?.data };
}
