# Bob Todo App

A full-stack Todo application with Flask backend and vanilla JavaScript frontend.

## Project Structure

```
bob-todo-app/
├── backend/              # Flask REST API
│   ├── app.py           # Main Flask application
│   ├── models.py        # SQLAlchemy models
│   ├── database.py      # Database initialization
│   ├── requirements.txt # Python dependencies
│   ├── test_app.py      # Unit tests
│   ├── pytest.ini       # Test configuration
│   ├── .coveragerc      # Coverage settings
│   └── test_api.ps1     # API testing script
│
├── frontend/            # Vanilla JavaScript UI
│   ├── index.html      # Main HTML structure
│   ├── styles.css      # Responsive styling
│   └── app.js          # JavaScript with literate programming
│
├── .gitignore          # Git ignore rules
├── README.md           # This file
└── GIT_SETUP.md        # Git setup instructions
```

## Features

### Backend
- Full CRUD operations for todos
- SQLite database with SQLAlchemy ORM
- CORS enabled for cross-origin requests
- Comprehensive error handling
- 90%+ test coverage
- Input validation and sanitization

### Frontend
- Modern, responsive design
- Real-time statistics dashboard
- Filter functionality (All/Active/Completed)
- Smooth animations and transitions
- Mobile-first responsive layout
- Keyboard shortcuts (Ctrl/Cmd + K)
- Auto-refresh every 30 seconds

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the Flask server:
```bash
python app.py
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Simply open `frontend/index.html` in a web browser, or
2. Use a local server:
```bash
cd frontend
python -m http.server 8000
```

Then navigate to `http://localhost:8000`

## API Endpoints

### Health Check
- `GET /api/health` - Check API status

### Todos
- `GET /api/todos` - Get all todos
- `GET /api/todos/<id>` - Get a specific todo
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/<id>` - Update a todo
- `DELETE /api/todos/<id>` - Delete a todo

### Request/Response Examples

#### Create Todo
```bash
POST /api/todos
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "created_at": "2026-02-20T09:00:00.000000"
  },
  "message": "Todo created successfully"
}
```

#### Get All Todos
```bash
GET /api/todos
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "created_at": "2026-02-20T09:00:00.000000"
    }
  ],
  "count": 1
}
```

#### Update Todo
```bash
PUT /api/todos/1
Content-Type: application/json

{
  "completed": true
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": true,
    "created_at": "2026-02-20T09:00:00.000000"
  },
  "message": "Todo updated successfully"
}
```

#### Delete Todo
```bash
DELETE /api/todos/1
```

Response:
```json
{
  "success": true,
  "message": "Todo deleted successfully"
}
```

## Running Tests

Navigate to the backend directory:
```bash
cd backend
```

Run all tests:
```bash
pytest
```

Run tests with coverage report:
```bash
pytest --cov=. --cov-report=term-missing
```

Run tests with HTML coverage report:
```bash
pytest --cov=. --cov-report=html
```

The HTML coverage report will be generated in the `htmlcov` directory. Open `htmlcov/index.html` in a browser to view detailed coverage information.

## Test Coverage

The test suite includes:
- **Health Check Tests**: API status verification
- **GET Endpoints Tests**: Retrieving todos (empty, with data, ordering)
- **POST Endpoint Tests**: Creating todos (valid, invalid, edge cases)
- **PUT Endpoint Tests**: Updating todos (partial, full, validation)
- **DELETE Endpoint Tests**: Deleting todos (existing, non-existent)
- **Model Tests**: Todo model methods (to_dict, __repr__)
- **Error Handler Tests**: 404, 400, 500 error responses
- **Integration Tests**: Full CRUD workflows

Current test coverage: **90%+**

## Technology Stack

### Backend
- Python 3.x
- Flask 3.0.0
- Flask-CORS 4.0.0
- Flask-SQLAlchemy 3.1.1
- SQLite database
- Pytest for testing
- Coverage.py for code coverage

### Frontend
- HTML5
- CSS3 (with CSS Variables)
- Vanilla JavaScript (ES6+)
- No frameworks or libraries required
├── .coveragerc         # Coverage configuration
└── README.md           # This file
```

## Database Schema

### Todo Model
- `id` (Integer, Primary Key)
- `title` (String, Required)
- `description` (Text, Optional)
- `completed` (Boolean, Default: False)
- `created_at` (DateTime, Auto-generated)

## Error Handling

All endpoints return consistent JSON responses with a `success` boolean:

Success Response:
```json
{
  "success": true,
  "data": {...}
}
```

Error Response:
```json
{
  "success": false,
  "error": "Error message"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Development

The application uses:
- Flask 3.0.0
- Flask-CORS 4.0.0
- Flask-SQLAlchemy 3.1.1
- SQLite database (todos.db)
- Pytest for testing
- Coverage.py for code coverage

## License

MIT