# Git Setup Instructions

Git is not currently installed or not in your system PATH. Follow these instructions to set up version control for this project.

## Option 1: Install Git (Recommended)

### Windows
1. Download Git from: https://git-scm.com/download/win
2. Run the installer
3. During installation, select "Git from the command line and also from 3rd-party software"
4. Restart your terminal/PowerShell
5. Verify installation: `git --version`

### After Installing Git

Once Git is installed, run these commands in the project directory:

```bash
# Initialize the repository
git init

# Add all files to staging
git add .

# Create the initial commit
git commit -m "Initial todo app implementation"

# (Optional) Add a remote repository
git remote add origin <your-repository-url>

# (Optional) Push to remote
git push -u origin main
```

## Option 2: Use VS Code's Built-in Git

If you're using VS Code:

1. Open the Source Control panel (Ctrl+Shift+G)
2. Click "Initialize Repository"
3. Stage all changes (click the + icon next to "Changes")
4. Enter commit message: "Initial todo app implementation"
5. Click the checkmark to commit

## What's Already Done

✅ `.gitignore` file created with comprehensive rules for:
- Python files and virtual environments
- Node.js dependencies
- Database files
- IDE configurations
- OS-specific files
- Test coverage reports
- Temporary files

## Files to be Committed

The following files will be included in the initial commit:

### Backend Files
- `app.py` - Flask API server
- `models.py` - Database models
- `database.py` - Database initialization
- `requirements.txt` - Python dependencies
- `test_app.py` - Unit tests
- `pytest.ini` - Test configuration
- `.coveragerc` - Coverage configuration

### Frontend Files
- `index.html` - Main HTML structure
- `styles.css` - Responsive styling
- `app.js` - JavaScript with literate programming

### Documentation
- `README.md` - Project documentation
- `GIT_SETUP.md` - This file

### Configuration
- `.gitignore` - Git ignore rules

### Scripts
- `test_api.ps1` - API testing script

## Files Excluded (by .gitignore)

The following will NOT be committed:
- `todos.db` - SQLite database (generated at runtime)
- `__pycache__/` - Python cache files
- `htmlcov/` - Test coverage reports
- `.coverage` - Coverage data
- `*.pyc` - Compiled Python files
- Virtual environment directories
- IDE configuration files

## Recommended Git Workflow

After initial setup:

```bash
# Check status
git status

# Stage specific files
git add <filename>

# Stage all changes
git add .

# Commit with message
git commit -m "Your commit message"

# View commit history
git log --oneline

# Create a new branch
git checkout -b feature-name

# Switch branches
git checkout main

# Merge branches
git merge feature-name
```

## GitHub Integration

To push this project to GitHub:

```bash
# Create a new repository on GitHub (via web interface)

# Add the remote
git remote add origin https://github.com/yourusername/todo-app.git

# Push to GitHub
git push -u origin main
```

## Troubleshooting

### Git not recognized
- Ensure Git is installed
- Add Git to your system PATH
- Restart your terminal

### Permission denied
- Check file permissions
- Run terminal as administrator (Windows)

### Merge conflicts
- Use `git status` to see conflicted files
- Edit files to resolve conflicts
- Stage resolved files: `git add <filename>`
- Complete merge: `git commit`

## Next Steps

1. Install Git if not already installed
2. Initialize the repository
3. Review the files to be committed
4. Create the initial commit
5. (Optional) Create a GitHub repository and push

## Additional Resources

- Git Documentation: https://git-scm.com/doc
- GitHub Guides: https://guides.github.com/
- Git Cheat Sheet: https://education.github.com/git-cheat-sheet-education.pdf