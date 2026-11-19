"""Independent rational proof of the constants used by the domain checker.

No floating-point approximation or the checker implementation is used to prove
the inequalities. Run from the repository root; stdout is the evidence record.
"""
from fractions import Fraction as Q
from math import factorial
from pathlib import Path
import hashlib
import json
import re


def arctan_bounds(q, terms):
    # Integrating the finite geometric identity for 1/(1+t*t) on [0,q]
    # gives an alternating remainder whose magnitude is below the next term.
    partial = sum(((-1) ** k * q ** (2*k+1) / (2*k+1) for k in range(terms)), Q(0))
    next_term = q ** (2*terms+1) / (2*terms+1)
    return (partial, partial + next_term) if terms % 2 == 0 else (partial-next_term, partial)


a_lo, a_hi = arctan_bounds(Q(1, 5), 8)
b_lo, b_hi = arctan_bounds(Q(1, 239), 3)
# Machin identity: tan(4a-b)=1 by rational tangent addition. 0<4a-b<0.8
# lies in (0,pi/2), since pi>2, hence 4a-b=pi/4 (the principal branch).
t2 = 2*Q(1, 5)/(1-Q(1, 5)**2)
t4 = 2*t2/(1-t2*t2)
assert (t4-Q(1, 239))/(1+t4*Q(1, 239)) == 1
assert 0 < 4*a_lo-b_hi < 4*a_hi-b_lo < Q(4, 5)
pi_bounds = (16*a_lo-4*b_hi, 16*a_hi-4*b_lo)
e_partial = sum((Q(1, factorial(k)) for k in range(13)), Q(0))
# The positive tail starts at 1/13!; each following ratio is at most 1/14.
e_bounds = (e_partial, e_partial + Q(1, factorial(13))*Q(14, 13))

source = Path('lib/math-answer/domain.mjs').read_bytes()
text = source.decode()
records = {}
for name, proved in [('pi', pi_bounds), ('e', e_bounds)]:
    match = re.search(r"if\(s==='"+name+r"'\)return interval\(rat\((\d+),(\d+)\),rat\((\d+),(\d+)\)\)", text)
    assert match, f'Missing explicit {name} enclosure; review the new implementation.'
    lo, hi = Q(int(match[1]), int(match[2])), Q(int(match[3]), int(match[4]))
    assert lo < proved[0] < proved[1] < hi, f'{name} enclosure is not proved'
    records[name] = {'implemented': [str(lo), str(hi)], 'independentlyProved': list(map(str, proved))}
print(json.dumps({'version': 'constant-enclosures-v1', 'method': 'exact rational alternating/Taylor remainder bounds', 'sourceSha256': hashlib.sha256(source).hexdigest(), 'proofScriptSha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(), 'passed': True, 'constants': records}, indent=2))
