// Includes saved short room IDs and full account/operation digests.
export const isSavedRoundId = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{5,128}$/.test(value) &&
  !['__proto__','constructor','prototype'].includes(value);

export function roundIdFromSearch(search) {
  const id = new URLSearchParams(search).get('round');
  return isSavedRoundId(id) ? id : null;
}

export function competitiveSignInReturn(next) {
  if (typeof next !== 'string' || next.length > 1024) return null;
  const route = /^(\/play\/(pvp|multiplayer))(\/lobbies)?(?:\?([^#]*))?$/.exec(next);
  if (!route) return null;
  const [,path,mode,catalog,search] = route;
  if (catalog) return path+catalog;
  const operations = [...new URLSearchParams(search)].filter(([key])=>['round','join','host','invite'].includes(key));
  if (operations.length !== 1) return path;
  const [key,value] = operations[0];
  const valid = key === 'host' ? value === 'public'
    : key === 'join' ? /^[a-zA-Z0-9]{5,30}$/.test(value) && isSavedRoundId(value)
    : (key === 'round' || mode === 'pvp') && isSavedRoundId(value);
  return valid ? path+'?'+new URLSearchParams([[key,value]]) : path;
}
