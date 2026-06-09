# EcoTrack AI 🌱

## Overview

EcoTrack AI is an intelligent carbon footprint awareness platform designed to help individuals understand, track, and reduce their environmental impact through personalized recommendations and data-driven insights.

The platform acts as a smart sustainability assistant that analyzes user lifestyle choices, estimates carbon emissions, and provides actionable suggestions to encourage environmentally responsible behavior.

---

## Challenge Vertical

**Sustainability & Environmental Awareness**

This project focuses on helping users make informed decisions that reduce their carbon footprint and contribute to a more sustainable future.

---

## Problem Statement

Many people want to live sustainably but do not understand how their daily activities contribute to carbon emissions.

Common challenges include:

* Lack of awareness of personal carbon impact
* Difficulty identifying high-emission activities
* Limited access to personalized sustainability guidance
* No simple way to track environmental progress

EcoTrack AI addresses these challenges through intelligent analysis and personalized recommendations.

---

## Solution

EcoTrack AI provides:

### Carbon Footprint Calculation

Users enter information about:

* Transportation habits
* Energy consumption
* Dietary preferences
* Travel activities
* Daily lifestyle choices

The system estimates carbon emissions based on these inputs.

### Smart Recommendations

Based on user data, the platform generates personalized sustainability recommendations such as:

* Reducing private vehicle usage
* Using public transportation
* Improving household energy efficiency
* Adopting environmentally friendly habits
* Reducing unnecessary emissions

### Progress Awareness

Users can monitor their environmental impact and identify opportunities for improvement.

---

## Key Features

* Intelligent carbon footprint calculator
* Context-aware recommendation engine
* Personalized sustainability guidance
* User-friendly interface
* Responsive design
* Accessibility-focused implementation
* Secure input validation
* Optimized performance
* Comprehensive testing

---

## System Architecture

### Frontend

* React
* TypeScript
* Modern responsive UI components

### Backend

* Node.js
* Express

### AI Integration

* Gemini AI integration for intelligent recommendations and insights

### Testing

* Vitest
* Unit testing
* Integration testing

---

## Smart Assistant Logic

The platform behaves as a dynamic assistant by:

1. Collecting user lifestyle information
2. Analyzing carbon-emission factors
3. Calculating estimated footprint values
4. Understanding user context
5. Generating personalized recommendations
6. Suggesting realistic sustainability improvements

This ensures that recommendations are relevant to each user's situation rather than generic advice.

---

## Security Considerations

The application incorporates:

* Input validation
* Secure environment variable handling
* Error handling
* API protection practices
* Dependency management

Sensitive information such as API keys is stored using environment variables and is never exposed in the repository.

---

## Accessibility

The application is designed with accessibility in mind:

* Semantic HTML structure
* Keyboard navigation support
* Accessible forms and labels
* Screen-reader-friendly content
* Responsive layouts
* Improved visual contrast

---

## Testing Strategy

The project includes testing for:

* Carbon footprint calculations
* Recommendation generation
* Input validation
* Component behavior
* Integration workflows

Testing helps ensure reliability and maintainability.

---

## Installation

### Clone Repository

```bash
git clone https://github.com/BharathKumar1607/Carbon-Footprint-Platform.git
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env.local` file:

```env
GEMINI_API_KEY=your_api_key_here
```

### Start Development Server

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

---

## Assumptions

* User-provided information is reasonably accurate.
* Carbon emission estimates are intended for awareness and educational purposes.
* Recommendations are designed to encourage sustainable behavior and are not professional environmental assessments.

---

## Future Enhancements

* Historical tracking and analytics
* Sustainability goals and achievements
* Weekly environmental reports
* Carbon reduction forecasting
* Gamification features
* Community sustainability challenges

---

## Conclusion

EcoTrack AI demonstrates how AI-powered assistants can be used to promote environmental awareness through personalized recommendations, context-aware decision making, and practical sustainability guidance.

The project combines usability, accessibility, security, testing, and maintainable software engineering practices to create a meaningful real-world solution.
