import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { verifySignature } from '../src/lib/payments.ts';

const sign = (body: string, secret: string, t: number) => `t=${t},v1=${createHmac('sha256', secret).update(`${t}.${body}`).digest('hex')}`;
test('accepts valid signature', () => assert.ok(verifySignature('{}', sign('{}', 's', 1000), 's', 1000 * 1000)));
test('rejects wrong secret', () => assert.ok(!verifySignature('{}', sign('{}', 'x', 1000), 's', 1000 * 1000)));
test('rejects tampered body', () => assert.ok(!verifySignature('{"a":1}', sign('{}', 's', 1000), 's', 1000 * 1000)));
test('rejects stale timestamp', () => assert.ok(!verifySignature('{}', sign('{}', 's', 1000), 's', 5000 * 1000)));
test('rejects missing header', () => assert.ok(!verifySignature('{}', null, 's')));
