# Bing Webmaster Tools Setup — CoveredUSA

## IndexNow Key

```
b5a600e393587628a4976896807b6d46
```

Key file location: `public/coveredusa-indexnow-key.txt`
Key served at: `https://coveredusa.org/b5a600e393587628a4976896807b6d46.txt`

The API route at `/api/indexnow` also returns the key as plain text (used by the Next.js handler).

---

## 1. Add CoveredUSA to Bing Webmaster Tools

1. Go to https://www.bing.com/webmasters
2. Sign in with a Microsoft account
3. Click **Add a Site**
4. Enter `https://coveredusa.org` and click **Add**

---

## 2. Verify Ownership (DNS TXT Record)

Bing will offer several verification methods. DNS TXT is the cleanest — no file uploads needed.

1. In Bing Webmaster Tools, choose **DNS Verification**
2. Copy the TXT record value Bing provides (looks like `MSv1-...` or a long alphanumeric string)
3. Log in to Namecheap → Domains → coveredusa.org → **Advanced DNS**
4. Add a new record:
   - **Type:** TXT
   - **Host:** `@`
   - **Value:** paste the value from Bing
   - **TTL:** Automatic (or 300)
5. Save. DNS propagation typically takes 5–30 minutes.
6. Back in Bing Webmaster Tools, click **Verify**

---

## 3. Submit the Sitemap

After verification:

1. In Bing Webmaster Tools, go to **Sitemaps** in the left sidebar
2. Click **Submit sitemap**
3. Enter: `https://coveredusa.org/sitemap.xml`
4. Click **Submit**

Bing will crawl and index the sitemap. Check back in 24 hours for crawl status.

---

## 4. Configure IndexNow in Bing Webmaster Tools

Bing supports IndexNow natively — once verified, you can submit URLs directly from the dashboard:

1. Go to **URL Submission** → **IndexNow**
2. The key file at `https://coveredusa.org/b5a600e393587628a4976896807b6d46.txt` must return the key string
3. Bing will auto-detect it once the key file is live

---

## 5. Test IndexNow Key Verification

Before submitting URLs, verify the key file is accessible:

```bash
curl https://coveredusa.org/b5a600e393587628a4976896807b6d46.txt
# Expected output: b5a600e393587628a4976896807b6d46
```

The response must:
- Return HTTP 200
- Content-Type: `text/plain`
- Body: exactly the key string (no extra whitespace or HTML)

---

## 6. Submit URLs via Script

After the site is live and verified:

```bash
# Submit today's newly published articles
PATH="/opt/homebrew/bin:$PATH" node /Users/frankthebot/clawd/scripts/coveredusa-indexnow-submit.js --today

# Submit specific URLs manually
PATH="/opt/homebrew/bin:$PATH" node /Users/frankthebot/clawd/scripts/coveredusa-indexnow-submit.js \
  https://coveredusa.org/en/blog/aca-health-insurance-eligibility-2026 \
  https://coveredusa.org/es/blog/aca-health-insurance-eligibility-2026
```

---

## Notes

- IndexNow key for BenefitsUSA is different: `0bfa7c9805ca2b749f7217226683691a` — do not mix them up
- Bing submission was paused for BenefitsUSA in May 2026 due to suppression recovery; CoveredUSA starts fresh so both endpoints are active in the submit script
- The Next.js API route `/api/indexnow` serves the key value and can be used as an alternative key location URL if needed
