# BLOK Site Review Report

> Generated: 2024-08-07
> Skills completed: 18/18 (ALL PHASES COMPLETE)

---

## Executive Summary

| Category | Score | Priority Issues |
|----------|-------|-----------------|
| Frontend Design | **B+** | Canvas performance, error boundaries |
| UI/UX | **B+** | Yellow contrast issues, small fonts |
| Images | **C+** | Missing favicon, OG branding wrong |
| Copywriting | **B+** | Weak social proof, inconsistent CTAs |
| Copy Editing | **B+** | Minor passive voice, some redundancy |
| Content Strategy | **C** | No blog, /gallery deleted, no content marketing |
| Marketing Psychology | **B** | Good scarcity, weak social proof |
| SEO Audit | **B** | Dead links, missing structured data |
| AI SEO | **D+** | No llms.txt, no extractable blocks |
| Analytics | **F** | NO TRACKING AT ALL |
| Marketing Ideas | **N/A** | Ideas generated |
| Marketing Plan | **N/A** | Plan created |
| Ads | **N/A** | Strategy defined |
| Ad Creative | **N/A** | Copy variations created |
| Community Marketing | **N/A** | Strategy defined |
| Offers | **B-** | No bonuses, weak urgency |
| Onboarding | **B-** | Missing token acquisition step |
| Marketing Council | **B-** | Good concept, weak execution |

**Overall Site Score: B-**

---

## Critical Fixes (Do First)

### 1. Branding Error
- **Issue:** OG images say "PIXELBOARD" instead of "BLOK"
- **Files:** `src/app/opengraph-image.tsx`, `src/app/zone/[id]/opengraph-image.tsx`
- **Impact:** Brand confusion on social shares

### 2. Missing Favicon
- **Issue:** No favicon.ico or proper icon
- **Files:** `src/app/icon.svg` exists but may not be linked
- **Impact:** Unprofessional browser tabs

### 3. Yellow Contrast Failure
- **Issue:** Yellow (#FFC800) on paper (#FAF5EA) = 1.8:1 ratio (fails WCAG)
- **Files:** `src/components/ui/chip.tsx` default variant
- **Fix:** Darken to #B38F00 or use white bg + yellow border

### 4. Dead Link - /gallery
- **Issue:** Footer and sitemap link to `/gallery` which is deleted
- **Files:** `src/components/footer.tsx:7`, `src/app/sitemap.ts`

### 5. NO ANALYTICS
- **Issue:** Zero tracking - no GA4, no events, no conversions
- **Impact:** Flying blind on user behavior
- **Fix:** Add Plausible or GA4 immediately

---

## High Priority Fixes

### Performance
| Issue | File | Fix |
|-------|------|-----|
| `occupancy()` not memoized | `board-canvas.tsx:143` | Wrap in `useMemo` |
| Grid draws 16K rects per frame | `board-canvas.tsx:292` | Pre-render to offscreen canvas |
| No `React.memo` on SelectionPanel | `selection-panel.tsx` | Add memo wrapper |

### Accessibility
| Issue | File | Fix |
|-------|------|-----|
| 8px font sizes | `board/page.tsx:254,271` | Minimum 10px |
| Canvas missing aria-label | `board-canvas.tsx:707` | Add `aria-label` |
| No skip link | `layout.tsx` | Add "Skip to content" |

### Images
| Issue | File | Fix |
|-------|------|-----|
| Uploads are PNG only | `api/upload/route.ts:74` | Convert to WebP |
| No apple-touch-icon | `public/` | Add 180x180 PNG |

---

## Copy Improvements

### Headlines (Keep)
- "One million PIXELS."
- "Zero mercy on supply"
- "The board never forgets who was early"

### Copy Edits Needed

| Current | Edit | File |
|---------|------|------|
| "The board...The board" | "The price rises as the board fills. It never forgets who was early." | `hero.tsx:30-31` |
| "Tokens get burned" (passive) | "Your tokens burn" | `how-it-works/page.tsx:221` |
| "No tokens are charged" | "You're not charged." | `how-it-works/page.tsx:19` |
| "24h" vs "24 hours" | Standardize to "24 hours" | Multiple files |

### CTA Standardization
| Location | Current | Recommended |
|----------|---------|-------------|
| Hero | "Claim your pixels" | Keep |
| $BLOK page | "Launch the board" | "Claim your pixels" |
| Board | "Reserve zone" | Keep |

### Add Social Proof
- Add to hero: "X zones claimed by Y wallets"
- Add real-time burn counter prominently

---

## AI SEO Gaps

| Gap | Priority | Fix |
|-----|----------|-----|
| No `llms.txt` | High | Create `/public/llms.txt` |
| No `pricing.md` | High | Create `/public/pricing.md` |
| No FAQPage schema | Medium | Add to How It Works |
| No extractable definitions | Medium | Add "What is BLOK?" block |
| No comparison content | Medium | Create "BLOK vs r/place" page |
| No freshness signals | Low | Add "Last updated" dates |

---

## Marketing Strategy Summary

### Positioning (April Dunford)
**Category to create:** "On-chain real estate for communities"
**Not:** "Collaborative pixel canvas" (loses to r/place)

### Core Message (Seth Godin)
**Lead with:** The burn mechanic (Purple Cow)
**Not:** The pixels (table stakes)

### Offer Stack (Hormozi)
Add:
- Tier 1 OG Badge NFT
- Burn verification page
- Project link on zone
- Time-lapse inclusion

### Growth Loops (Brian Balfour)
Missing:
- Referral program
- Share incentives
- Competition mechanics

---

## Quick Wins (< 30 min each)

| # | Task | Impact | Effort |
|---|------|--------|--------|
| 1 | Fix OG image branding | High | 5 min |
| 2 | Add Plausible analytics | Critical | 10 min |
| 3 | Remove /gallery from footer + sitemap | Medium | 5 min |
| 4 | Fix yellow chip contrast | High | 5 min |
| 5 | Add `useMemo` to occupancy | High | 5 min |
| 6 | Create llms.txt | Medium | 15 min |
| 7 | Add burn counter to homepage | High | 30 min |
| 8 | Add "X zones claimed" social proof | High | 20 min |

---

## Files to Modify

### Critical (Do Today)
- `src/app/opengraph-image.tsx` - Fix branding
- `src/app/zone/[id]/opengraph-image.tsx` - Fix branding
- `src/components/ui/chip.tsx` - Fix contrast
- `src/components/footer.tsx` - Remove dead link
- `src/app/sitemap.ts` - Remove /gallery
- `src/app/layout.tsx` - Add analytics

### High Priority (This Week)
- `src/components/board/board-canvas.tsx` - Performance + a11y
- `src/components/board/selection-panel.tsx` - Add memo
- `src/components/hero.tsx` - Add social proof
- `public/llms.txt` - Create for AI SEO
- `public/pricing.md` - Create for AI agents

### Medium Priority (This Month)
- `src/app/how-it-works/page.tsx` - Copy edits + FAQPage schema
- `src/app/blok/page.tsx` - Copy edits
- `src/app/board/page.tsx` - Font sizes
- `src/app/api/upload/route.ts` - WebP conversion

---

## Marketing Action Plan

### Phase 1: Launch Readiness (This Week)
1. Fix all critical bugs (branding, contrast, dead links)
2. Add analytics tracking
3. Add burn counter + social proof
4. Create llms.txt and pricing.md

### Phase 2: Community Building (Week 2-3)
1. Setup Discord with proper structure
2. Launch Twitter with daily content
3. Seed 5-10 KOL zones
4. Run first art contest

### Phase 3: Growth Mechanics (Week 4+)
1. Implement referral program
2. Add tier countdown urgency
3. Partner with memecoin communities
4. Launch paid ads on Twitter/X

---

## Score Summary by Skill

| Phase | Skill | Score |
|-------|-------|-------|
| 1 | frontend-design | B+ |
| 1 | ui-ux-pro-max | B+ |
| 1 | image | C+ |
| 2 | copywriting | B+ |
| 2 | copy-editing | B+ |
| 2 | content-strategy | C |
| 2 | marketing-psychology | B |
| 3 | seo-audit | B |
| 3 | ai-seo | D+ |
| 3 | analytics | F |
| 4 | marketing-ideas | N/A |
| 4 | marketing-plan | N/A |
| 4 | ads | N/A |
| 4 | ad-creative | N/A |
| 4 | community-marketing | N/A |
| 5 | offers | B- |
| 5 | onboarding | B- |
| 5 | marketing-council | B- |

---

## Next Steps

1. **Fix critical issues first** - 30 minutes of work
2. **Add analytics** - Cannot improve what you can't measure
3. **Strengthen social proof** - Burn counter, zone count, wallet count
4. **Build community infrastructure** - Discord, Twitter presence
5. **Launch with coordinated push** - Memecoin partnerships, KOL seeding
