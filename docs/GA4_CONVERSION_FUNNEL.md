# GA4 Conversion Funnel & Registration Tracking

This document provides templates for tracking user conversion funnels and analyzing registration incentives in Google Analytics 4.

## 1) Registration Conversion Funnel

### Events in the Funnel

The app now tracks a complete registration conversion funnel:

1. **`registration_prompt`** - Banner shown to guest users with progress
2. **`registration_intent`** - User clicks "Sign Up" button
3. **User Registration** - Account created (track via auth system)

### Event Parameters

#### `registration_prompt`

- `trigger`: Always `quran_progress` (where banner appears)
- `completed_suras`: Number of surahs completed by guest
- `page_path`: Always `/quran`

#### `registration_intent`

- `source`: Always `progress_banner` (distinguishes from other registration CTAs)
- `completed_suras`: Number of surahs completed at click time
- `page_path`: Always `/quran`

## 2) Custom Dimensions Setup

In **GA4 Admin → Custom definitions**, add these event-scoped dimensions:

1. **`trigger`** (parameter: `trigger`) - Type: Text
2. **`completed_suras`** (parameter: `completed_suras`) - Type: Number
3. **`action`** (parameter: `action`) - Type: Text
4. **`is_authenticated`** (parameter: `is_authenticated`) - Type: Text
5. **`version`** (parameter: `version`) - Type: Text

## 3) Exploration: Registration Conversion Funnel

### Setup in GA4

1. Go to **Explore** → Create new **Funnel exploration**
2. Configure steps:

**Step 1: Banner Shown**

- Event name = `registration_prompt`
- Optional filter: `trigger = quran_progress`

**Step 2: Click Intent**

- Event name = `registration_intent`
- Optional filter: `source = progress_banner`

**Step 3: Registration Complete**

- Event name = `sign_up` (or your auth event)
- Optional filter: `method` contains relevant value

3. Set time constraint: **Within 1 day** (or adjust based on typical flow)
4. Add breakdown by `completed_suras` to see which progress levels convert best

### Key Metrics to Track

- **Impression to Click Rate**: (registration_intent / registration_prompt) × 100%
- **Click to Registration Rate**: (sign_up / registration_intent) × 100%
- **Overall Conversion Rate**: (sign_up / registration_prompt) × 100%
- **Progress Threshold Analysis**: At what `completed_suras` count do users convert most?

### Expected Benchmarks

- **Impression to Click**: 10-25% (good incentive messaging)
- **Click to Registration**: 30-60% (smooth registration flow)
- **Overall Conversion**: 5-15% (depends on friction)

## 4) Exploration: Bookmark Behavior Analysis

### Setup Free Form Exploration

**Filters:**

- Event name = `bookmark_action`

**Rows:**

- `action` (create vs delete_confirmed)
- `sura_id`
- `sura_name_en`

**Values:**

- Event count
- Total users

**Breakdowns:**

- Session source/medium
- Device category

### Insights to Look For

- **Most bookmarked surahs**: Which are users saving for later?
- **Delete confirmation effectiveness**: How many users confirm deletion vs cancel?
- **Bookmark churn**: Users who create then delete quickly (possible UX issue)

## 5) Exploration: Progress Sync Patterns

### Setup Free Form Exploration

**Filters:**

- Event name = `quran_progress`

**Rows:**

- `action` (saved_local vs synced_db)
- `completed_count` (group into ranges: 1-5, 6-20, 21-50, 51+)
- `is_authenticated`

**Values:**

- Event count
- Users
- Sessions

### Key Questions to Answer

1. **Guest vs Authenticated Activity**: What % of progress events are local-only?
2. **Sync Reliability**: Are authenticated users consistently syncing to DB?
3. **Progress Distribution**: Where do most users fall in completion count?
4. **Conversion Trigger Point**: At what `completed_count` do guests register most?

## 6) Exploration: Deployment Engagement

### Setup Free Form Exploration

**Filters:**

- Event name = `deploy_interaction`

**Rows:**

- `version`
- `action` (like vs unlike)

**Values:**

- Event count
- Unique users

### Success Metrics

- **Feature Adoption**: Which versions get most likes?
- **User Engagement**: % of active users who interact with deploys page
- **Feedback Loop**: Correlation between liked features and usage metrics

## 7) Segments for Advanced Analysis

Create these **User segments** in GA4:

### Guest Progress Users

- Condition: `quran_progress` event with `is_authenticated = false`
- Use case: Target for registration campaigns

### Bookmark Power Users

- Condition: `bookmark_action` event count >= 5 in last 30 days
- Use case: Identify highly engaged users

### Progress Champions

- Condition: `quran_progress` event with `completed_count >= 57` (50%+)
- Use case: Feature beta testers, testimonials

### Registration Intent but Incomplete

- Condition: `registration_intent` event BUT no `sign_up` event in 7 days
- Use case: Retargeting campaigns

## 8) Alert Setup Recommendations

In **GA4 Admin → Custom Insights**, create these alerts:

1. **Registration Funnel Drop Alert**
   - Condition: `registration_intent` count drops >30% day-over-day
   - Action: Email notification
   - Purpose: Detect broken registration flow

2. **Bookmark Delete Spike**
   - Condition: `bookmark_action` with `action=delete_confirmed` increases >50% week-over-week
   - Action: Slack notification
   - Purpose: Identify UX frustration

3. **Progress Sync Failure Pattern**
   - Condition: `quran_progress` with `action=saved_local` AND `is_authenticated=true` increases
   - Action: Email to engineering
   - Purpose: Catch DB sync issues

4. **Deploy Engagement Trend**
   - Condition: `deploy_interaction` count drops >40% week-over-week
   - Action: Email to product team
   - Purpose: Monitor changelog visibility

## 9) Dashboard Template

Create a **GA4 Dashboard** named "PEACE2074 Conversion & Engagement" with these cards:

### Card 1: Registration Funnel (Funnel visualization)

- Shows: registration_prompt → registration_intent → sign_up
- Time: Last 30 days
- Dimension: Device category

### Card 2: Progress Distribution (Bar chart)

- Metric: Users
- Dimension: completed_count (grouped)
- Filter: quran_progress event
- Time: Last 7 days

### Card 3: Bookmark Activity (Line chart)

- Metrics: Event count
- Dimensions: action (create vs delete)
- Filter: bookmark_action event
- Time: Last 30 days, by day

### Card 4: Top Bookmarked Surahs (Table)

- Rows: sura_name_en
- Metrics: Event count, Users
- Filter: bookmark_action with action=create
- Time: Last 30 days

### Card 5: Deployment Likes Leaderboard (Table)

- Rows: version
- Metrics: Event count, Unique users
- Filter: deploy_interaction with action=like
- Time: All time

### Card 6: Guest vs Auth Progress (Pie chart)

- Metric: Event count
- Dimension: is_authenticated
- Filter: quran_progress event
- Time: Last 30 days

## 10) Weekly Analysis Checklist

Every Monday, review:

- [ ] Registration conversion rate (target: >8%)
- [ ] Top 5 most bookmarked surahs (inform content strategy)
- [ ] Progress sync failure rate (authenticated users with saved_local)
- [ ] Average `completed_suras` at registration_intent (optimization target)
- [ ] Deploy interaction rate vs active users
- [ ] Any custom alert triggers from past week

## 11) A/B Testing Recommendations

Use GA4 audience segments for these tests:

### Test 1: Registration Banner Copy

- **Control**: Current "Sign up to save your progress..."
- **Variant**: "Don't lose your progress! Create free account"
- **Measure**: registration_intent rate

### Test 2: Bookmark Confirmation Threshold

- **Control**: Confirm on every delete
- **Variant**: No confirmation for bookmarks <7 days old
- **Measure**: bookmark_delete_dialog abandonment rate

### Test 3: Progress Incentive Timing

- **Control**: Show banner at 1+ completed suras
- **Variant A**: Show at 3+ completed suras
- **Variant B**: Show at 5+ completed suras
- **Measure**: Overall conversion rate + user annoyance proxy (immediate abandonment)

## 12) Privacy & Consent Notes

- All events respect consent mode
- `is_authenticated` is boolean, never contains user IDs
- `completed_suras` is aggregate count, not specific sura details
- Apply user data retention policies per GA4 settings (14 months default)

## 13) Export & API Integration

For advanced analysis, export these events to BigQuery:

```sql
-- Registration funnel with timing analysis
SELECT
  user_pseudo_id,
  event_timestamp,
  event_name,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'completed_suras') as completed_suras,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'source') as source
FROM `your-project.analytics_XXXXX.events_*`
WHERE event_name IN ('registration_prompt', 'registration_intent', 'sign_up')
  AND _TABLE_SUFFIX BETWEEN '20260301' AND '20260331'
ORDER BY user_pseudo_id, event_timestamp
```

Analyze:

- Average time from prompt → intent
- Average time from intent → sign_up
- Drop-off patterns

## 14) Next Steps

After deploying these tracking events:

1. **Week 1**: Validate events firing correctly in GA4 DebugView
2. **Week 2**: Create custom dimensions listed above
3. **Week 3**: Build funnel explorations and dashboard
4. **Week 4**: Set up alerts and establish baseline metrics
5. **Month 2+**: Begin A/B testing and optimization cycles

---

**Last Updated**: March 8, 2026  
**Related Docs**: [GA4_ANALYTICS_PLAYBOOK.md](./GA4_ANALYTICS_PLAYBOOK.md)
