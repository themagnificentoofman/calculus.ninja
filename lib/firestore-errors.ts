export enum OperationType {
  CREATE = 'create', UPDATE = 'update', DELETE = 'delete', LIST = 'list', GET = 'get', WRITE = 'write',
}
// Keep account identities and diagnostic JSON out of user-facing error messages.
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const message = error instanceof Error ? error.message : 'The operation could not be completed. Please retry.';
  console.error('Data operation failed', { operationType, path, message });
  throw new Error(message);
}

// Profile validation is useful to the player; SDK diagnostics and arbitrary
// transport bodies are not. The server save and account update can complete
// separately, so an unknown failure must not promise that nothing was saved.
export function profileSaveMessage(error:unknown):string {
  const messages=new Set(['Only profile preferences can be changed.','Invalid settings.','Invalid profile field.','Handles must use 3–32 letters, numbers or underscores.','Invalid player color.','Invalid profile image.','Enter a display name.','Please sign in.']);
  if(error instanceof Error&&messages.has(error.message))return error.message;
  const code=error&&typeof error==='object'&&'code' in error?error.code:'';
  if(code==='auth/requires-recent-login'||code==='auth/user-token-expired')return 'Please sign out and sign in again, then check your settings.';
  return 'Your settings could not be fully saved. Refresh and check your changes before trying again.';
}
