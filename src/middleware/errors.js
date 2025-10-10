function error(message, code) {
  const e = new Error(message);

  if (code) {
    e.status = code;
  }

  return e;
}

export default error;
