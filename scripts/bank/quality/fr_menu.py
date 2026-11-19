"""Verify exact source-bound, choice-visible reviews of free-response conversions."""
import gzip
import hashlib
import itertools
import json
import os
from fractions import Fraction
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parent
VERSION = 'reviewed-fr-menus-v1'


def digest(value):
    data = json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False)
    return hashlib.sha256(data.encode()).hexdigest()


def displayed(fraction):
    if fraction.denominator == 1:
        return str(fraction.numerator)
    sign = '-' if fraction < 0 else ''
    return sign + r'\frac{' + str(abs(fraction.numerator)) + '}{' + str(fraction.denominator) + '}'


@lru_cache(maxsize=1)
def reviewed_records():
    manifest = json.loads((ROOT / 'fr-menu-bindings.json').read_bytes())
    private_file = os.environ.get('CALCULUS_MC_MENU_EVIDENCE')
    if manifest.get('presentation') and not private_file:
        raise ValueError('Private reviewed source is required for menu admission')
    data = (Path(private_file) if private_file else ROOT / 'fr-menu-reviews.json.gz').read_bytes()
    if manifest['version'] != VERSION or hashlib.sha256(data).hexdigest() != manifest['sha256']:
        raise ValueError('Changed menu evidence archive')
    records = json.loads(gzip.decompress(data))
    if len(records) != manifest['count']:
        raise ValueError('Incomplete menu evidence archive')
    return records


def verify(record):
    identity = record['problemId'] + '@' + str(record['problemRevision'])
    evidence = reviewed_records().get(identity)
    if not evidence:
        raise ValueError('Unknown multiple-choice revision')
    body = {key: value for key, value in record.items() if key != 'contentHash'}
    if record['contentHash'] != digest(body) or record['contentHash'] != evidence['contentHash']:
        raise ValueError('Changed reviewed multiple-choice content')
    proof, review = evidence['mathematics'], evidence['editorial']
    if (review['decision'] != 'qualified' or review['holds'] or proof['status'] != 'mathematical-pass'
            or not review['shortestRoute'] or not proof['first']['derivation']
            or review['mcSourceHash'] != proof['mcSourceHash'] or review['id'] != record['problemId']
            or review['actualAcademicTier'] != record['difficulty']
            or review['sourceTaskHash'] != record['validation']['evidence']['sourceTaskHash']):
        raise ValueError('Missing source-bound choice-visible admission')
    values = list(map(Fraction, proof['orderedValues']))
    if [displayed(value) for value in values] != [choice['math'] for choice in record['choices']]:
        raise ValueError('Rendered choices differ from exact solved values')
    differences = [a - b for a, b in itertools.combinations(values, 2)]
    if len(differences) != 6 or not all(differences) or differences != list(map(Fraction, review['sixPairwiseDifferences'])):
        raise ValueError('Four pairwise-inequivalent choices required')
    answer = Fraction(proof['first']['answer'])
    chosen = [i for i, choice in enumerate(record['choices']) if choice['choiceId'] == record['answerChoiceId']]
    if chosen != [proof['selectedSourceIndex']] or values[chosen[0]] != answer:
        raise ValueError('Independent solution differs from the immutable answer key')
    return True
