# Pricing Integration - Quick Reference

## 🚀 Quick Start

### Show Upgrade Modal

```javascript
import { UpgradeModal } from '@/components/ui/upgrade-modal';

const [showUpgrade, setShowUpgrade] = useState(false);

// Trigger when user hits limit
if (userHitLimit) {
    setShowUpgrade(true);
}

// Render
<UpgradeModal
    isOpen={showUpgrade}
    onClose={() => setShowUpgrade(false)}
    title="Your custom title"
    message="Your outcome-focused message"
    feature="Specific benefit they'll get" // optional
/>
```

---

## 📦 Predefined Prompts

```javascript
import { upgradePrompts } from '@/components/pricing/upgrade-prompt';

// Job Match
<UpgradeModal
    {...upgradePrompts.jobMatch}
    isOpen={showUpgrade}
    onClose={() => setShowUpgrade(false)}
/>

// Resume Tailor
<UpgradeModal
    {...upgradePrompts.resumeTailor}
    isOpen={showUpgrade}
    onClose={() => setShowUpgrade(false)}
/>

// Email Generator
<UpgradeModal
    {...upgradePrompts.emailGenerator}
    isOpen={showUpgrade}
    onClose={() => setShowUpgrade(false)}
/>

// PDF Download
<UpgradeModal
    {...upgradePrompts.pdfDownload}
    isOpen={showUpgrade}
    onClose={() => setShowUpgrade(false)}
/>

// AI Optimization
<UpgradeModal
    {...upgradePrompts.aiOptimization}
    isOpen={showUpgrade}
    onClose={() => setShowUpgrade(false)}
/>
```

---

## 🎯 When to Show Upgrade

### ✅ DO Show When:
- User completes an action and sees value
- User tries to use a Pro feature
- User hits usage limit
- User downloads/exports

### ❌ DON'T Show When:
- User just signed up
- User is browsing
- User hasn't experienced value yet
- On every page load

---

## 💬 Copy Template

```javascript
<UpgradeModal
    title="[Action they want to do]"
    message="[How Pro helps them achieve it]. [Outcome they'll get]."
    feature="[Specific benefit]"
/>
```

**Example:**
```javascript
<UpgradeModal
    title="Download your job-ready resume"
    message="Get a professionally formatted PDF optimized for ATS systems and recruiters."
    feature="Priority PDF generation with professional formatting"
/>
```

---

## 🎨 Design Tokens

```javascript
// Colors
bg: 'bg-neutral-900'
border: 'border-white/10'
text: 'text-white'
accent: 'bg-blue-600'

// Spacing
padding: 'p-8'
gap: 'space-y-6'
rounded: 'rounded-2xl'

// Button
primary: 'bg-blue-600 hover:bg-blue-500'
secondary: 'text-neutral-400 hover:text-white'
```

---

## 🔔 Toast Notifications

```javascript
import { toast } from '@/lib/toast';

// Success
toast.success("Upgrade successful!");

// Error
toast.error("Something went wrong");

// Info
toast.info("Stripe coming soon");
```

---

## ✅ Checklist Before Shipping

- [ ] Upgrade modal appears at right moment
- [ ] Copy is outcome-focused (not feature-focused)
- [ ] "Continue with Free" option is clear
- [ ] No dark patterns or pressure
- [ ] Toast instead of alert()
- [ ] Post-upgrade experience is smooth
- [ ] Tested with free and pro users

---

## 🚫 What NOT to Do

```javascript
// ❌ BAD - Feature dumping
<UpgradeModal
    title="Upgrade to Pro"
    message="Get unlimited scans, tracking, emails, PDFs, and more!"
/>

// ✅ GOOD - Outcome focused
<UpgradeModal
    title="Unlock full job fit analysis"
    message="See exactly where you match and what's missing. Get actionable insights to improve your chances."
/>
```

```javascript
// ❌ BAD - Pressure tactics
<UpgradeModal
    title="Upgrade Now!"
    message="Limited time offer! Only 3 spots left!"
/>

// ✅ GOOD - Calm and respectful
<UpgradeModal
    title="Make your application job-ready"
    message="You're close. Pro helps you tailor your resume and apply with confidence."
/>
```

---

## 📱 Responsive Behavior

Modal automatically:
- Centers on screen
- Adds backdrop blur
- Handles mobile sizing
- Prevents scroll behind modal
- Closes on backdrop click
- Closes on ESC key

---

## 🎯 Success Criteria

User should think:
> "This makes sense for me right now."

NOT:
> "I was tricked."

---

**Remember:** Trust > Tricks
