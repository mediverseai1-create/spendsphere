import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, DEFAULT_POLICY } from '../src/lib/policy.ts';

const tx = { amount_cents: 5000, category: 'Software', merchant: 'Figma', occurred_on: '2026-01-02', hasReceipt: true };
const card = { spend_limit_cents: 10000, status: 'active', allowed_categories: [] };

test('clean transaction is approved', () => {
  const r = evaluate(tx, DEFAULT_POLICY, card, 0, []);
  assert.deepEqual(r.blocks, []); assert.equal(r.status, 'approved');
});
test('card limit blocks', () => assert.ok(evaluate(tx, DEFAULT_POLICY, card, 6000, []).blocks.includes('Exceeds card spend limit')));
test('frozen card blocks', () => assert.ok(evaluate(tx, DEFAULT_POLICY, { ...card, status: 'frozen' }, 0, []).blocks.length === 1));
test('missing receipt flagged over threshold', () => assert.ok(evaluate({ ...tx, hasReceipt: false }, DEFAULT_POLICY, card, 0, []).flags.includes('Missing receipt')));
test('duplicate flagged', () => assert.ok(evaluate(tx, DEFAULT_POLICY, card, 0, [{ merchant: 'figma', amount_cents: 5000, occurred_on: '2026-01-02' }]).flags.includes('Possible duplicate')));
test('large amount needs approval', () => {
  const r = evaluate({ ...tx, amount_cents: 200000 }, DEFAULT_POLICY, null, 0, []);
  assert.equal(r.status, 'pending_approval');
});
test('blocked category', () => assert.ok(evaluate(tx, { ...DEFAULT_POLICY, blocked_categories: ['Software'] }, null, 0, []).blocks.length === 1));
