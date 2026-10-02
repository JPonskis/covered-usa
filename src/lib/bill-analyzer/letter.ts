import type { AnalysisResult, AnalyzedLineItem } from './types'
import { money } from './headline'

export interface LetterInputs {
  analysis: AnalysisResult
  patientName?: string
  patientAddress?: string
  accountNumber?: string
  dateOfService?: string
}

/**
 * The dispute letter is built in code, not composed by a model.
 *
 * It is the one artifact a user prints and mails to a hospital, and the
 * previous version handed a language model an unverified overcharge total and
 * asked it to "cite the specific overcharges found" — a machine writing a
 * legal argument from a number that was wrong. This template asserts only two
 * kinds of thing: facts taken straight off the bill, and rights that exist
 * regardless of what the bill says. Everything about the charges themselves is
 * phrased as a question, because a question cannot be an overstatement.
 */

/** The charges most worth asking about: priced, printed code, biggest multiple. */
function questionableLines(analysis: AnalysisResult): AnalyzedLineItem[] {
  return analysis.lineItems
    .filter(
      i =>
        i.medicareRate != null &&
        i.medicareRate > 0 &&
        i.codeSource === 'printed' &&
        (i.overchargeAmount ?? 0) > 0
    )
    .sort(
      (a, b) =>
        b.billedAmount / (b.medicareRate ?? 1) -
        a.billedAmount / (a.medicareRate ?? 1)
    )
    .slice(0, 6)
}

function repeatedLines(analysis: AnalysisResult): AnalyzedLineItem[] {
  return analysis.lineItems
    .filter(i => i.flags.some(f => f.type === 'duplicate'))
    .slice(0, 6)
}

function unbenchmarkedLines(analysis: AnalysisResult): AnalyzedLineItem[] {
  return analysis.lineItems
    .filter(i => i.medicareRate == null)
    .sort((a, b) => b.billedAmount - a.billedAmount)
    .slice(0, 8)
}

export function buildDisputeLetter(inputs: LetterInputs): string {
  const { analysis, patientName, patientAddress, accountNumber, dateOfService } =
    inputs
  const { provider, summary, charityCare } = analysis

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const lines: string[] = []
  const p = (s = '') => lines.push(s)

  p(today)
  p()
  p(patientName ?? '[Your name]')
  p(patientAddress ?? '[Your address]')
  p()
  p('Billing Department')
  p(provider.name)
  p()
  p(
    `Re: Request for itemized statement and review of charges${accountNumber ? ` — Account ${accountNumber}` : ''}${dateOfService ? `, date of service ${dateOfService}` : ''}`
  )
  p()
  p('To whom it may concern:')
  p()
  p(
    `I am writing about the bill I received from ${provider.name}${dateOfService ? ` for services on ${dateOfService}` : ''}, totaling ${money(summary.totalBilled)}. I am asking for an itemized statement and for written answers to the specific questions below before I pay this balance. I am not refusing to pay; I am asking to understand what I am being charged for.`
  )
  p()

  // 1. Itemized statement
  let section = 1
  p(`${section}. Please send a fully itemized statement.`)
  p()
  p(
    'Please provide an itemized statement listing every charge separately with its billing code, the quantity billed, and the charge per unit. If this was an outpatient or emergency visit, please include the revenue codes as well.'
  )
  p()
  section++

  // 2. Specific questions about priced charges
  const questions = questionableLines(analysis)
  if (questions.length > 0) {
    p(`${section}. Please justify the following charges.`)
    p()
    p(
      `I compared these charges to the Medicare physician fee schedule rate for the same service in a facility setting. Medicare is a reference point, not a price I am claiming you must accept, but the gap is large enough that I would like it explained:`
    )
    p()
    questions.forEach((item, i) => {
      const multiple = (item.billedAmount / (item.medicareRate ?? 1)).toFixed(1)
      p(
        `   ${i + 1}. ${item.description} — billed ${money(item.billedAmount)}. Medicare pays about ${money(item.medicareRate ?? 0)} for this service${item.quantity > 1 ? ` at the ${item.quantity} units billed` : ''}, which makes this charge roughly ${multiple} times that rate. Please explain how this charge was set.`
      )
    })
    p()
    section++
  }

  // 3. Repeated charges — asked, never accused
  const repeats = repeatedLines(analysis)
  if (repeats.length > 0) {
    p(`${section}. Please confirm these repeated charges are correct.`)
    p()
    p(
      'The following charges appear more than once on this bill. I understand repeats can be legitimate. Please confirm each one reflects a separate service actually provided, and correct the bill if any is a duplicate:'
    )
    p()
    repeats.forEach((item, i) => {
      p(`   ${i + 1}. ${item.description} — billed ${money(item.billedAmount)}`)
    })
    p()
    section++
  }

  // 4. Unbenchmarked charges — itemize and justify, never called overcharges
  const unpriced = unbenchmarkedLines(analysis)
  if (unpriced.length > 0) {
    p(`${section}. Please itemize and justify these charges.`)
    p()
    p(
      `I was not able to find a published rate to compare these charges against${summary.unbenchmarkedCount > unpriced.length ? ` (these are the largest of ${summary.unbenchmarkedCount} such charges, totaling ${money(summary.totalUnbenchmarked)})` : ''}. Please identify the billing code for each and explain what the charge covers:`
    )
    p()
    unpriced.forEach((item, i) => {
      p(`   ${i + 1}. ${item.description} — billed ${money(item.billedAmount)}`)
    })
    p()
    section++
  }

  // 5. Price transparency — a request, not an accusation
  p(`${section}. Please provide your posted rates for these services.`)
  p()
  p(
    'Under the federal hospital price transparency rule (45 CFR Part 180), hospitals must publish their standard charges, including discounted cash prices and payer-specific negotiated rates. Please tell me the discounted cash price for each service on this bill, and whether that price is lower than what I have been billed.'
  )
  p()
  section++

  // 6. Financial assistance — scoped strictly to what we actually know
  if (charityCare.nonprofitStatus === 'nonprofit') {
    p(`${section}. I am requesting a financial assistance application.`)
    p()
    p(
      `${provider.name} is a nonprofit hospital. Under section 501(r) of the Internal Revenue Code, a nonprofit hospital must maintain a written financial assistance policy and may not charge a patient who is eligible for assistance more than the amounts generally billed to patients with insurance. Please send me your financial assistance policy and application, in writing.`
    )
    p()
    p(
      'I understand that while a financial assistance application is pending, the hospital may not pursue extraordinary collection actions on this account. Please confirm this account is on hold while my application is reviewed.'
    )
    p()
  } else if (charityCare.nonprofitStatus === 'unknown') {
    p(`${section}. Please tell me whether you offer financial assistance.`)
    p()
    p(
      'Please tell me whether you have a written financial assistance or charity care policy, and if so, send me the policy and the application. If you are a nonprofit hospital, please confirm that, as nonprofit hospitals are required by section 501(r) of the Internal Revenue Code to maintain such a policy. If you are not, please tell me about any financial hardship program or self-pay discount you offer.'
    )
    p()
  } else {
    p(`${section}. Please tell me about hardship assistance and self-pay discounts.`)
    p()
    p(
      'Please tell me whether you offer a financial hardship program, a self-pay or uninsured discount, or an interest-free payment plan, and send me the terms in writing.'
    )
    p()
  }
  section++

  // 7. Response and collections
  p(`${section}. Please respond in writing within 30 days.`)
  p()
  p(
    `Please send your written response to the address above. I am disputing the charges identified in this letter pending your response, and I ask that this account not be referred to collections or reported to a credit bureau while the dispute is open.${summary.patientResponsibility != null ? ` My statement shows a patient responsibility of ${money(summary.patientResponsibility)}; this letter concerns that balance.` : ''}`
  )
  p()
  p('Thank you for your time.')
  p()
  p('Sincerely,')
  p()
  p()
  p(patientName ?? '[Your name]')
  p()
  p()
  p(
    'This letter is for informational purposes only and does not constitute legal advice. The Medicare rates cited are a published reference point, not a determination of what is owed.'
  )

  return lines.join('\n')
}
