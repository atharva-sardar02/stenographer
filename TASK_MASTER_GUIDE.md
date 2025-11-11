# Task Master Setup Guide for Stenographer Project

## Current Status

✅ **Task Master Initialized** - Project structure created  
✅ **Free Model Configured** - Using `codex-cli:gpt-5` (free)  
⚠️ **AI Features** - Require API keys for full functionality  
✅ **Manual Task Management** - Available now

## Your Existing Task List

You already have a comprehensive `TASK_LIST.md` with 18 PRs and detailed subtasks. You can use task-master to:

1. **Track task status** (pending, in-progress, done, review, etc.)
2. **Manage dependencies** between PRs
3. **Generate progress reports**
4. **Sync to README** for visibility

## Option 1: Manual Task Management (No API Keys Needed)

### Add Tasks Manually

You can add tasks from your `TASK_LIST.md` manually:

```bash
# Add a task for PR #1
task-master add-task --prompt="PR #1: Project Setup & Infrastructure - Initialize project structure, configure build tools, set up Firebase and AWS infrastructure"

# Add a task for PR #2
task-master add-task --prompt="PR #2: Authentication & User Management - Implement Firebase Authentication with Email/Password and Google OAuth"

# Continue for all 18 PRs...
```

### Set Task Status

```bash
# Mark a task as in-progress
task-master set-status --id=1 --status=in-progress

# Mark a task as done
task-master set-status --id=1 --status=done

# Mark a task as review
task-master set-status --id=1 --status=review
```

### List Tasks

```bash
# List all tasks
task-master list

# List only pending tasks
task-master list --status=pending

# List tasks with subtasks
task-master list --with-subtasks
```

### Find Next Task

```bash
# Show the next task to work on (based on dependencies)
task-master next
```

### Sync to README

```bash
# Export tasks to README.md with professional formatting
task-master sync-readme --with-subtasks
```

## Option 2: Set Up API Keys for AI Features

If you want to use AI-powered features like:
- Auto-generating tasks from PRD
- Expanding tasks into subtasks
- Research and complexity analysis
- Auto-updating tasks based on new requirements

### Quick Setup (Free Options)

1. **Use Claude Code (Free)** - Already configured but needs installation:
   ```bash
   npm i -g @openai/codex
   ```

2. **Use Gemini CLI (Free)**:
   ```bash
   task-master models --gemini-cli --set-main gemini-2.5-pro
   ```

3. **Use Grok CLI (Free)**:
   ```bash
   task-master models --grok-cli --set-main grok-4-latest
   ```

### Paid Options (If Needed)

If you want to use paid models, add API keys to `.env`:

```env
# For Anthropic Claude
ANTHROPIC_API_KEY=your_key_here

# For OpenAI
OPENAI_API_KEY=your_key_here

# For Perplexity (research)
PERPLEXITY_API_KEY=your_key_here
```

Then configure models:
```bash
task-master models --setup
```

## Recommended Workflow

### Phase 1: Manual Setup (Now)

1. **Add all 18 PRs as tasks**:
   ```bash
   # You can create a script or add them one by one
   task-master add-task --prompt="PR #1: Project Setup & Infrastructure"
   task-master add-task --prompt="PR #2: Authentication & User Management"
   # ... continue for all PRs
   ```

2. **Add dependencies** (PR #2 depends on PR #1, etc.):
   ```bash
   task-master add-dependency --id=2 --depends-on=1
   task-master add-dependency --id=3 --depends-on=2
   # ... continue
   ```

3. **Start working**:
   ```bash
   # See what to work on next
   task-master next
   
   # Mark as in-progress when you start
   task-master set-status --id=1 --status=in-progress
   
   # Mark as done when complete
   task-master set-status --id=1 --status=done
   ```

### Phase 2: AI Features (Optional, Later)

Once you have API keys or free models working:

1. **Expand tasks into subtasks**:
   ```bash
   task-master expand --id=1 --num=10
   ```

2. **Analyze complexity**:
   ```bash
   task-master analyze-complexity
   ```

3. **Update tasks based on learnings**:
   ```bash
   task-master update-task --id=1 --prompt="Add requirement for error handling"
   ```

## Useful Commands Reference

```bash
# View all commands
task-master --help

# List tasks
task-master list [--status=<status>] [--with-subtasks]

# Show next task
task-master next

# Set task status
task-master set-status --id=<id> --status=<status>
# Statuses: pending, in-progress, done, review, deferred, cancelled

# Add subtask
task-master add-subtask --parent=<id> --title="<title>"

# Add dependency
task-master add-dependency --id=<id> --depends-on=<id>

# Sync to README
task-master sync-readme --with-subtasks

# Show task details
task-master show <id>
```

## Integration with Your TASK_LIST.md

Your `TASK_LIST.md` is comprehensive and detailed. You can:

1. **Use it as reference** - Keep it for detailed subtasks and file lists
2. **Track high-level PRs in task-master** - Use task-master for status tracking
3. **Sync progress** - Use `task-master sync-readme` to generate progress reports

## Next Steps

1. ✅ Task Master initialized
2. ⏭️ Add your 18 PRs as tasks (manually or with API keys)
3. ⏭️ Set up dependencies between PRs
4. ⏭️ Start working on PR #1 and track progress

## Questions?

- Check task-master help: `task-master --help`
- View models: `task-master models`
- Check current tasks: `task-master list`

---

**Note:** You can continue using your `TASK_LIST.md` as the detailed reference while using task-master for status tracking and progress management. They complement each other well!

