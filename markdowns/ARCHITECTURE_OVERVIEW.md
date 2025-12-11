# Visual Overview: Link Distribution Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────┐              ┌──────────────────┐            │
│  │ Faculty Dashboard│              │Student Dashboard│            │
│  │                  │              │                  │            │
│  │ Create Link ──┐  │              │ Show My Links ───┼─┐          │
│  │ (POST)        │  │              │ (GET)             │ │         │
│  └────────────────┘  │              └──────────────────┘ │         │
│                      │                                   │         │
│                      └──────────────┬────────────────────┘         │
│                                     │                              │
│                         ┌───────────▼──────────┐                  │
│                         │     API Layer        │                  │
│                         │   (api.jsx)          │                  │
│                         │                      │                  │
│                         │ linksAPI:            │                  │
│                         │ ├─ create()          │                  │
│                         │ ├─ getAll()          │                  │
│                         │ └─ getStudentLinks() │ NEW              │
│                         └───────────┬──────────┘                  │
│                                     │                              │
└─────────────────────────────────────┼──────────────────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
                    │ NETWORK                           │
                    │ (HTTP/REST)                       │
                    │                                   │
                    ▼                                   ▼
        ┌──────────────────────┐          ┌──────────────────────┐
        │ POST /api/links      │          │ GET /api/links/      │
        │ (Create & Push)      │          │ student/my-links     │
        │                      │          │ (Get Student Links)  │
        └──────────┬───────────┘          └──────────┬───────────┘
                   │                                 │
                   │                                 │
                   ▼                                 ▼
        ┌──────────────────────────────────────────────────────┐
        │          BACKEND (Node.js/Express)                   │
        ├──────────────────────────────────────────────────────┤
        │                                                      │
        │  ┌────────────────────────────────────────────────┐ │
        │  │         linkController.js                      │ │
        │  │                                                │ │
        │  │  create() {                                    │ │
        │  │    1. Save Link to DB                          │ │
        │  │    2. Query all students (role='student')      │ │
        │  │    3. Create StudentLink records for each      │ │
        │  │    4. Log: "✓ Link pushed to X students"       │ │
        │  │    5. Return success                           │ │
        │  │  }                                             │ │
        │  │                                                │ │
        │  │  getStudentLinks() {                           │ │
        │  │    1. Query StudentLink where studentId=user   │ │
        │  │    2. Populate with Link data                  │ │
        │  │    3. Return array of links                    │ │
        │  │  }                                             │ │
        │  └────────────────────────────────────────────────┘ │
        │                                                      │
        └──────────────────────┬───────────────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────────────────┐
        │              MongoDB Database                        │
        ├──────────────────────────────────────────────────────┤
        │                                                      │
        │  ┌──────────────┐  ┌──────────────┐                │
        │  │ users        │  │ links        │                │
        │  │ collection   │  │ collection   │                │
        │  └──────────────┘  └──────────────┘                │
        │         │                 │                         │
        │         │ Linked via       │ Linked via             │
        │         │ IDs              │ IDs                    │
        │         │                  │                        │
        │         └──────────┬───────┘                        │
        │                    │                                │
        │                    ▼                                │
        │           ┌────────────────┐                       │
        │           │ StudentLink    │ NEW                   │
        │           │ collection     │                       │
        │           │                │                       │
        │           │ {              │                       │
        │           │  linkId: Ref,  │                       │
        │           │  studentId: Ref│                       │
        │           │  email: String │                       │
        │           │  viewed: Bool  │                       │
        │           │  assignedAt: TS│                       │
        │           │ }              │                       │
        │           └────────────────┘                       │
        │                                                     │
        └─────────────────────────────────────────────────────┘
```

## Data Flow: Link Creation

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: Faculty Creates Link                                    │
└─────────────────────────────────────────────────────────────────┘
        Faculty Dashboard
            │
            ▼
    CreateLinkDialog
        │
        └─► POST /api/links
            {
              title: "Amazon SDE",
              url: "...",
              shortUrl: "lc.io/amazon",
              deadline: "2025-12-20",
              description: "..."
            }

┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Backend Processes (linkController.create)               │
└─────────────────────────────────────────────────────────────────┘
        Request arrives
            │
            ▼
    Validate input
            │
            ▼
    Save Link to DB ──► links collection
            │
            ▼
    Query all students ──► db.users.find({ role: 'student' })
            │             Returns: [student1, student2, student3, ...]
            │
            ▼
    Create StudentLink records
            │
            ├─► { linkId: X, studentId: 1, email: student1@test.com, ... }
            ├─► { linkId: X, studentId: 2, email: student2@test.com, ... }
            ├─► { linkId: X, studentId: 3, email: student3@test.com, ... }
            │
            ▼
    Insert all records ──► db.studentlinks
            │
            ▼
    Console: ✓ Link "Amazon SDE" pushed to 3 students
            │
            ▼
    Return { success: true, link: {...} }

┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Frontend Updates                                        │
└─────────────────────────────────────────────────────────────────┘
        Response received
            │
            ▼
    Toast: "Link created successfully!"
            │
            ▼
    Dialog closes
            │
            ▼
    Reload faculty dashboard
```

## Data Flow: Student Views Links

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: Student Loads Dashboard                                 │
└─────────────────────────────────────────────────────────────────┘
        StudentDashboard mounts
            │
            ▼
    useEffect → loadData()
            │
            ▼
    GET /api/links/student/my-links (with student's auth token)

┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Backend Retrieves Links (getStudentLinks)               │
└─────────────────────────────────────────────────────────────────┘
        linkController.getStudentLinks()
            │
            ▼
    Extract studentId from JWT token
            │
            ▼
    Query: db.studentlinks.find({ studentId: XXX })
            │           ▼
            │    Returns StudentLink records
            │    (one per assigned link)
            │
            ▼
    Populate link data
    for each StudentLink
            │
            ├─► Get Link data for linkId 1
            ├─► Get Link data for linkId 2
            ├─► Get Link data for linkId 3
            │
            ▼
    Sort by assignedAt (newest first)
            │
            ▼
    Return { success: true, links: [...] }

┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Frontend Displays Links                                 │
└─────────────────────────────────────────────────────────────────┘
        Response received
            │
            ▼
    setLinks(data)
            │
            ▼
    Render LinkCard for each link
            │
            ├─► Card 1: Amazon SDE
            ├─► Card 2: Google STEP
            ├─► Card 3: Microsoft Internship
            │
            ▼
    Student sees all assigned links
```

## Database Schema Relationships

```
┌──────────────────┐
│    User          │
├──────────────────┤
│ _id: ObjectId PK │
│ name: String     │
│ email: String    │
│ role: String     │ ◄──── role='student'
│ rollNumber: Str  │       role='faculty'
│ ...              │       role='admin'
└──────────────────┘
         △
         │ Referenced by (studentId)
         │
┌────────────────────┐
│   StudentLink      │ NEW
├────────────────────┤
│ _id: ObjectId PK   │
│ linkId: ObjectId FK├──────┐
│ studentId: ObjId FK│      │
│ email: String      │      │
│ viewed: Boolean    │      │
│ assignedAt: Date   │      │
│ Index: (linkId,    │      │
│         studentId) │      │
└────────────────────┘      │
                            │
                    Referenced by
                            │
                            ▼
                 ┌──────────────────┐
                 │      Link        │
                 ├──────────────────┤
                 │ _id: ObjectId PK │
                 │ title: String    │
                 │ url: String      │
                 │ shortUrl: String │
                 │ deadline: Date   │
                 │ description: Str │
                 │ createdBy: ObjId │
                 │ active: Boolean  │
                 │ registrations: # │
                 │ ...              │
                 └──────────────────┘
                         △
                         │ Referenced by (createdBy)
                         │
                    ┌─────┘
                    │
    User (faculty/admin with id=X)
```

## Access Control Matrix

```
┌──────────────────┬─────────────┬──────────┬──────────┐
│ Endpoint         │ Admin       │ Faculty  │ Student  │
├──────────────────┼─────────────┼──────────┼──────────┤
│ GET /api/links   │ ✅ All      │ ✅ All   │ ❌ No    │
├──────────────────┼─────────────┼──────────┼──────────┤
│ POST /api/links  │ ✅ Create   │ ✅ Own   │ ❌ No    │
├──────────────────┼─────────────┼──────────┼──────────┤
│ PUT /api/links/:id│ ✅ Any     │ ✅ Own   │ ❌ No    │
├──────────────────┼─────────────┼──────────┼──────────┤
│ DEL /api/links/:id│ ✅ Any     │ ✅ Own   │ ❌ No    │
├──────────────────┼─────────────┼──────────┼──────────┤
│ GET /links/my    │ ✅ All      │ ❌ No    │ ✅ Own   │
├──────────────────┼─────────────┼──────────┼──────────┤
│ GET /links/      │ ✅ All      │ ✅ All   │ ✅ Own   │
│ student/my-links │             │          │          │
└──────────────────┴─────────────┴──────────┴──────────┘

Legend:
✅ = Allowed
❌ = Forbidden
```

## Time Sequence Diagram

```
Faculty         Frontend        Backend         MongoDB
  │                │               │               │
  │─ Load Dash ───►│               │               │
  │                │               │               │
  │                │─ GET /links ─►│               │
  │                │◄──────────────│─ Query links ─┤
  │                │               │               │
  │◄─ Display ─────│               │               │
  │                │               │               │
  │─ Click Create ─┤               │               │
  │                │               │               │
  │─ Fill Form ────┤               │               │
  │                │               │               │
  │─ Submit ───────┤               │               │
  │                │               │               │
  │                │─ POST /links ►│               │
  │                │               │─ Save link ──►│
  │                │               │               │ (Link created)
  │                │               │               │
  │                │               │─ Find students┤
  │                │               │               │
  │                │               │─ Create Student
  │                │               │   Links ─────►│
  │                │               │               │ (Records created)
  │                │               │               │
  │                │◄──────────────│─ Success ─────┤
  │                │               │               │
  │◄─ Toast ───────│               │               │
  │                │               │               │
  │                │               │               │
Student1         Frontend        Backend         MongoDB
  │                │               │               │
  │─ Load Dash ───►│               │               │
  │                │               │               │
  │                │─ GET /links/student/my-links  │
  │                │               │               │
  │                │               │─ Find Student
  │                │               │   Links ─────►│
  │                │               │               │
  │                │               │◄─ Return records
  │                │               │               │
  │                │               │─ Populate data┤
  │                │               │               │
  │                │◄──────────────│─ Return links ┤
  │                │               │               │
  │◄─ Display Link │               │               │
  │  (Amazon SDE)  │               │               │
  │                │               │               │
  
[Repeat for Student2, Student3, etc.]
```

## Performance Considerations

```
Scenario: Faculty creates link with 1000 students

Timeline:
├─ 0ms:      Request received
├─ 5ms:      Link saved to DB
├─ 10ms:     Query 1000 students (indexed)
├─ 15ms:     Create StudentLink objects in memory
├─ 1000ms:   Bulk insert 1000 StudentLink records
├─ 1005ms:   Console log confirmation
├─ 1010ms:   Return response to frontend
└─ Total:    ~1 second

Faculty UI:
├─ Immediate: Dialog closes, toast shows
├─ Console:   See "✓ Link pushed to 1000 students"
└─ Impact:    No blocking, async operations

Students:
├─ Visible:   Link appears within seconds
├─ Dashboard: Loads fast (indexed query)
└─ Experience: Seamless access
```

---

**This architecture ensures**:
- ✅ Scalability for thousands of students
- ✅ Real-time link distribution
- ✅ Efficient database queries
- ✅ Clean separation of concerns
- ✅ Backward compatibility
- ✅ Role-based security
