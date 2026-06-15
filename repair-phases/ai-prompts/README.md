# AI Agent Prompts for TeenWork Repair

This directory contains comprehensive AI agent prompts for systematically repairing the TeenWork application across 8 phases.

## 📁 Files

- **`index.json`** - Master index with overview, usage instructions, and success metrics
- **`phase-1-prompt.json`** - Phase 1: Critical Security Fixes (CRITICAL - 8 hours)
- **`phase-2-prompt.json`** - Phase 2: Data Integration (HIGH - 24 hours)
- **`phases-3-8-prompts.json`** - Phases 3-8: Consolidated prompts (MEDIUM/LOW - 86 hours)

## 🚀 Quick Start

### For AI Agents

1. **Read Investigation Report First**
   ```
   Read: ../INVESTIGATION_REPORT.md
   ```

2. **Start with Phase 1 (CRITICAL)**
   ```
   Read: phase-1-prompt.json
   Follow all tasks in exact order
   Validate after each task
   Create validation report
   ```

3. **Proceed Sequentially**
   - Complete Phase 1 → Phase 2 → Phase 3 → ... → Phase 8
   - Do NOT skip phases
   - Validate 100% completion before next phase

### For Human Supervisors

1. **Review the Investigation Report**
   - Location: `../INVESTIGATION_REPORT.md`
   - Understand current issues and priorities

2. **Provide AI Agent with Appropriate Prompt**
   - Start with `phase-1-prompt.json`
   - Monitor progress
   - Review validation reports

3. **Approve Phase Completion**
   - Verify all deliverables
   - Check validation report
   - Approve before next phase

## 📋 Phase Overview

| Phase | Name | Priority | Hours | Dependencies |
|-------|------|----------|-------|--------------|
| 1 | Critical Security Fixes | CRITICAL | 8 | None |
| 2 | Data Integration | HIGH | 24 | Phase 1 |
| 3 | Error Handling & User Feedback | HIGH | 16 | Phase 2 |
| 4 | Code Deduplication & Refactoring | MEDIUM | 20 | Phase 3 |
| 5 | Performance Optimization | MEDIUM | 12 | Phase 4 |
| 6 | TypeScript & Code Quality | MEDIUM | 10 | Phase 4 |
| 7 | Testing & Documentation | MEDIUM | 16 | Phase 6 |
| 8 | Accessibility & UX | LOW | 12 | Phase 7 |

**Total Estimated Time:** 118 hours (~3 weeks)

## 🎯 Phase 1: Critical Security Fixes (START HERE)

**File:** `phase-1-prompt.json`

**CRITICAL TASKS:**
1. Delete `AdminSetup.tsx` and `AdminPasswordReset.tsx`
2. Remove hardcoded admin email check
3. Implement environment variables for Firebase
4. Fix memory leak in EmailVerificationPage
5. Add image upload validation
6. Document backend requirements for AI API

**Success Criteria:**
- ✅ Zero hardcoded credentials
- ✅ No admin utilities accessible
- ✅ Environment variables configured
- ✅ No memory leaks
- ✅ Image uploads validated
- ✅ Application runs without errors

## 🔒 Critical Rules (ALL PHASES)

### Universal Rules
- ❌ NO hardcoded credentials or API keys
- ❌ NO mock data in production code
- ❌ NO console.log statements
- ❌ NO external dependencies without validation
- ❌ NO security vulnerabilities
- ✅ ALL data must come from Firestore (after Phase 2)
- ✅ ALL errors must be handled
- ✅ ALL components must have loading states
- ✅ ALL async operations must have try-catch
- ✅ ALL changes must be tested

### Phase-Specific Rules
See individual phase prompt files for additional rules.

## ✅ Validation Framework

### After Each Task
1. Run validation tests specified in task
2. Verify no errors introduced
3. Test affected functionality
4. Commit working code

### After Each Phase
1. Run all phase validation tests
2. Verify all postConditions met
3. Run: `npm run dev` (application starts)
4. Run: `npm run type-check` (zero errors)
5. Run: `npm run lint` (zero errors)
6. Create validation report
7. Update phase status in `../index.json`

### Final Validation (After Phase 8)
- All 8 phases completed
- Zero TypeScript errors
- Zero ESLint errors
- Test coverage >80%
- Lighthouse score >90
- Accessibility score >95
- No hardcoded data
- No security vulnerabilities

## 📊 Success Metrics

### Current State → Target State

| Metric | Current | Target | Validation |
|--------|---------|--------|------------|
| **Security** | 3/10 (CRITICAL) | 9/10 | No exposed credentials |
| **Code Quality** | 5/10 | 8/10 | Zero errors, >80% coverage |
| **Maintainability** | 4/10 | 8/10 | Modular, documented |
| **Performance** | 6/10 | 8/10 | Lighthouse >90 |
| **Accessibility** | 3/10 | 8/10 | WCAG AA compliant |

## 🔄 Rollback Strategy

### Per Task
If task fails:
1. Revert changes: `git checkout -- <files>`
2. Document issue
3. Seek assistance

### Per Phase
Each phase in separate git branch:
```bash
git checkout -b phase-X-name
# ... work on phase ...
git commit -m "Complete Phase X"
git checkout main
git merge phase-X-name
```

If phase fails:
```bash
git checkout main
git branch -D phase-X-name
```

### Emergency
If critical failure:
1. Stop all work
2. Revert to last stable state
3. Escalate to human supervisor

## 📦 Deliverables

### Per Phase
- All code changes as specified
- Validation report: `PHASE_X_VALIDATION_REPORT.md`
- Updated phase status in `../index.json`
- Git commits with clear messages

### Final Deliverables
- Fully functional TeenWork application
- Zero security vulnerabilities
- Comprehensive test suite
- Complete documentation
- Deployment-ready codebase

## 🛠️ Tools & Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production

# Quality Checks
npm run type-check       # Check TypeScript errors
npm run lint             # Run ESLint
npm run format           # Format with Prettier
npm run test             # Run tests

# Git
git status               # Check current status
git add .                # Stage changes
git commit -m "message"  # Commit changes
git checkout -b branch   # Create new branch
```

## 📚 Support Resources

### Documentation
- `../INVESTIGATION_REPORT.md` - Detailed analysis of all issues
- `../index.json` - Master repair plan
- `../phase-X-*.json` - Detailed phase specifications
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

### Getting Help
1. Review investigation report for context
2. Check phase-specific JSON for detailed instructions
3. Consult original repair plan in `../index.json`
4. Escalate to human supervisor if stuck

## ⚠️ Important Notes

1. **Phase 1 is CRITICAL** - Must be completed immediately
2. **Sequential Execution** - Phases must be done in order
3. **Validation is Mandatory** - Do not skip validation steps
4. **Git Branching** - Each phase in separate branch
5. **Documentation** - Document any deviations or issues
6. **Time Estimate** - ~3 weeks of focused development
7. **Parallelization** - Can split work after Phase 3

## 🎯 Getting Started Checklist

- [ ] Read `../INVESTIGATION_REPORT.md`
- [ ] Review `index.json` in this directory
- [ ] Understand phase dependencies
- [ ] Create git branch for Phase 1
- [ ] Read `phase-1-prompt.json` completely
- [ ] Begin Phase 1 Task 1.1
- [ ] Follow validation framework
- [ ] Document progress

## 📞 Contact

For questions or issues:
- Review documentation in this directory
- Check investigation report
- Consult original repair plans
- Escalate to human supervisor

---

**Last Updated:** 2026-02-09  
**Version:** 1.0.0  
**Status:** Ready for AI agent execution
