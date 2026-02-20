import pytest
import json
from app import app, db
from models import Todo
from datetime import datetime

@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client
        with app.app_context():
            db.drop_all()

@pytest.fixture
def sample_todo(client):
    """Create a sample todo for testing."""
    with app.app_context():
        todo = Todo(
            title='Test Todo',
            description='Test Description',
            completed=False
        )
        db.session.add(todo)
        db.session.commit()
        return todo.id

class TestHealthEndpoint:
    """Test cases for health check endpoint."""
    
    def test_health_check(self, client):
        """Test health check endpoint returns success."""
        response = client.get('/api/health')
        data = json.loads(response.data)
        
        assert response.status_code == 200
        assert data['success'] is True
        assert data['status'] == 'healthy'
        assert 'message' in data

class TestGetTodos:
    """Test cases for GET /api/todos endpoint."""
    
    def test_get_empty_todos(self, client):
        """Test getting todos when database is empty."""
        response = client.get('/api/todos')
        data = json.loads(response.data)
        
        assert response.status_code == 200
        assert data['success'] is True
        assert data['data'] == []
        assert data['count'] == 0
    
    def test_get_todos_with_data(self, client, sample_todo):
        """Test getting todos when database has data."""
        response = client.get('/api/todos')
        data = json.loads(response.data)
        
        assert response.status_code == 200
        assert data['success'] is True
        assert len(data['data']) == 1
        assert data['count'] == 1
        assert data['data'][0]['title'] == 'Test Todo'
    
    def test_get_todos_ordered_by_date(self, client):
        """Test that todos are ordered by creation date (newest first)."""
        with app.app_context():
            todo1 = Todo(title='First Todo', description='', completed=False)
            todo2 = Todo(title='Second Todo', description='', completed=False)
            db.session.add(todo1)
            db.session.commit()
            db.session.add(todo2)
            db.session.commit()
        
        response = client.get('/api/todos')
        data = json.loads(response.data)
        
        assert response.status_code == 200
        assert data['data'][0]['title'] == 'Second Todo'
        assert data['data'][1]['title'] == 'First Todo'

class TestGetSingleTodo:
    """Test cases for GET /api/todos/<id> endpoint."""
    
    def test_get_existing_todo(self, client, sample_todo):
        """Test getting a specific todo that exists."""
        response = client.get(f'/api/todos/{sample_todo}')
        data = json.loads(response.data)
        
        assert response.status_code == 200
        assert data['success'] is True
        assert data['data']['id'] == sample_todo
        assert data['data']['title'] == 'Test Todo'
    
    def test_get_nonexistent_todo(self, client):
        """Test getting a todo that doesn't exist."""
        response = client.get('/api/todos/999')
        data = json.loads(response.data)
        
        assert response.status_code == 404
        assert data['success'] is False
        assert 'not found' in data['error'].lower()

class TestCreateTodo:
    """Test cases for POST /api/todos endpoint."""
    
    def test_create_todo_success(self, client):
        """Test creating a new todo with valid data."""
        todo_data = {
            'title': 'New Todo',
            'description': 'New Description',
            'completed': False
        }
        response = client.post('/api/todos',
                              data=json.dumps(todo_data),
                              content_type='application/json')
        data = json.loads(response.data)
        
        assert response.status_code == 201
        assert data['success'] is True
        assert data['data']['title'] == 'New Todo'
        assert data['data']['description'] == 'New Description'
        assert data['data']['completed'] is False
        assert 'id' in data['data']
        assert 'created_at' in data['data']
    
    def test_create_todo_minimal_data(self, client):
        """Test creating a todo with only required fields."""
        todo_data = {'title': 'Minimal Todo'}
        response = client.post('/api/todos',
                              data=json.dumps(todo_data),
                              content_type='application/json')
        data = json.loads(response.data)
        
        assert response.status_code == 201
        assert data['success'] is True
        assert data['data']['title'] == 'Minimal Todo'
        assert data['data']['description'] == ''
        assert data['data']['completed'] is False
    
    def test_create_todo_no_title(self, client):
        """Test creating a todo without a title."""
        todo_data = {'description': 'No title'}
        response = client.post('/api/todos',
                              data=json.dumps(todo_data),
                              content_type='application/json')
        data = json.loads(response.data)
        
        assert response.status_code == 400
        assert data['success'] is False
        assert 'title' in data['error'].lower()
    
    def test_create_todo_empty_title(self, client):
        """Test creating a todo with empty title."""
        todo_data = {'title': '   '}
        response = client.post('/api/todos',
                              data=json.dumps(todo_data),
                              content_type='application/json')
        data = json.loads(response.data)
        
        assert response.status_code == 400
        assert data['success'] is False
        assert 'title' in data['error'].lower()
    
    def test_create_todo_no_data(self, client):
        """Test creating a todo with no data."""
        response = client.post('/api/todos',
                              data=json.dumps(None),
                              content_type='application/json')
        data = json.loads(response.data)
        
        assert response.status_code == 400
        assert data['success'] is False
    
    def test_create_todo_whitespace_trimming(self, client):
        """Test that whitespace is trimmed from title and description."""
        todo_data = {
            'title': '  Trimmed Title  ',
            'description': '  Trimmed Description  '
        }
        response = client.post('/api/todos',
                              data=json.dumps(todo_data),
                              content_type='application/json')
        data = json.loads(response.data)
        
        assert response.status_code == 201
        assert data['data']['title'] == 'Trimmed Title'
        assert data['data']['description'] == 'Trimmed Description'

class TestUpdateTodo:
    """Test cases for PUT /api/todos/<id> endpoint."""
    
    def test_update_todo_title(self, client, sample_todo):
        """Test updating only the title of a todo."""
        update_data = {'title': 'Updated Title'}
        response = client.put(f'/api/todos/{sample_todo}',
                             data=json.dumps(update_data),
                             content_type='application/json')
        data = json.loads(response.data)
        
        assert response.status_code == 200
        assert data['success'] is True
        assert data['data']['title'] == 'Updated Title'
        assert data['data']['description'] == 'Test Description'
    
    def test_update_todo_description(self, client, sample_todo):
        """Test updating only the description of a todo."""
        update_data = {'description': 'Updated Description'}
        response = client.put(f'/api/todos/{sample_todo}',
                             data=json.dumps(update_data),
                             content_type='application/json')
        data = json.loads(response.data)
        
        assert response.status_code == 200
        assert data['success'] is True
        assert data['data']['description'] == 'Updated Description'
        assert data['data']['title'] == 'Test Todo'
    
    def test_update_todo_completed(self, client, sample_todo):
        """Test updating the completed status of a todo."""
        update_data = {'completed': True}
        response = client.put(f'/api/todos/{sample_todo}',
                             data=json.dumps(update_data),
                             content_type='application/json')
        data = json.loads(response.data)
        
        assert response.status_code == 200
        assert data['success'] is True
        assert data['data']['completed'] is True
    
    def test_update_todo_all_fields(self, client, sample_todo):
        """Test updating all fields of a todo."""
        update_data = {
            'title': 'Completely Updated',
            'description': 'New Description',
            'completed': True
        }
        response = client.put(f'/api/todos/{sample_todo}',
                             data=json.dumps(update_data),
                             content_type='application/json')
        data = json.loads(response.data)
        
        assert response.status_code == 200
        assert data['success'] is True
        assert data['data']['title'] == 'Completely Updated'
        assert data['data']['description'] == 'New Description'
        assert data['data']['completed'] is True
    
    def test_update_nonexistent_todo(self, client):
        """Test updating a todo that doesn't exist."""
        update_data = {'title': 'Updated'}
        response = client.put('/api/todos/999',
                             data=json.dumps(update_data),
                             content_type='application/json')
        data = json.loads(response.data)
        
        assert response.status_code == 404
        assert data['success'] is False
        assert 'not found' in data['error'].lower()
    
    def test_update_todo_empty_title(self, client, sample_todo):
        """Test updating a todo with empty title."""
        update_data = {'title': '   '}
        response = client.put(f'/api/todos/{sample_todo}',
                             data=json.dumps(update_data),
                             content_type='application/json')
        data = json.loads(response.data)
        
        assert response.status_code == 400
        assert data['success'] is False
        assert 'title' in data['error'].lower()
    
    def test_update_todo_no_data(self, client, sample_todo):
        """Test updating a todo with no data."""
        response = client.put(f'/api/todos/{sample_todo}',
                             data=json.dumps(None),
                             content_type='application/json')
        data = json.loads(response.data)
        
        assert response.status_code == 400
        assert data['success'] is False
    
    def test_update_todo_invalid_completed_type(self, client, sample_todo):
        """Test updating completed with non-boolean value."""
        update_data = {'completed': 'not a boolean'}
        response = client.put(f'/api/todos/{sample_todo}',
                             data=json.dumps(update_data),
                             content_type='application/json')
        data = json.loads(response.data)
        
        assert response.status_code == 400
        assert data['success'] is False
        assert 'boolean' in data['error'].lower()
    
    def test_update_todo_whitespace_trimming(self, client, sample_todo):
        """Test that whitespace is trimmed during update."""
        update_data = {
            'title': '  Trimmed Update  ',
            'description': '  Trimmed Desc  '
        }
        response = client.put(f'/api/todos/{sample_todo}',
                             data=json.dumps(update_data),
                             content_type='application/json')
        data = json.loads(response.data)
        
        assert response.status_code == 200
        assert data['data']['title'] == 'Trimmed Update'
        assert data['data']['description'] == 'Trimmed Desc'

class TestDeleteTodo:
    """Test cases for DELETE /api/todos/<id> endpoint."""
    
    def test_delete_existing_todo(self, client, sample_todo):
        """Test deleting an existing todo."""
        response = client.delete(f'/api/todos/{sample_todo}')
        data = json.loads(response.data)
        
        assert response.status_code == 200
        assert data['success'] is True
        assert 'deleted' in data['message'].lower()
        
        # Verify todo is actually deleted
        get_response = client.get(f'/api/todos/{sample_todo}')
        assert get_response.status_code == 404
    
    def test_delete_nonexistent_todo(self, client):
        """Test deleting a todo that doesn't exist."""
        response = client.delete('/api/todos/999')
        data = json.loads(response.data)
        
        assert response.status_code == 404
        assert data['success'] is False
        assert 'not found' in data['error'].lower()
    
    def test_delete_todo_twice(self, client, sample_todo):
        """Test deleting the same todo twice."""
        # First deletion
        response1 = client.delete(f'/api/todos/{sample_todo}')
        assert response1.status_code == 200
        
        # Second deletion should fail
        response2 = client.delete(f'/api/todos/{sample_todo}')
        data = json.loads(response2.data)
        
        assert response2.status_code == 404
        assert data['success'] is False

class TestTodoModel:
    """Test cases for Todo model methods."""
    
    def test_todo_to_dict(self, client):
        """Test the to_dict method of Todo model."""
        with app.app_context():
            todo = Todo(
                title='Model Test',
                description='Testing to_dict',
                completed=True
            )
            db.session.add(todo)
            db.session.commit()
            
            todo_dict = todo.to_dict()
            
            assert 'id' in todo_dict
            assert todo_dict['title'] == 'Model Test'
            assert todo_dict['description'] == 'Testing to_dict'
            assert todo_dict['completed'] is True
            assert 'created_at' in todo_dict
            assert isinstance(todo_dict['created_at'], str)
    
    def test_todo_repr(self, client):
        """Test the __repr__ method of Todo model."""
        with app.app_context():
            todo = Todo(title='Repr Test', description='', completed=False)
            db.session.add(todo)
            db.session.commit()
            
            repr_str = repr(todo)
            
            assert 'Todo' in repr_str
            assert str(todo.id) in repr_str
            assert 'Repr Test' in repr_str

class TestErrorHandlers:
    """Test cases for error handlers."""
    
    def test_404_error_handler(self, client):
        """Test 404 error handler for non-existent routes."""
        response = client.get('/api/nonexistent')
        data = json.loads(response.data)
        
        assert response.status_code == 404
        assert 'error' in data

class TestIntegrationScenarios:
    """Integration test scenarios."""
    
    def test_full_crud_workflow(self, client):
        """Test complete CRUD workflow."""
        # Create
        create_data = {'title': 'Integration Test', 'description': 'Full workflow'}
        create_response = client.post('/api/todos',
                                     data=json.dumps(create_data),
                                     content_type='application/json')
        assert create_response.status_code == 201
        todo_id = json.loads(create_response.data)['data']['id']
        
        # Read
        read_response = client.get(f'/api/todos/{todo_id}')
        assert read_response.status_code == 200
        
        # Update
        update_data = {'completed': True}
        update_response = client.put(f'/api/todos/{todo_id}',
                                     data=json.dumps(update_data),
                                     content_type='application/json')
        assert update_response.status_code == 200
        assert json.loads(update_response.data)['data']['completed'] is True
        
        # Delete
        delete_response = client.delete(f'/api/todos/{todo_id}')
        assert delete_response.status_code == 200
        
        # Verify deletion
        verify_response = client.get(f'/api/todos/{todo_id}')
        assert verify_response.status_code == 404
    
    def test_multiple_todos_management(self, client):
        """Test managing multiple todos."""
        # Create multiple todos
        for i in range(5):
            todo_data = {'title': f'Todo {i}', 'completed': i % 2 == 0}
            response = client.post('/api/todos',
                                  data=json.dumps(todo_data),
                                  content_type='application/json')
            assert response.status_code == 201
        
        # Get all todos
        response = client.get('/api/todos')
        data = json.loads(response.data)
        
        assert response.status_code == 200
        assert data['count'] == 5
        assert len(data['data']) == 5

# Made with Bob
