# VIN Tournament - Project Documentation

## Overview
VIN Tournament is a modern React-based gaming tournament platform that allows users to create, join, and manage gaming tournaments with real-time features and a sleek gaming-focused UI.

## Tech Stack
- **Frontend**: React 18, Vite
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Project Structure
```
VIN-TOURNAMENT/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx              # Navigation with auth states
│   │   ├── TournamentCard.jsx      # Tournament display card
│   │   └── ErrorBoundary.jsx       # Error handling
│   ├── contexts/
│   │   └── AuthContext.jsx         # Supabase authentication
│   ├── pages/
│   │   ├── Home.jsx               # Landing page
│   │   ├── Tournaments.jsx        # Tournament listing
│   │   ├── TournamentDetail.jsx   # Individual tournament view
│   │   ├── CreateTournament.jsx   # Tournament creation
│   │   ├── Games.jsx              # Supported games
│   │   ├── Login.jsx              # User login
│   │   ├── Register.jsx           # User registration
│   │   ├── Profile.jsx            # User profile management
│   │   ├── Leaderboard.jsx        # Player rankings
│   │   ├── PublicProfile.jsx      # View other players
│   │   └── MyTournaments.jsx      # Organizer dashboard
│   ├── services/
│   │   └── supabaseService.js     # Database operations
│   ├── store/
│   │   ├── store.js               # Redux store
│   │   └── tournamentSlice.js     # Tournament state management
│   └── lib/
│       └── supabase.js            # Supabase client
```

## Database Schema

### Tournaments Table
```sql
tournaments (
  id: SERIAL PRIMARY KEY,
  title: VARCHAR(255) NOT NULL,
  description: TEXT,
  game: VARCHAR(100) NOT NULL,
  max_participants: INTEGER NOT NULL,
  current_participants: INTEGER DEFAULT 0,
  entry_fee: DECIMAL(10,2) NOT NULL,
  prize_pool: DECIMAL(10,2) NOT NULL,
  start_date: TIMESTAMP NOT NULL,
  registration_deadline: TIMESTAMP NOT NULL,
  rules: TEXT,
  status: VARCHAR(20) DEFAULT 'upcoming',
  organizer_id: UUID REFERENCES auth.users(id),
  banner_url: TEXT,
  created_at: TIMESTAMP DEFAULT NOW()
)
```

### Tournament Participants Table
```sql
tournament_participants (
  id: SERIAL PRIMARY KEY,
  tournament_id: INTEGER REFERENCES tournaments(id),
  user_id: UUID REFERENCES auth.users(id),
  player_name: VARCHAR(255),
  game_id: VARCHAR(255),
  whatsapp_no: VARCHAR(20),
  joined_at: TIMESTAMP DEFAULT NOW()
)
```

### User Profiles Table
```sql
user_profiles (
  id: SERIAL PRIMARY KEY,
  user_id: UUID REFERENCES auth.users(id),
  username: VARCHAR(100) UNIQUE,
  email: VARCHAR(255),
  phone: VARCHAR(20),
  game_id: VARCHAR(255),
  favorite_game: VARCHAR(100),
  tournaments_joined: INTEGER DEFAULT 0,
  tournaments_won: INTEGER DEFAULT 0,
  total_earnings: DECIMAL(10,2) DEFAULT 0,
  created_at: TIMESTAMP DEFAULT NOW()
)
```

## Core Features

### 1. Authentication System
- **User Registration**: Email/password with username
- **User Login**: Secure authentication via Supabase
- **Profile Management**: Editable user profiles with gaming preferences
- **Session Management**: Persistent login sessions

### 2. Tournament Management
- **Tournament Creation**: Create tournaments with custom settings
- **Tournament Listing**: Browse all available tournaments
- **Tournament Details**: Comprehensive tournament information
- **Join/Leave**: Participate in tournaments
- **Real-time Updates**: Live participant counts

### 3. User Interface
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Smooth Animations**: Framer Motion for enhanced UX
- **Dark Theme**: Gaming-focused dark UI
- **Interactive Cards**: Hover effects and animations
- **Toast Notifications**: Real-time feedback

### 4. Games Support
- BGMI (Battlegrounds Mobile India)
- Free Fire
- Valorant
- COD Mobile
- Fortnite
- Apex Legends

### 5. Leaderboard System
- **Player Rankings**: Ranked by tournaments joined
- **Public Profiles**: View other players' stats and history
- **Tournament History**: Recent tournaments for each player
- **Statistics Display**: Tournaments joined, won, earnings, rank

### 6. Tournament Management for Organizers
- **My Tournaments**: Dedicated page for organizers
- **Organized Tournaments**: View tournaments created by user
- **Joined Tournaments**: View tournaments user has participated in
- **Tournament Actions**: Edit, delete, and manage tournaments
- **Participant Management**: View and manage tournament participants

## API Services

### Tournament Operations
```javascript
// Get all tournaments
supabaseService.getAllTournaments()

// Get single tournament
supabaseService.getTournamentById(id)

// Create tournament
supabaseService.createTournament(data, bannerFile)

// Join tournament
supabaseService.joinTournament(tournamentId, userId)

// Leave tournament
supabaseService.leaveTournament(tournamentId, userId)

// Upload banner
supabaseService.uploadBanner(file, tournamentId)

// Get leaderboard
supabaseService.getLeaderboard()

// Get public profile
supabaseService.getPublicProfile(userId)

// Get user tournaments
supabaseService.getUserTournaments(userId)

// Get user stats
supabaseService.getUserStats(userId)

// Get organized tournaments
supabaseService.getOrganizedTournaments(userId)

// Get joined tournaments
supabaseService.getJoinedTournaments(userId)

// Delete tournament
supabaseService.deleteTournament(tournamentId)
```

### Redux State Management
```javascript
// Tournament slice actions
fetchTournaments()          // Load all tournaments
fetchTournamentById(id)     // Load specific tournament
createTournament(data)      // Create new tournament
joinTournament(id)          // Join tournament
leaveTournament(id)         // Leave tournament
```

## Performance Optimizations

### 1. Smart Caching
- Tournament data cached in Redux store
- Avoid redundant API calls
- Check store before fetching

### 2. Optimized Loading
- Individual tournament fetch for detail pages
- Lazy loading components
- Efficient state updates

### 3. Database Indexing
- Indexed tournament queries
- Optimized participant lookups
- Fast search capabilities

## File Upload System
- **Storage**: Supabase Storage bucket 'tournament-banners'
- **Format Support**: Images (jpg, png, webp)
- **Auto-resize**: Optimized for web display
- **Public URLs**: Direct access to uploaded banners

## Navigation Flow
```
Home → Tournaments → Tournament Detail → Join/Create
  ↓         ↓              ↓
Login → Profile    Games → Tournaments
  ↓         ↓              ↓
Register → Leaderboard → Public Profile
            ↓
        My Tournaments
```

## Security Features
- **Row Level Security**: Supabase RLS policies
- **Authentication**: JWT-based auth tokens
- **Input Validation**: Client and server-side validation
- **CORS Protection**: Configured for production

## Development Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Configure Supabase environment variables
4. Run development server: `npm run dev`
5. Build for production: `npm run build`

## Environment Variables
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Current Limitations
- Local authentication only (no OAuth)
- Mock payment system
- No real-time chat
- No tournament brackets/results
- Basic statistics (placeholders for wins/earnings)

## New Features Added

### 1. Leaderboard System
- **Player Rankings**: Top 50 players ranked by tournaments joined
- **Interactive Cards**: Click to view public profiles
- **Visual Hierarchy**: Crown, medal, and award icons for top 3
- **Real-time Data**: Live tournament participation counts

### 2. Public Profile Pages
- **Player Statistics**: Tournaments joined, won, earnings, global rank
- **Tournament History**: Recent 5 tournaments with status
- **Profile Information**: Username, favorite game, member since
- **Navigation**: Accessible from leaderboard and tournament pages

### 3. My Tournaments Dashboard
- **Dual View**: Organized tournaments vs Joined tournaments
- **Tournament Management**: Edit, delete, view organized tournaments
- **Participant Tracking**: View current participants and status
- **Quick Actions**: Create new tournament, view details
- **Status Indicators**: Visual status badges for tournament states

## Future Enhancements
- Payment gateway integration
- Live streaming integration
- Tournament brackets and results
- Real-time chat
- Mobile app
- Admin dashboard
- Advanced tournament analytics
- Tournament winner tracking
- Earnings calculation system