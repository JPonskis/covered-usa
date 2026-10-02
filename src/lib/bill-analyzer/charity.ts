import {
  type CharityCareResult,
  type NonprofitStatus,
  getFPLPercent,
} from './types'

/**
 * Translate a hospital lookup into what the user can actually act on.
 *
 * We hold financial assistance policies for a small slice of US hospitals, so
 * a lookup MISS is the common case and says nothing about the hospital. The
 * one unacceptable answer here is asserting "for-profit" on a miss, because
 * that strips a real 501(r) right from most of the people who have one.
 */
export function buildCharityCareResult(
  nonprofitStatus: NonprofitStatus,
  hospitalData: {
    is_nonprofit?: boolean
    fap_url?: string
    income_limit_fpl_percent?: number
    hospital_name?: string
  } | null,
  income?: number,
  householdSize?: number,
  providerName?: string
): CharityCareResult {
  const hospitalName = hospitalData?.hospital_name ?? providerName
  const fapUrl = hospitalData?.fap_url ?? undefined

  // We hold financial assistance policies for a small slice of US hospitals,
  // so a miss is common and means nothing about the hospital. Saying
  // "for-profit" here would strip a real 501(r) right from most people who
  // have one, which is the one error we cannot afford to make.
  if (nonprofitStatus === 'unknown') {
    return {
      eligibility: 'unknown',
      nonprofitStatus: 'unknown',
      hospitalName,
      explanation: `We could not confirm whether ${hospitalName ?? 'this hospital'} is a nonprofit. Most US community hospitals are, and nonprofits are required by federal law (501(r)) to have a written financial assistance policy and to cap what they charge patients who qualify. It is worth two minutes to check.`,
      nextSteps: [
        'Search the hospital’s own website for "financial assistance policy" — nonprofits are required to publish it there',
        'Call the billing department and ask, in these words: "Do you have a financial assistance policy, and can you send me the application?"',
        'If they tell you they are not a nonprofit, ask about their financial hardship program and self-pay discount instead',
        'Do not pay anything until you know which of the two you are dealing with',
      ],
    }
  }

  if (nonprofitStatus === 'for_profit') {
    return {
      eligibility: 'unlikely',
      nonprofitStatus: 'for_profit',
      hospitalName,
      explanation: `Our records show ${hospitalName ?? 'this hospital'} is a for-profit hospital. For-profit hospitals are not covered by the federal 501(r) financial assistance rules, though many run hardship programs voluntarily and some states require them.`,
      nextSteps: [
        'Call the billing department and ask if they have a financial hardship or charity program',
        'Ask to speak with a financial counselor',
        'Ask for the self-pay or uninsured discount, which is often 20 to 40 percent',
        'Ask for an interest-free payment plan in writing before you pay anything',
      ],
    }
  }

  // Confirmed nonprofit from here down.
  const incomeLimit = hospitalData?.income_limit_fpl_percent
  const fplPercent =
    income && householdSize ? getFPLPercent(income, householdSize) : undefined

  const baseSteps = [
    'Ask the billing department for a financial assistance application today',
    fapUrl
      ? `Read their financial assistance policy at ${fapUrl}`
      : 'Ask for their financial assistance policy in writing',
    'Gather proof of income (pay stubs, tax return, benefit award letters)',
    'A hospital cannot send your bill to collections while your application is pending',
  ]

  // No income given, or no published cutoff on file. Either way we do not know
  // whether this person qualifies, so we do not tell them they do.
  if (fplPercent == null || incomeLimit == null) {
    return {
      eligibility: 'unknown',
      nonprofitStatus: 'nonprofit',
      fplPercent,
      incomeLimitFplPercent: incomeLimit,
      fapUrl,
      hospitalName,
      explanation:
        fplPercent == null
          ? `${hospitalName ?? 'This hospital'} is a nonprofit, so federal 501(r) law requires it to have a financial assistance policy and bars it from charging a qualifying patient more than the lowest rate it accepts from an insurer. We do not have your income, so we cannot say whether you qualify — the application is how you find out.`
          : `${hospitalName ?? 'This hospital'} is a nonprofit, so federal 501(r) law requires it to have a financial assistance policy. We do not have their published income cutoff on file, so we cannot say whether you qualify at ${fplPercent}% of the federal poverty level. Cutoffs commonly run between 200% and 400%, and applying is free.`,
      nextSteps: baseSteps,
    }
  }

  const eligible = fplPercent <= incomeLimit

  return {
    eligibility: eligible ? 'likely' : 'unlikely',
    nonprofitStatus: 'nonprofit',
    fplPercent,
    incomeLimitFplPercent: incomeLimit,
    fapUrl,
    hospitalName,
    explanation: eligible
      ? `You are at ${fplPercent}% of the federal poverty level and ${hospitalName ?? 'this hospital'} publishes a cutoff of ${incomeLimit}%, so you likely qualify for financial assistance. Under federal 501(r) law a nonprofit hospital cannot charge a qualifying patient more than the lowest rate it accepts from an insurer.`
      : `You are at ${fplPercent}% of the federal poverty level and ${hospitalName ?? 'this hospital'} publishes a cutoff of ${incomeLimit}% for free care, so you are above it. Many nonprofit hospitals still give partial discounts above their cutoff, and applying is free.`,
    nextSteps: eligible
      ? [
          'Ask for a financial assistance application before you pay anything',
          fapUrl
            ? `Read their financial assistance policy at ${fapUrl}`
            : 'Ask the billing department for their financial assistance policy',
          'Gather proof of income (pay stubs, tax return, benefit award letters)',
          'A hospital cannot send your bill to collections while your application is pending',
        ]
      : [
          'Apply anyway and ask specifically about partial or sliding-scale assistance',
          'Ask for the self-pay or uninsured discount',
          'Ask for an interest-free payment plan in writing',
          'If the bill is over $5,000, a medical billing advocate may be worth the fee',
        ],
  }
}
