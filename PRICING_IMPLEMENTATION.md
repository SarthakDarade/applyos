# ApplyOS Pricing Implementation Guide

## Philosophy

**We don't sell features. We sell confidence, clarity, and speed.**

User mindset: "I want to get hired faster and with less uncertainty."

---

## Pricing Model

- **Free**: Get Started (₹0)
- **Pro**: Serious Job Seekers (₹299/month)

**No annual plans. No confusing tiers. No hidden credits.**

---

## Implementation Checklist

### ✅ Completed

1. **Main Pricing Page** (`/pricing`)
   - Clean, calm design
   - Side-by-side comparison
   - Outcome-based copy (not feature-dumping)
   - Free plan looks usable (not shamed)
   - Pro plan subtly highlighted
   - No dark patterns

2. **Upgrade Modal Component** (`/components/ui/upgrade-modal.js`)
   - Calm, respectful tone
   - Clear value proposition
   - Primary + Secondary CTAs
   - Trust signals
   - No guilt, no pressure

3. **Contextual Upgrade Prompts** (`/components/pricing/upgrade-prompt.js`)
   - Predefined prompts for each feature
   - Outcome-focused messaging
   - Easy to integrate

---

## Where to Add Upgrade Prompts

### 1. Job Match Results
**Trigger**: After basic analysis completes
**Location**: `src/components/job-match/job-match-results.js`

```javascript
import { UpgradeModal } from '@/components/ui/upgrade-modal';
import { upgradePrompts } from '@/components/pricing/upgrade-prompt';

// Show after displaying basic results
<UpgradeModal
    isOpen={showUpgrade}
    onClose={() => setShowUpgrade(false)}
    title={upgradePrompts.jobMatch.title}
    message={upgradePrompts.jobMatch.message}
    feature={upgradePrompts.jobMatch.feature}
/>
```

**Copy**:
- Title: "Unlock full job fit analysis"
- Message: "See exactly where you match and what's missing. Get actionable insights to improve your chances."

---

### 2. Resume Tailor Feature
**Trigger**: When user tries to tailor resume for specific job
**Location**: `src/components/resume/resume-editor.js`

```javascript
<UpgradeModal
    isOpen={showUpgrade}
    onClose={() => setShowUpgrade(false)}
    title={upgradePrompts.resumeTailor.title}
    message={upgradePrompts.resumeTailor.message}
    feature={upgradePrompts.resumeTailor.feature}
/>
```

**Copy**:
- Title: "Tailor your resume for this role"
- Message: "Let AI optimize your resume specifically for this job. Highlight the right experience and skills."

---

### 3. Email Generator
**Trigger**: When generating HR email
**Location**: `src/components/email/email-generator.js`

```javascript
<UpgradeModal
    isOpen={showUpgrade}
    onClose={() => setShowUpgrade(false)}
    title={upgradePrompts.emailGenerator.title}
    message={upgradePrompts.emailGenerator.message}
    feature={upgradePrompts.emailGenerator.feature}
/>
```

**Copy**:
- Title: "Generate professional HR emails"
- Message: "Stand out with personalized, professional emails. Follow up confidently and professionally."

---

### 4. PDF Download
**Trigger**: When downloading resume PDF
**Location**: `src/components/resume/resume-actions.js`

```javascript
<UpgradeModal
    isOpen={showUpgrade}
    onClose={() => setShowUpgrade(false)}
    title={upgradePrompts.pdfDownload.title}
    message={upgradePrompts.pdfDownload.message}
    feature={upgradePrompts.pdfDownload.feature}
/>
```

**Copy**:
- Title: "Download your job-ready resume"
- Message: "Get a professionally formatted PDF optimized for ATS systems and recruiters."

---

## Post-Upgrade Experience

**Critical**: Immediately after successful upgrade:

1. Re-run the last action automatically
2. Show success feedback (toast)
3. Remove all Pro locks instantly
4. Redirect to feature they were trying to use

```javascript
// In payment-utils.js success handler
if (verifyData.success) {
    toast.success("Upgrade Successful! Welcome to Pro.");
    
    // Re-run last action if stored
    if (window.lastProAction) {
        window.lastProAction();
    }
    
    router.refresh();
    router.push(window.lastProActionPath || '/dashboard');
}
```

---

## Copy Guidelines

### ✅ DO:
- Focus on outcomes ("Get hired faster")
- Use calm, confident tone
- Explain what they gain
- Respect user choice
- Show value through experience

### ❌ DON'T:
- Feature dump
- Use guilt or pressure
- Add countdown timers
- Block without explanation
- Use dark patterns
- Offer fake discounts

---

## Design Rules

1. **Free Plan**
   - Must look usable
   - No graying out
   - No shaming
   - Clear what's included

2. **Pro Plan**
   - Subtle highlight (glow, border)
   - "Most users upgrade here" badge
   - Outcome-based features
   - Price with context (₹299/month = less than coffee per week)

3. **Upgrade Modals**
   - Calm background (60% opacity, blur)
   - Clear hierarchy
   - Primary CTA (Upgrade)
   - Secondary CTA (Continue with Free)
   - Trust signal (Cancel anytime)

---

## Testing Checklist

- [ ] Free user can experience core value
- [ ] Upgrade prompts appear at right moments
- [ ] Copy is outcome-focused, not feature-focused
- [ ] No dark patterns or pressure tactics
- [ ] Post-upgrade experience is smooth
- [ ] User feels "This makes sense" not "I was tricked"

---

## Metrics to Track

1. **Conversion Rate**: Free → Pro
2. **Time to Upgrade**: How long after signup
3. **Upgrade Trigger**: Which feature prompted upgrade
4. **Retention**: Do upgraded users stay?
5. **Sentiment**: User feedback on upgrade experience

---

## Future Enhancements

1. **Usage-based prompts**: Show upgrade after X job matches
2. **Success stories**: "Users who upgraded got hired 2x faster"
3. **Trial period**: 7-day Pro trial for new users
4. **Referral credits**: Give free month for referrals

---

## Final Rule

**If a user upgrades, they should think:**
"This makes sense for me right now."

**Not:**
"I was tricked."

Trust > Tricks.
