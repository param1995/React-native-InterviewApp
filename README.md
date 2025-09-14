# React Native Interview App (Expo)

A comprehensive Expo React Native application implementing a complete interview platform with Admin, Reviewer, and Candidate roles. This app allows admins to create interviews, candidates to record audio answers, and reviewers to evaluate submissions.

## Features

### Core Functionality

- **Multi-role Authentication**: Sign up/Sign in with Admin, Reviewer, or Candidate roles
- **Interview Management**: Admins can create structured interviews with multiple questions
- **Audio Recording**: Candidates can record audio answers for each interview question
- **Review System**: Reviewers can play audio submissions and provide scores/comments
- **Local Persistence**: All data stored locally using AsyncStorage

### User Roles

#### Admin

- Create new interviews with title, description, and multiple questions
- View all created interviews
- Edit existing interviews
- Delete interviews

#### Candidate

- View available interviews
- Record audio answers for each question
- Upload completed interview submissions
- Track submission status

#### Reviewer

- View submitted interview responses
- Play audio recordings for each question
- Provide numerical scores (0-10)
- Add detailed feedback comments
- Review completed submissions

## Tech Stack

- **Framework**: Expo (Managed Workflow)
- **Navigation**: React Navigation v6
- **State Management**: React Hooks
- **Storage**: AsyncStorage for local data persistence
- **Audio**: Expo AV for recording and playback
- **UI**: React Native components with custom styling

## Project Structure

```
React-native-InterviewApp/
├── android/                 # Android native code
├── ios/                     # iOS native code
├── src/
│   ├── screens/            # App screens
│   │   ├── Login.js        # Authentication screen
│   │   ├── Signup.js       # User registration
│   │   ├── AdminDashboard.js    # Admin interview management
│   │   ├── CandidateDashboard.js # Candidate interview access
│   │   ├── ReviewerDashboard.js  # Reviewer submission review
│   │   ├── CreateInterview.js    # Interview creation form
│   │   ├── RecordAnswer.js       # Audio recording interface
│   │   └── ReviewSubmission.js   # Submission review interface
│   └── services/           # Business logic and data management
│       ├── storage.js      # AsyncStorage operations
│       ├── taskManager.js  # Task management utilities
│       └── interviewTaskManager.js # Interview-specific logic
├── App.js                  # Main app component with navigation
├── app.json               # Expo configuration
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your mobile device

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd React-native-InterviewApp
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   # or
   expo start
   ```

4. **Run on device/simulator**
   - Scan QR code with Expo Go app (iOS/Android)
   - Or run on simulator: `expo run:ios` or `expo run:android`

## Usage Guide

### Getting Started

1. **Launch the app** and you'll see the login screen
2. **Sign up** with one of the three roles or use test accounts:
   - Admin: admin@test.com / admin123
   - Reviewer: reviewer@test.com / reviewer123
   - Candidate: candidate@test.com / candidate123

### Admin Workflow

1. **Login as Admin**
2. **Create Interview**:
   - Click "➕ Create New Interview"
   - Enter interview title and description
   - Add multiple questions using the "➕ Add" button
   - Click "💾 Create Interview" to save
3. **Manage Interviews**:
   - View all created interviews in the dashboard
   - Edit interviews using the "Edit" button
   - Delete interviews using the "🗑️" button

### Candidate Workflow

1. **Login as Candidate**
2. **Select Interview**:
   - View available interviews in the dashboard
   - Click on an interview to start
3. **Record Answers**:
   - For each question, click "🎤 Start Recording"
   - Record your audio answer
   - Click "⏹ Stop Recording" when finished
   - Move to next question
4. **Submit Interview**:
   - Click "💾 Save Answers" to upload your submission

### Reviewer Workflow

1. **Login as Reviewer**
2. **Review Submissions**:
   - View pending submissions in the dashboard
   - Click on a submission to review
3. **Evaluate Answers**:
   - Play audio recordings for each question
   - Enter a score (0-10)
   - Add detailed comments
4. **Submit Review**:
   - Click "💾 Save Review" to complete evaluation

## Key Implementation Details

### Data Storage

- Uses AsyncStorage for local data persistence
- Stores users, interviews, and submissions as JSON
- Data persists between app sessions (except in Expo Go development)

### Audio Recording

- Implemented using Expo AV library
- Records in high-quality format
- Stores audio files locally with unique identifiers

### Navigation Flow

- Stack-based navigation with React Navigation
- Role-based routing after authentication
- Proper back navigation handling

### UI/UX Design

- Dark theme with consistent styling
- Responsive design for different screen sizes
- Loading states and error handling
- Touch-friendly interface elements

## Development Notes

### Known Limitations

- Data persistence limited in Expo Go (use `expo run:android/ios` for full persistence)
- Audio files stored locally (would need cloud storage for production)
- No real-time collaboration features
- Single-device data storage

### Performance Considerations

- Efficient FlatList rendering for interview lists
- Lazy loading of audio files
- Optimized re-renders with proper key props

### Security Notes

- Local authentication only (no server-side validation)
- Audio files stored in app storage
- No encryption implemented

## Testing the App

### Test Accounts

Use these accounts to test different roles:

| Role      | Email              | Password     |
| --------- | ------------------ | ------------ |
| Admin     | admin@test.com     | admin123     |
| Reviewer  | reviewer@test.com  | reviewer123  |
| Candidate | candidate@test.com | candidate123 |

### Demo Script (Loom Video)

1. **Introduction** (10s): Show app login screen and explain the three user roles
2. **Authentication**: Demonstrate sign up/sign in with test accounts
3. **Admin Demo**: Create a new interview with 2-3 questions
4. **Candidate Demo**: Record audio answers for each question and submit
5. **Reviewer Demo**: Play audio submissions and provide scores/comments
6. **Conclusion**: Mention current limitations and potential improvements

## Troubleshooting

### Common Issues

**Audio recording not working:**

- Ensure microphone permissions are granted
- Check that Expo AV is properly installed

**Data not persisting:**

- Use `expo run:android` or `expo run:ios` instead of Expo Go for full persistence
- Check AsyncStorage permissions

**Navigation errors:**

- Ensure all screen components are properly imported in App.js
- Check that screen names match navigation calls

**Build issues:**

- Clear Expo cache: `expo r -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes. Feel free to use and modify as needed.
