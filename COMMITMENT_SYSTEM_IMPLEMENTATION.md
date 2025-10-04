# Action Commitments System - Implementation Guide

## ✅ **Phase 1: Core Infrastructure (COMPLETED)**

### 1. Type Definitions (`src/types/commitments.ts`)
Complete TypeScript type system for the entire commitments feature:
- **Commitment Types**: Financial, Action, Hybrid
- **Status Flow**: ACTIVE → ACTION_PENDING → ACTION_PROOF_SUBMITTED → ACTION_COMPLETED
- **Action Categories**: Community Service, Church Service, Charity, etc.
- **Proof System**: Photo/video upload with metadata
- **Service Statistics**: Tracking hours, completions, streaks
- **Redemption Wall**: Public feed of redemption stories

### 2. API Service Layer (`src/services/commitmentService.ts`)
Comprehensive service class with all backend endpoints:
- ✅ Create commitment
- ✅ Report relapse
- ✅ Submit proof with media upload
- ✅ Verify proof (partner action)
- ✅ Browse available actions
- ✅ Fetch service statistics
- ✅ Redemption wall feed
- ✅ Alternative options (pay to skip, accept failure)
- ✅ Nearby location finder

### 3. Redux State Management (`src/store/slices/commitmentsSlice.ts`)
Full Redux Toolkit slice with async thunks:
- **State**: Commitments, actions, proofs, stats, redemption stories
- **Thunks**: All async operations for commitment lifecycle
- **Loading States**: Granular loading flags for different operations
- **Error Handling**: Comprehensive error management
- ✅ Integrated into root store with persistence

### 4. UI Screens Created
- ✅ **ChooseCommitmentTypeScreen**: Select Financial/Action/Hybrid
- ✅ **BrowseActionsScreen**: Browse and filter available actions

---

## 🚧 **Phase 2: Remaining Screens (TO DO)**

### Screen 3: Action Details Screen
**File**: `src/screens/commitments/ActionDetailsScreen.tsx`

**Purpose**: Show full action details before confirming selection

**Features**:
- Full action description
- Proof requirements with examples
- Safety guidelines (if applicable)
- Estimated time commitment
- "What happens after relapse" explanation
- Continue button → Navigate to SetTargetDateScreen

**API Calls**: None (uses selected action from Redux)

---

### Screen 4: Set Target Date & Partner Screen
**File**: `src/screens/commitments/SetTargetDateScreen.tsx`

**Purpose**: User sets target clean date and selects accountability partner

**Features**:
- Date picker (minimum 1 day, maximum 90 days in future)
- Partner selector dropdown
  - Fetches from existing partners (use `partnerService`)
  - Search/filter partners
  - Option to invite new partner
- Checkbox: "Require partner verification" (default: ON)
- Checkbox: "Allow community to see my redemption story" (default: OFF)
- Form validation
- Continue button → Navigate to ReviewCommitmentScreen

**API Calls**: 
- GET `/api/partners` (existing partner service)

---

### Screen 5: Review & Confirm Screen
**File**: `src/screens/commitments/ReviewCommitmentScreen.tsx`

**Purpose**: Final review before creating commitment

**Features**:
- Summary card showing:
  - Commitment type
  - Selected action
  - Target date
  - Partner name
  - Proof requirements
  - Deadline (48 hours after relapse)
- Big "I Commit to This" button
- Back button to edit

**API Calls**:
- POST `/api/commitments` (calls `createCommitment` thunk)

**On Success**: Navigate to SuccessScreen

---

### Screen 6: Success Screen
**File**: `src/screens/commitments/CommitmentSuccessScreen.tsx`

**Purpose**: Celebration and confirmation

**Features**:
- Celebration animation
- "Your commitment is active!" message
- Countdown to target date
- Navigate to dashboard button
- Share commitment option (optional)

**API Calls**: None

---

### Screen 7: Active Commitment Dashboard
**File**: `src/screens/commitments/ActiveCommitmentDashboardScreen.tsx`

**Purpose**: View active commitment and report relapse

**Features**:
- Commitment card with:
  - Days until target date
  - Action details
  - Partner info
  - Progress indicator
- Red "I Relapsed" button (requires confirmation)
- "View Action Details" button
- Statistics section

**API Calls**:
- GET `/api/users/:userId/commitments` (on mount)
- POST `/api/commitments/:id/report-relapse` (on relapse button)

---

### Screen 8: Relapse Confirmation Dialog
**File**: Component inside ActiveCommitmentDashboardScreen

**Purpose**: Heavy confirmation before reporting relapse

**Features**:
- Modal dialog
- Shows consequences
- "You'll need to complete: [Action Title]"
- "You have 48 hours to upload proof"
- "This cannot be undone" warning
- Cancel button (easy to click)
- "Yes, I Relapsed" button (requires 3-second hold)

**On Confirm**: Update commitment status → Navigate to ActionPendingScreen

---

### Screen 9: Action Pending Screen
**File**: `src/screens/commitments/ActionPendingScreen.tsx`

**Purpose**: Show action to complete and deadline

**Features**:
- Empathetic message
- Action details card
- Big countdown timer (48 hours)
- Instructions for completing action
- "Upload Proof" button (glowing/pulsing)
- "Find Nearby Locations" button (if applicable)
- Tips for completing the action

**API Calls**:
- GET `/api/commitments/:id/check-deadline` (periodic check)
- GET `/api/actions/nearby` (if user clicks location button)

---

### Screen 10: Upload Proof Screen
**File**: `src/screens/commitments/UploadProofScreen.tsx`

**Purpose**: Capture and upload proof media

**Features**:
- Native camera integration (no gallery uploads)
- GPS location capture
- Timestamp watermark
- Preview media before submission
- Add optional notes (500 char max)
- Retake option
- Submit button

**API Calls**:
- POST `/api/commitments/:id/submit-proof` (multipart/form-data)

**On Success**: Navigate to ProofSubmittedScreen

---

### Screen 11: Proof Submitted Screen
**File**: `src/screens/commitments/ProofSubmittedScreen.tsx`

**Purpose**: Confirmation of proof submission

**Features**:
- "Proof submitted!" message
- If partner verification required:
  - "Waiting for [Partner Name] to verify"
  - Show submitted proof
  - Metadata (timestamp, location)
- If no partner:
  - "Auto-verifying in 24 hours"
- Back to dashboard button

**API Calls**: None (proof already submitted)

---

### Screen 12: Partner Verification Screen
**File**: `src/screens/commitments/PartnerVerificationScreen.tsx`

**Purpose**: Partner verifies submitted proof

**Features**:
- Commitment details summary
- Full-screen proof media (zoomable)
- Metadata display (time, location, notes)
- Verification guidelines
- Approve button (green)
- Reject button (red)
- If approving: Optional encouragement message field
- If rejecting: Required rejection reason dropdown

**API Calls**:
- GET `/api/proofs/:id` (on mount)
- POST `/api/commitments/:id/verify-proof`

**On Success**: Show confirmation toast → Navigate back

---

### Screen 13: Service Stats Screen
**File**: `src/screens/commitments/ServiceStatsScreen.tsx`

**Purpose**: View personal impact statistics

**Features**:
- Hero stats card:
  - Total service hours
  - Total actions completed
  - Money donated (if hybrid)
  - Current redemption streak
- Visual charts (pie, bar)
- Timeline of completed actions
- Badges earned
- Map view of service locations

**API Calls**:
- GET `/api/users/:userId/service-stats`

---

### Screen 14: Redemption Wall (Community Feed)
**File**: `src/screens/commitments/RedemptionWallScreen.tsx`

**Purpose**: Public feed of redemption stories

**Features**:
- Feed of redemption cards:
  - Anonymous user name
  - Action completed
  - Photo (if shared)
  - Reflection text
  - Service hours
  - Date completed
  - Encourage button
  - Comment button
- Infinite scroll pagination
- Filter by category
- Sort options

**API Calls**:
- GET `/api/redemption-wall` (with pagination)
- POST `/api/redemption-wall/:id/encourage`

---

### Screen 15: Deadline Warning Screen
**File**: Component/Modal integrated into ActiveCommitmentDashboardScreen

**Purpose**: Alert user when deadline is approaching

**Features**:
- Red banner: "⚠️ Only 2 hours left!"
- Action details
- "Upload Proof Now" button (pulsing)
- Push notifications at:
  - 24 hours remaining
  - 12 hours remaining
  - 2 hours remaining
  - 1 hour remaining

---

### Screen 16: Deadline Missed Screen
**File**: `src/screens/commitments/DeadlineMissedScreen.tsx`

**Purpose**: Handle missed deadline scenario

**Features**:
- Full-screen takeover
- "Action Deadline Missed" message
- Explanation of what happened
- Three options:
  1. Complete it anyway (late submission)
  2. Pay to skip ($X to charity)
  3. Accept failure (mark commitment failed)
- Each option shows consequences

**API Calls**:
- GET `/api/commitments/:id/check-deadline`
- POST `/api/commitments/:id/pay-to-skip` (if pay option)
- POST `/api/commitments/:id/accept-failure` (if accept option)

---

## 🔧 **Phase 3: Components & Utilities (TO DO)**

### Components to Create

1. **CommitmentCard** (`src/components/CommitmentCard.tsx`)
   - Reusable card for displaying commitment summary
   - Used in dashboard, lists, review screens

2. **ActionCard** (`src/components/ActionCard.tsx`)
   - Reusable card for displaying action details
   - Used in browse, details, pending screens

3. **CountdownTimer** (`src/components/CountdownTimer.tsx`)
   - Animated countdown display
   - Shows time remaining until deadline
   - Different urgency colors

4. **ProofMediaViewer** (`src/components/ProofMediaViewer.tsx`)
   - Full-screen photo/video viewer
   - Zoom, pinch gestures
   - Shows metadata overlay

5. **ServiceStatsChart** (`src/components/ServiceStatsChart.tsx`)
   - Charts for stats visualization
   - Pie chart (breakdown by category)
   - Bar chart (actions per month)
   - Use `react-native-svg` or `react-native-chart-kit`

6. **BadgeDisplay** (`src/components/BadgeDisplay.tsx`)
   - Display earned badges
   - Locked vs unlocked states
   - Achievement animations

### Utilities

1. **Notification Scheduler** (`src/utils/commitmentNotifications.ts`)
   - Schedule reminders for deadlines
   - Handle push notification registration
   - Use `@react-native-firebase/messaging`

2. **Camera Utility** (`src/utils/cameraHelper.ts`)
   - Wrapper for camera access
   - GPS location capture
   - Timestamp watermarking
   - Use `react-native-image-picker` or `react-native-camera`

3. **Date Helpers** (`src/utils/commitmentDateHelpers.ts`)
   - Calculate hours remaining
   - Format countdown displays
   - Validate target dates

---

## 🗄️ **Phase 4: Backend API Requirements**

### API Endpoints to Implement (Backend Team)

#### Commitments
- [x] `POST /api/commitments` - Create new commitment
- [x] `GET /api/commitments/:id` - Get commitment details
- [x] `GET /api/users/:userId/commitments` - List user's commitments
- [x] `POST /api/commitments/:id/report-relapse` - Report relapse
- [x] `GET /api/commitments/:id/check-deadline` - Check deadline status

#### Actions
- [x] `GET /api/actions` - List available actions (with filters)
- [x] `GET /api/actions/:id` - Get action details
- [x] `GET /api/actions/nearby` - Find nearby locations

#### Proofs
- [x] `POST /api/commitments/:id/submit-proof` - Upload proof (multipart)
- [x] `GET /api/proofs/:id` - View proof details
- [x] `POST /api/commitments/:id/verify-proof` - Partner verification
- [x] `POST /api/proofs/:id/resubmit` - Resubmit after rejection

#### Stats & Community
- [x] `GET /api/users/:userId/service-stats` - User statistics
- [x] `GET /api/redemption-wall` - Public feed (paginated)
- [x] `POST /api/redemption-wall/:id/encourage` - Encourage story
- [x] `GET /api/leaderboards` - Top contributors

#### Alternatives
- [x] `POST /api/commitments/:id/pay-to-skip` - Pay to skip action
- [x] `POST /api/commitments/:id/accept-failure` - Accept failure

### Database Schema Required

#### Commitments Table
```sql
CREATE TABLE commitments (
  id UUID PRIMARY KEY,
  user_id INTEGER NOT NULL,
  commitment_type ENUM('FINANCIAL', 'ACTION', 'HYBRID'),
  status ENUM('ACTIVE', 'ACTION_PENDING', 'ACTION_PROOF_SUBMITTED', 'ACTION_COMPLETED', 'ACTION_OVERDUE', 'COMPLETED', 'FAILED'),
  action_id UUID,
  custom_action_description TEXT,
  financial_amount INTEGER,
  target_date TIMESTAMP NOT NULL,
  partner_id INTEGER,
  require_partner_verification BOOLEAN DEFAULT TRUE,
  allow_public_share BOOLEAN DEFAULT FALSE,
  relapse_reported_at TIMESTAMP,
  action_deadline TIMESTAMP,
  action_completed_at TIMESTAMP,
  proof_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Actions Table
```sql
CREATE TABLE available_actions (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('COMMUNITY_SERVICE', 'CHURCH_SERVICE', 'CHARITY_DONATION', 'HELPING_INDIVIDUALS', 'ENVIRONMENTAL', 'EDUCATIONAL', 'CUSTOM'),
  difficulty ENUM('EASY', 'MEDIUM', 'HARD'),
  estimated_hours DECIMAL(4,1),
  proof_instructions TEXT NOT NULL,
  requires_location BOOLEAN DEFAULT FALSE,
  location_radius INTEGER,
  is_custom BOOLEAN DEFAULT FALSE,
  icon VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Action Proofs Table
```sql
CREATE TABLE action_proofs (
  id UUID PRIMARY KEY,
  commitment_id UUID NOT NULL REFERENCES commitments(id),
  user_id INTEGER NOT NULL,
  media_type ENUM('photo', 'video'),
  media_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  user_notes TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address VARCHAR(500),
  captured_at TIMESTAMP NOT NULL,
  submitted_at TIMESTAMP NOT NULL,
  partner_approved BOOLEAN,
  verified_by INTEGER,
  verified_at TIMESTAMP,
  rejection_reason ENUM('face_not_visible', 'wrong_location', 'not_showing_action', 'suspicious', 'other'),
  rejection_notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  attempt_number INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Service Stats Table
```sql
CREATE TABLE user_service_stats (
  user_id INTEGER PRIMARY KEY,
  total_service_hours DECIMAL(10, 1) DEFAULT 0,
  total_money_donated INTEGER DEFAULT 0,
  total_actions_completed INTEGER DEFAULT 0,
  clean_streak INTEGER DEFAULT 0,
  redemption_streak INTEGER DEFAULT 0,
  longest_clean_streak INTEGER DEFAULT 0,
  total_relapses INTEGER DEFAULT 0,
  completion_rate DECIMAL(5, 2) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW()
);
```

---

## 📱 **Phase 5: Navigation Integration (TO DO)**

### Add Commitment Screens to Navigation Stack

**File**: `src/navigation/AppNavigator.tsx` (or wherever your stack is defined)

```typescript
// Add to your main stack navigator
<Stack.Screen 
  name="ChooseCommitmentType" 
  component={ChooseCommitmentTypeScreen} 
  options={{ headerShown: false }}
/>
<Stack.Screen 
  name="BrowseActions" 
  component={BrowseActionsScreen} 
  options={{ headerShown: false }}
/>
<Stack.Screen 
  name="ActionDetails" 
  component={ActionDetailsScreen} 
  options={{ headerShown: false }}
/>
<Stack.Screen 
  name="SetTargetDate" 
  component={SetTargetDateScreen} 
  options={{ headerShown: false }}
/>
<Stack.Screen 
  name="ReviewCommitment" 
  component={ReviewCommitmentScreen} 
  options={{ headerShown: false }}
/>
<Stack.Screen 
  name="CommitmentSuccess" 
  component={CommitmentSuccessScreen} 
  options={{ headerShown: false }}
/>
<Stack.Screen 
  name="ActiveCommitmentDashboard" 
  component={ActiveCommitmentDashboardScreen} 
  options={{ headerShown: false }}
/>
<Stack.Screen 
  name="ActionPending" 
  component={ActionPendingScreen} 
  options={{ headerShown: false }}
/>
<Stack.Screen 
  name="UploadProof" 
  component={UploadProofScreen} 
  options={{ headerShown: false }}
/>
<Stack.Screen 
  name="ProofSubmitted" 
  component={ProofSubmittedScreen} 
  options={{ headerShown: false }}
/>
<Stack.Screen 
  name="PartnerVerification" 
  component={PartnerVerificationScreen} 
  options={{ headerShown: false }}
/>
<Stack.Screen 
  name="ServiceStats" 
  component={ServiceStatsScreen} 
  options={{ headerShown: false }}
/>
<Stack.Screen 
  name="RedemptionWall" 
  component={RedemptionWallScreen} 
  options={{ headerShown: false }}
/>
<Stack.Screen 
  name="DeadlineMissed" 
  component={DeadlineMissedScreen} 
  options={{ headerShown: false }}
/>
```

### Add Entry Points

**In HubScreen or HomeScreen**:
```typescript
<TouchableOpacity onPress={() => navigation.navigate('ChooseCommitmentType')}>
  <Text>Create Commitment</Text>
</TouchableOpacity>

<TouchableOpacity onPress={() => navigation.navigate('ActiveCommitmentDashboard')}>
  <Text>View My Commitment</Text>
</TouchableOpacity>

<TouchableOpacity onPress={() => navigation.navigate('ServiceStats')}>
  <Text>My Service Stats</Text>
</TouchableOpacity>

<TouchableOpacity onPress={() => navigation.navigate('RedemptionWall')}>
  <Text>Community Redemption Wall</Text>
</TouchableOpacity>
```

---

## 🧪 **Phase 6: Testing Checklist**

### Unit Tests
- [ ] Redux slice actions
- [ ] Service API methods
- [ ] Date calculation utilities
- [ ] Form validation logic

### Integration Tests
- [ ] Complete commitment creation flow
- [ ] Relapse reporting flow
- [ ] Proof submission and verification flow
- [ ] Stats calculation

### E2E Tests
- [ ] Create commitment → Report relapse → Submit proof → Partner verifies
- [ ] Deadline expiration handling
- [ ] Alternative options (pay to skip, accept failure)

---

## 📦 **Dependencies to Install**

```bash
# Camera & Media
npm install react-native-image-picker
npm install react-native-camera

# Charts & Visualization
npm install react-native-svg
npm install react-native-chart-kit

# Date/Time
npm install date-fns  # Already might be installed

# Location
npm install @react-native-community/geolocation

# Already in your project (verify):
# - @react-native-firebase/messaging (for notifications)
# - react-native-paper (UI components)
# - @reduxjs/toolkit (state management)
# - axios (API calls)
```

---

## 🚀 **Deployment Checklist**

### Before Launch
- [ ] All screens implemented and tested
- [ ] Backend APIs deployed and tested
- [ ] Database migrations run
- [ ] Push notifications configured
- [ ] S3/Cloud storage for media uploads configured
- [ ] Cron jobs for deadline checks set up
- [ ] Partner notification emails/push configured
- [ ] Seed database with initial actions
- [ ] Test payment integration (for pay-to-skip)

### Post-Launch Monitoring
- [ ] Track commitment completion rates
- [ ] Monitor proof submission rates
- [ ] Track partner verification response times
- [ ] Monitor deadline expiration rates
- [ ] Track redemption wall engagement

---

## 💡 **Implementation Priority**

### Week 1: Core Flow
1. ✅ Type definitions
2. ✅ API service layer
3. ✅ Redux slice
4. ✅ ChooseCommitmentTypeScreen
5. ✅ BrowseActionsScreen
6. ActionDetailsScreen
7. SetTargetDateScreen
8. ReviewCommitmentScreen
9. CommitmentSuccessScreen

### Week 2: Active Commitment
10. ActiveCommitmentDashboardScreen
11. Relapse confirmation dialog
12. ActionPendingScreen
13. UploadProofScreen
14. ProofSubmittedScreen

### Week 3: Verification & Stats
15. PartnerVerificationScreen
16. ServiceStatsScreen
17. RedemptionWallScreen

### Week 4: Edge Cases & Polish
18. DeadlineMissedScreen
19. Notification system
20. Components & utilities
21. Testing & bug fixes

---

## 📝 **Notes for Backend Team**

1. **Media Upload**: 
   - Use S3 or equivalent for storing photos/videos
   - Generate thumbnails for videos automatically
   - Validate EXIF data for timestamps
   - Store GPS coordinates in database

2. **Cron Jobs**:
   - Hourly check for expired deadlines
   - Daily reminder notifications
   - Auto-approve proofs after 24 hours (no partner response)

3. **Push Notifications**:
   - Partner receives notification when proof submitted
   - User receives notification when proof verified/rejected
   - Deadline reminder notifications (24h, 12h, 2h, 1h)

4. **Fraud Prevention**:
   - Store EXIF metadata
   - Log GPS coordinates
   - Partner verification as main safeguard
   - Flag suspicious patterns (too many resubmissions)

5. **Privacy**:
   - Allow anonymous sharing on redemption wall
   - User controls whether story is public
   - GDPR compliance for stored photos

---

## 🎯 **Success Metrics**

Track these metrics to measure feature success:
- Commitment creation rate
- Commitment completion rate (reached target date without relapse)
- Action completion rate (after relapse)
- Average partner verification time
- Redemption wall engagement (views, encouragements)
- User retention after first commitment

---

This implementation guide provides a complete roadmap for building the Action Commitments System. The foundation is solid with types, services, and Redux state management in place. The remaining work focuses on UI screens, components, and integration with the backend APIs.
