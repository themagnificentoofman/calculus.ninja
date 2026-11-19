import test from 'node:test';
import assert from 'node:assert/strict';
import {roundIdFromSearch} from '../lib/round-url.mjs';
test('URL recovery retains complete current IDs and historical IDs without accepting path syntax',()=>{
 for(const id of ['a'.repeat(64),'legacy123','historical_id-123','A'.repeat(128)])assert.equal(roundIdFromSearch('?topic=limits&round='+encodeURIComponent(id)),id);
 for(const id of ['', 'tiny','a'.repeat(129),'../private','private/record','__proto__','constructor','prototype','id with spaces','abcde\u0000'])assert.equal(roundIdFromSearch('?round='+encodeURIComponent(id)),null);
 assert.equal(roundIdFromSearch('?topic=limits'),null);
});
