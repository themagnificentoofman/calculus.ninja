// Shared with the API without loading private catalog/selection registries.
export class JointSelectionError extends Error {
  constructor(code) {
    if (!['joint-catalog-changed', 'joint-insufficient-capacity'].includes(code)) throw new TypeError('Unknown joint selection error');
    super(code === 'joint-catalog-changed'
      ? 'The available problems changed while this round was being prepared. Please retry.'
      : 'There are too few different problems for this question mix. Try another mix.');
    this.name = 'JointSelectionError';
    this.code = code;
    this.status = 409;
  }
}
