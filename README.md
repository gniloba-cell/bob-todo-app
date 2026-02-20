# Todo App Flask Backend

A RESTful API backend for a Todo application built with Flask, SQLAlchemy, and comprehensive test coverage.

## Features

- Full CRUD operations for todos
- SQLite database with SQLAlchemy ORM
- CORS enabled for cross-origin requests
- Comprehensive error handling
- 90%+ test coverage
- Input validation and sanitization

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Application

Start the Flask development server:
```bash
python app.py
```

The API will be available at `http://localhost:5000`

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

## Project Structure

```
.
├── app.py              # Main Flask application
├── models.py           # SQLAlchemy Todo model
├── database.py         # Database initialization
├── requirements.txt    # Python dependencies
├── test_app.py         # Comprehensive test suite
├── pytest.ini          # Pytest configuration
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