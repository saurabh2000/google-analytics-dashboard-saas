# Agent Workflow & Collaboration Guide

## Agent Team Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     Project Leadership                        │
│                  (Coordination & Planning)                    │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
┌───────▼────────┐                       ┌─────────▼──────────┐
│   Frontend     │                       │     Backend        │
│  Specialist    │◄─────────────────────►│    Engineer        │
└───────┬────────┘                       └─────────┬──────────┘
        │                                           │
        │         ┌───────────────────┐            │
        │         │  Auth & Security  │            │
        └────────►│    Specialist     │◄───────────┘
                  └─────────┬─────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
┌───────▼────────┐                   ┌─────────▼──────────┐
│  Integration   │                   │    Dashboard       │
│  Specialist    │◄─────────────────►│   Architect        │
└───────┬────────┘                   └─────────┬──────────┘
        │                                       │
        │         ┌───────────────────┐         │
        └────────►│     DevOps        │◄────────┘
                  │    Engineer       │
                  └─────────┬─────────┘
                            │
                  ┌─────────▼─────────┐
                  │  Test Automation  │
                  │    Engineer       │
                  └───────────────────┘
```

## Sprint Workflow

### Week 1: Foundation & Planning
**Day 1-2: Sprint Planning**
- All agents review upcoming tasks
- Identify dependencies and blockers
- Test Automation Engineer creates test plans

**Day 3-5: Development Kickoff**
- Frontend Specialist: Task 1 (Project setup)
- Backend Engineer: Task 3.1-3.2 (Database setup)
- Auth Specialist: Task 2.1 (OAuth research)
- DevOps: Environment setup

### Week 2: Core Development
**Frontend Team**
- Complete Task 1 (Project foundation)
- Start Task 5.1-5.3 (UI components)

**Backend Team**
- Complete Task 3 (Database schema)
- Support Auth team with user models

**Auth Team**
- Complete Task 2.1-2.3 (Basic OAuth)
- Coordinate with Frontend on UI

**Integration Team**
- Start Task 4.1 (GA API setup)
- Research Stripe integration

### Week 3: Integration Phase
**Cross-Team Collaboration**
- Frontend + Auth: Complete login UI
- Backend + Integration: API endpoints
- Dashboard Architect: Design reviews
- Test Engineer: Integration tests

### Week 4: Testing & Polish
**All Teams**
- Bug fixes and optimizations
- Documentation updates
- Test coverage improvements
- Sprint review preparation

## Communication Protocols

### Daily Standups (15 min)
```
Time: 9:00 AM
Format:
- What I completed yesterday
- What I'm working on today
- Any blockers
- Need assistance from: [Agent Name]
```

### Weekly Sync Meetings

**Monday: Sprint Planning**
- Review upcoming tasks
- Assign story points
- Identify dependencies

**Wednesday: Integration Checkpoint**
- API contract reviews
- Cross-team dependencies
- Blocker resolution

**Friday: Demo & Retrospective**
- Feature demonstrations
- Test results review
- Process improvements

## Handoff Procedures

### Code Handoff Checklist
- [ ] Code reviewed and approved
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] API contracts defined
- [ ] Environment variables documented
- [ ] Deployment notes created

### Integration Points

#### Frontend → Backend
```javascript
// API Contract Example
interface UserDashboardRequest {
  userId: string;
  dateRange: DateRange;
  widgetIds: string[];
}

interface UserDashboardResponse {
  widgets: Widget[];
  lastUpdated: Date;
  // Full contract in /docs/api/
}
```

#### Backend → Integration
```javascript
// Service Interface Example
interface GoogleAnalyticsService {
  fetchProperties(userId: string): Promise<Property[]>;
  fetchMetrics(request: MetricsRequest): Promise<MetricsData>;
  // Full interface in /src/services/
}
```

## Escalation Matrix

### Blocker Resolution
1. **Technical Blocker**: 
   - First: Relevant specialist agent
   - Escalate: Tech lead meeting

2. **Integration Blocker**:
   - First: Integration specialist
   - Escalate: Architecture review

3. **Security Concern**:
   - First: Security specialist
   - Escalate: Security review board

4. **Performance Issue**:
   - First: Backend engineer
   - Escalate: DevOps + Backend meeting

## Quality Gates

### Before Task Completion
1. **Code Quality**
   - Passes linting rules
   - Meets code coverage targets
   - Peer reviewed

2. **Testing**
   - Unit tests passing
   - Integration tests passing
   - Manual QA completed

3. **Documentation**
   - Code comments updated
   - API docs generated
   - README updated

4. **Security**
   - Security scan passed
   - No vulnerable dependencies
   - Auth specialist approval (if needed)

## Agent Availability

### Core Hours
- **Overlap Hours**: 10 AM - 4 PM (for collaboration)
- **Focus Time**: Before 10 AM, After 4 PM
- **On-Call Rotation**: See schedule

### Emergency Contact
- **P0 Issues**: All agents via emergency Slack
- **P1 Issues**: Relevant specialist + DevOps
- **P2 Issues**: Next business day

## Knowledge Sharing

### Weekly Knowledge Transfer
- **Monday**: Frontend tips & tricks
- **Tuesday**: Backend best practices
- **Wednesday**: Security awareness
- **Thursday**: Integration patterns
- **Friday**: Testing strategies

### Documentation Requirements
- Each agent maintains their domain wiki
- Cross-training documents for handoffs
- Video recordings of complex features
- Architecture decision records (ADRs)