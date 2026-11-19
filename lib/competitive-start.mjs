import {validateQuestionRequest} from './server/questions-policy.mjs';

export const isCompetitiveMode = mode => mode === 'pvp' || mode === 'multiplayer';
export const isCompetitiveRoomId = id => typeof id === 'string' && /^c2[a-f0-9]{28}$/.test(id);

export function competitiveStartRequest(value) {
  const {mode, category, difficulty, count, options, inviteTo} = value;
  if (!isCompetitiveMode(mode) || !validateQuestionRequest(value) ||
      Object.keys(value).some(key => !['mode', 'category', 'difficulty', 'count', 'options', 'inviteTo'].includes(key))) return null;
  if (!options || typeof options !== 'object' || Array.isArray(options) ||
      !['private', 'public'].includes(options.visibility) ||
      Object.keys(options).some(key => !['visibility', 'settings'].includes(key))) return null;
  if (inviteTo !== undefined && (mode !== 'pvp' || typeof inviteTo !== 'string' ||
      !/^[a-zA-Z0-9_-]{5,128}$/.test(inviteTo) || ['__proto__', 'prototype', 'constructor'].includes(inviteTo))) return null;
  if (mode === 'pvp' && options.settings !== undefined) return null;
  if (mode === 'multiplayer') {
    const settings = options.settings;
    if (!settings || typeof settings !== 'object' || Array.isArray(settings) ||
        Object.keys(settings).some(key => !['winCondition', 'targetScore', 'timeLimit', 'penalties'].includes(key)) ||
        !['first_to_n', 'time_limit'].includes(settings.winCondition) ||
        !Number.isInteger(settings.targetScore) || settings.targetScore < 1 || settings.targetScore > 20 ||
        !Number.isInteger(settings.timeLimit) || settings.timeLimit < 30 || settings.timeLimit > 300 ||
        typeof settings.penalties !== 'boolean') return null;
  }
  return {mode, category, difficulty, count, options, ...(inviteTo === undefined ? {} : {inviteTo})};
}

// Translate the saved-start protocol into the competitive prepare/create APIs.
// The server binds all gameplay options to preparation. The invitation is a
// separate deliberate social action addressed to the recipient saved locally.
export async function sendCompetitiveStart(api, uid, {action, operationId, request}, preparedId) {
  const {mode, category, difficulty, count, options} = request;
  if (action === 'activate') {
    if (!isCompetitiveRoomId(preparedId)) throw Error('Invalid saved lobby.');
    return api('games', {action: 'create', mode, questionSetId: preparedId, options: {category, difficulty, ...options}}, uid);
  }
  const cancel = action === 'cancel';
  if (!cancel && action !== 'prepare') throw Error('Unknown start action.');
  const result = await api('questions', {mode, category, difficulty, count, operationId, roomOptions: options, ...(cancel ? {operation: 'cancel'} : {})}, uid);
  if (!cancel) return {...result, status: 'PREPARED'};
  if (result.status === 'cancelled') return {questionSetId: result.questionSetId, questionCount: count, status: 'CANCELLED'};
  if (['waiting', 'active', 'finished'].includes(result.status)) return {questionSetId: result.questionSetId, questionCount: count, status: 'ISSUED'};
  throw Error('Unknown saved lobby state.');
}
