from flask import Flask, request, jsonify
from flask_cors import CORS
from database import db, init_db
from models import Todo
from sqlalchemy.exc import SQLAlchemyError

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todos.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Enable CORS
CORS(app)

# Initialize database
init_db(app)

# Error handlers
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(400)
def bad_request(error):
    """Handle 400 errors."""
    return jsonify({'error': 'Bad request'}), 400

# API Endpoints
@app.route('/api/todos', methods=['GET'])
def get_todos():
    """Get all todos."""
    try:
        todos = Todo.query.order_by(Todo.created_at.desc()).all()
        return jsonify({
            'success': True,
            'data': [todo.to_dict() for todo in todos],
            'count': len(todos)
        }), 200
    except SQLAlchemyError as e:
        return jsonify({
            'success': False,
            'error': 'Database error occurred'
        }), 500

@app.route('/api/todos/<int:todo_id>', methods=['GET'])
def get_todo(todo_id):
    """Get a specific todo by id."""
    try:
        todo = Todo.query.get(todo_id)
        if not todo:
            return jsonify({
                'success': False,
                'error': f'Todo with id {todo_id} not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': todo.to_dict()
        }), 200
    except SQLAlchemyError as e:
        return jsonify({
            'success': False,
            'error': 'Database error occurred'
        }), 500

@app.route('/api/todos', methods=['POST'])
def create_todo():
    """Create a new todo."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        if not data.get('title') or not data.get('title').strip():
            return jsonify({
                'success': False,
                'error': 'Title is required and cannot be empty'
            }), 400
        
        todo = Todo(
            title=data['title'].strip(),
            description=data.get('description', '').strip(),
            completed=data.get('completed', False)
        )
        
        db.session.add(todo)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': todo.to_dict(),
            'message': 'Todo created successfully'
        }), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Failed to create todo'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Invalid request data'
        }), 400

@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    """Update an existing todo."""
    try:
        todo = Todo.query.get(todo_id)
        if not todo:
            return jsonify({
                'success': False,
                'error': f'Todo with id {todo_id} not found'
            }), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        if 'title' in data:
            if not data['title'] or not data['title'].strip():
                return jsonify({
                    'success': False,
                    'error': 'Title cannot be empty'
                }), 400
            todo.title = data['title'].strip()
        
        if 'description' in data:
            todo.description = data['description'].strip() if data['description'] else ''
        
        if 'completed' in data:
            if not isinstance(data['completed'], bool):
                return jsonify({
                    'success': False,
                    'error': 'Completed must be a boolean value'
                }), 400
            todo.completed = data['completed']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': todo.to_dict(),
            'message': 'Todo updated successfully'
        }), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Failed to update todo'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Invalid request data'
        }), 400

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    """Delete a todo."""
    try:
        todo = Todo.query.get(todo_id)
        if not todo:
            return jsonify({
                'success': False,
                'error': f'Todo with id {todo_id} not found'
            }), 404
        
        db.session.delete(todo)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Todo deleted successfully'
        }), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Failed to delete todo'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'message': 'API is running'
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
