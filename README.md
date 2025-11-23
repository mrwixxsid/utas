UTAS (University Timetable Automation System) is a comprehensive web application designed to **automate university scheduling**. It provides *role-based access* for administrators, teachers, and students, allowing admins to **manage core entities** like courses, teachers, and rooms, and **generate optimized timetables**. Teachers can view and request *swaps for their schedules*, while students can simply **view their personalized class timetables**.


## Visual Overview

```mermaid
flowchart TD
    A0["Authentication & Authorization System
"]
    A1["Firestore Data Access Layer
"]
    A2["Timetable Generation Engine
"]
    A3["Timetable Grid Visualization
"]
    A4["Role-Based Dashboards
"]
    A5["Global Application Contexts
"]
    A6["UI Component Library (Shadcn/UI)
"]
    A0 -- "directs to" --> A4
    A0 -- "uses user data from" --> A1
    A1 -- "provides data for" --> A4
    A1 -- "reads/writes data for" --> A2
    A1 -- "provides schedule data for" --> A3
    A2 -- "saves generated data to" --> A1
    A2 -- "triggered by" --> A4
    A3 -- "requests schedule updates via" --> A1
    A3 -- "embedded in" --> A4
    A4 -- "manages entities via" --> A1
    A4 -- "composes UI with" --> A6
    A4 -- "uses context from" --> A5
    A5 -- "encapsulates logic for" --> A0
    A5 -- "provides shared state to" --> A4
    A5 -- "integrates UI components from" --> A6
    A6 -- "provides building blocks for" --> A4
    A6 -- "used by" --> A5
```

