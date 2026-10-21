# WhatsApp → CosmicSpirit0: a feature teardown

**Scope and method.** This is a behavioural feature teardown of WhatsApp's publicly
observable product surface (the web/app interface, WhatsApp Help Center, and the
flows a normal user sees). It is **not** a code-level extraction, it does not touch
private messages, and it does not claim access to WhatsApp's servers, encryption, or
internal ranking systems. The goal is to identify the *product primitives* that make
group conversation feel dependable, then rebuild the ones that fit a sound-practice
community.

Date: 21 October 2026.

---

## 1. The primitives that make WhatsApp feel like WhatsApp

| Primitive | What the user experiences | Why it matters |
|---|---|---|
| Persistent identity | One account, one profile, one phone number; your chats follow you across devices | People recognise each other without re-introducing themselves |
| Conversation list | One inbox ordered by recent activity, with unread counts | The app always answers “what needs me now?” |
| Thread | A bounded, chronological conversation with a clear composer | Low-friction turn-taking |
| Groups | Named space, member list, roles, invite link, join by link | Small communities form without a server admin |
| Shared objects | Links, media, documents and forwarded messages appear inside the thread | Conversation and content live together |
| Delivery state | Sending → sent → delivered → read ticks | Removes uncertainty about whether a message landed |
| Presence / last seen | Optional signal that a person is reachable | Sets expectations without demanding a reply |
| Notifications | Per-chat mute, unread badges, mention highlights | Attention stays under the user's control |
| Safety controls | Block, report, leave, admin removal, E2E encryption | People can exit or escalate without confrontation |
| Onboarding by invitation | A link or QR code is enough to join | Growth is social, not algorithmic |

The important lesson is not the specific colour scheme. It is that **identity,
threads, invitations, unread state, and exit controls** are the minimum viable
social contract.

---

## 2. Flow inventory (observed behaviour)

### 2.1 First run
1. Install / open → enter a phone number → verify a code.
2. Set a display name and (optionally) a photo.
3. Land on an empty chat list with a single obvious action: start a chat.

### 2.2 One-to-one chat
1. Search or pick a contact.
2. Thread opens at the latest message.
3. Composer accepts text, attachments, voice notes, emoji, replies.
4. Long-press a message → reply, forward, copy, star, delete, report.
5. Ticks communicate delivery and read state.

### 2.3 Group creation
1. New group → choose members → name the group → optional photo.
2. Creator becomes admin; admins can add/remove members and edit group info.
3. Group appears in the same conversation list as direct chats.
4. Members can leave; admins can remove.
5. Invite links let a person join without being added manually.

### 2.4 Shared content
- Media and documents render inline with a caption.
- Forwarding preserves the object, not the original thread.
- Links get a preview card.
- A shared object can be opened without leaving the conversation.

### 2.5 Attention management
- Unread count per chat; a global badge.
- Mute per chat; mention-only notifications.
- Archived chats move out of the main list without deleting them.

### 2.6 Safety and moderation
- Block a person; report a message or account.
- Group admins can remove members and delete messages for everyone.
- End-to-end encryption is the default for personal messages, with a clear
  per-chat notice.

### 2.7 What WhatsApp deliberately does *not* do
- No public follower graph, no global feed, no algorithmic discovery.
- No public “like” counts on messages.
- No open directory of phone numbers.
- No web-scale public profiles.

That restraint is part of why it feels private. We should copy the restraint, not
just the features.

---

## 3. What we built (and why)

Our community layer is called **Community**, with three surfaces: **Shared presets**,
**Circles**, and **Profile**. It maps the useful primitives without pretending to be
a messenger.

| WhatsApp primitive | CosmicSpirit0 implementation | Notes |
|---|---|---|
| Account + profile | Supabase Auth email/password, `profiles` row created by trigger | People, not bots: one account per person, no anonymous posting |
| Display name / handle | `display_name`, unique `handle`, short bio | Handle is editable; collisions return a clear error |
| Conversation list | Circles list ordered by creation, with member counts | No global feed and no ranking |
| Thread | Circle chat with chronological messages and a composer | Polls every 6 seconds while open; no websocket dependency |
| Groups | Public/private circles, owner/admin/member roles, invite code + link | Owner joins automatically via trigger |
| Invite link | `?circle=CODE` deep link auto-joins after sign-in | Link can be copied from the circle panel |
| Shared object | Attach one of your presets to a message; recipient taps to load it in the lab | This is the core “content lives in the conversation” idea |
| Unread state | `last_read_at` per member; marked read when the thread opens | Unread badge UI is a next step |
| Exit controls | Leave circle; owners are told to transfer/delete first | Reporting/blocking is a next step |
| Moderation | RLS + admin role + review queues for public reviews | No fake engagement metrics |
| Presence | Not implemented | Avoids pressure and surveillance; can add opt-in later |
| E2E encryption | Not claimed | We use TLS + Supabase RLS; we must never imply E2E |

### 3.1 Presets as first-class shared objects
WhatsApp's shared media works because the object is durable and openable. Our
equivalent is a **preset**: an exact lab configuration with a title, notes, owner,
play count, and reviews.

- Labs publish with **Save as preset** (Rate, Place, Frequency).
- Community → Shared presets lists public presets, filterable by lab and sortable by
  newest / top rated / most played.
- “Use in lab” stores the preset for the target lab and navigates there; the lab
  applies the saved configuration on mount.
- Reviews are one-per-person, 1–5 stars plus optional notes. Aggregate rating is
  maintained by a database trigger, not client arithmetic.
- Likes are a lightweight signal, not a popularity contest; there is no global
  leaderboard.

### 3.2 Streaks and session history
A session is recorded when playback stops (or the lab unmounts) and lasts at least
10 seconds. The `record_session` database function:

- inserts a `sessions` row,
- increments total sessions and minutes,
- advances the streak if the last session was yesterday,
- resets it to 1 if the streak was broken,
- keeps the longest streak.

Only the owner can read their sessions. The Profile tab shows the last 30.

This mirrors WhatsApp's “history is yours” stance: your practice history is not a
public scoreboard.

### 3.3 Share cards
After a session, a canvas-generated 1080×1350 PNG can be downloaded or shared via
the Web Share API. Cards contain only what the user saw: lab, duration, frequency,
mode, score, or profile stats. They never include health or performance claims.

---

## 4. Deliberate omissions

- **No phone-number identity.** Email accounts keep the barrier low and avoid
  importing contact graphs.
- **No E2E claim.** Messages are protected by TLS and RLS, not end-to-end
  encryption. Saying otherwise would be false.
- **No public follower counts or global feed.** The community is organised around
  shared practice, not influence.
- **No status/stories or calls.** They add surface area without serving the core
  loop (tune → share → try → reflect).
- **No message forwarding.** A preset can be re-shared, but there is no
  one-tap forward that strips context.
- **No automated direct messages.** All messages are written by signed-in people.
- **No read receipts.** `last_read_at` powers unread state but is never shown to
  other members as “read at”.

---

## 5. Implementation notes

- Database: `supabase/migrations/20261021_social_layer.sql`.
- Tables: `profiles`, `presets`, `preset_reviews`, `preset_likes`, `sessions`,
  `circles`, `circle_members`, `circle_messages`.
- RLS: public reads for public profiles/presets/reviews; owner-only writes; circle
  messages readable only by members; sessions readable only by their owner.
- Functions: `record_session`, `join_circle`, `mark_circle_read`,
  `increment_preset_plays`, `is_circle_member`.
- Frontend: `src/lib/auth.tsx`, `src/lib/social.ts`,
  `src/components/CommunityPage.tsx` and its three panels.
- Auth: email/password with auto-confirm enabled so people can start immediately.
  No email is added to the newsletter automatically.

## 6. Next steps (ordered by user value)

1. Unread badges and per-circle mute.
2. Real-time message updates (Supabase Realtime) instead of polling.
3. Report/block controls and an admin moderation queue for circle messages.
4. Preset revisions and “remix” attribution.
5. Owner transfer / circle deletion flow.
6. Optional avatar upload with Supabase Storage.
7. Weekly digest email of new public presets (opt-in only).
