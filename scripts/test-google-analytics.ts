import assert from 'node:assert/strict';
import { analyticsCampaign, analyticsLocation, analyticsReferrer } from '../src/lib/google-analytics';

assert.equal(
  analyticsLocation('https://coveredusa.org/en/results/private-submission?email=test@example.com#details'),
  'https://coveredusa.org/en/results',
);
assert.equal(
  analyticsLocation('https://coveredusa.org/es/medical-bill-analyzer/results/private-bill?token=secret'),
  'https://coveredusa.org/es/medical-bill-analyzer/results',
);
assert.equal(
  analyticsLocation('https://coveredusa.org/en/blog/medicaid?utm_source=bing'),
  'https://coveredusa.org/en/blog/medicaid',
);
assert.equal(analyticsReferrer('https://www.google.com/search?q=private+health+query'), 'https://www.google.com/');
assert.equal(analyticsReferrer('https://coveredusa.org/en/results/private-id'), 'https://coveredusa.org/en/results');
assert.equal(analyticsReferrer('not a URL'), '');
assert.equal(analyticsReferrer('javascript:alert(1)'), '');
assert.deepEqual(
  analyticsCampaign('?utm_source=facebook&utm_medium=paid_social&utm_campaign=fall-2026&email=test@example.com&income=12000'),
  { campaign_source: 'facebook', campaign_medium: 'paid_social', campaign_name: 'fall-2026' },
);
assert.deepEqual(analyticsCampaign('?utm_source=test@example.com&utm_campaign=' + 'x'.repeat(101)), {});
console.log('Google Analytics URL privacy and campaign attribution checks passed.');
