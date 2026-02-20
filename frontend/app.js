/**
 * ============================================================================
 * TODO APP - FRONTEND JAVASCRIPT
 * ============================================================================
 * 
 * This file handles all the frontend logic for our Todo application.
 * It communicates with the Flask backend API to perform CRUD operations
 * (Create, Read, Update, Delete) on todos.
 * 
 * Key Concepts Covered:
 * - Async/Await for handling asynchronous operations
 * - Fetch API for making HTTP requests
 * - DOM manipulation for updating the UI
 * - Event handling for user interactions
 * - Error handling for robust applications
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * API_BASE_URL: The base URL of our Flask backend server
 * 
 * This is where our backend API is running. All API requests will be
 * prefixed with this URL. For example:
 * - GET todos: http://localhost:5000/api/todos
 * - POST todo: http://localhost:5000/api/todos
 */
const API_BASE_URL = 'http://localhost:5000/api';

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/**
 * Application State
 * 
 * These variables store the current state of our application:
 * - todos: Array of all todo objects from the backend
 * - currentFilter: Which filter is active ('all', 'active', or 'completed')
 * 
 * Why use state?
 * State allows us to keep track of data without constantly querying the backend.
 * When we update state, we can re-render the UI to reflect changes.
 */
let todos = [];
let currentFilter = 'all';

// ============================================================================
// DOM ELEMENT REFERENCES
// ============================================================================

/**
 * DOM Elements
 * 
 * We store references to HTML elements that we'll need to interact with.
 * This is more efficient than searching for them every time we need them.
 * 
 * Why cache DOM elements?
 * - Performance: Searching the DOM is slow, caching is fast
 * - Convenience: We can use descriptive variable names
 * - Maintainability: If IDs change, we only update them here
 */
const todoForm = document.getElementById('todoForm');
const todoTitleInput = document.getElementById('todoTitle');
const todoDescriptionInput = document.getElementById('todoDescription');
const todoList = document.getElementById('todoList');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const emptyState = document.getElementById('emptyState');
const totalCount = document.getElementById('totalCount');
const activeCount = document.getElementById('activeCount');
const completedCount = document.getElementById('completedCount');
const filterButtons = document.querySelectorAll('.filter-btn');

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the Application
 * 
 * DOMContentLoaded event fires when the HTML document has been completely
 * loaded and parsed, without waiting for stylesheets, images, etc.
 * 
 * Why wait for DOMContentLoaded?
 * - Ensures all HTML elements exist before we try to access them
 * - Prevents errors from trying to manipulate elements that don't exist yet
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Todo App...');
    
    // Load todos from the backend when the page first loads
    loadTodos();
    
    // Set up all event listeners for user interactions
    setupEventListeners();
    
    console.log('✅ Todo App initialized successfully!');
});

// ============================================================================
// EVENT LISTENER SETUP
// ============================================================================

/**
 * Setup Event Listeners
 * 
 * Event listeners "listen" for user actions (clicks, form submissions, etc.)
 * and execute code in response.
 * 
 * Why separate this into a function?
 * - Organization: Keeps all event listener setup in one place
 * - Maintainability: Easy to see all user interactions at a glance
 */
function setupEventListeners() {
    // Listen for form submission (when user presses Enter or clicks Add button)
    todoForm.addEventListener('submit', handleAddTodo);
    
    // Set up filter buttons (All, Active, Completed)
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Get the filter type from the button's data-filter attribute
            currentFilter = e.target.dataset.filter;
            
            // Update which button looks "active"
            updateFilterButtons();
            
            // Re-render the todo list with the new filter
            renderTodos();
        });
    });
}

// ============================================================================
// API COMMUNICATION FUNCTIONS
// ============================================================================

/**
 * Generic API Request Function
 * 
 * This is a reusable function that handles all communication with our backend.
 * It uses the Fetch API to make HTTP requests.
 * 
 * @param {string} endpoint - The API endpoint (e.g., '/todos', '/todos/1')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise} - A promise that resolves to the response data
 * 
 * Why use async/await?
 * - Async operations (like API calls) take time to complete
 * - async/await makes asynchronous code look and behave like synchronous code
 * - It's easier to read and understand than callbacks or raw promises
 * 
 * How async/await works:
 * 1. 'async' keyword makes a function return a Promise
 * 2. 'await' keyword pauses execution until the Promise resolves
 * 3. This allows us to write asynchronous code in a linear, readable way
 * 
 * Example without async/await (callback hell):
 * fetch(url).then(response => {
 *   return response.json();
 * }).then(data => {
 *   // do something
 * }).catch(error => {
 *   // handle error
 * });
 * 
 * Example with async/await (much cleaner):
 * const response = await fetch(url);
 * const data = await response.json();
 */
async function apiRequest(endpoint, options = {}) {
    try {
        // Make the HTTP request to our backend
        // 'await' pauses here until the request completes
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                // Tell the server we're sending JSON data
                'Content-Type': 'application/json',
                // Spread any additional headers from options
                ...options.headers,
            },
            // Spread all other options (method, body, etc.)
            ...options,
        });

        // Parse the JSON response body
        // 'await' pauses here until parsing completes
        const data = await response.json();

        // Check if the request was successful (status code 200-299)
        if (!response.ok) {
            // If not successful, throw an error with the server's error message
            throw new Error(data.error || 'An error occurred');
        }

        // Return the data if everything was successful
        return data;
        
    } catch (error) {
        // Error Handling: Catch any errors that occurred during the request
        // This includes:
        // - Network errors (server is down, no internet)
        // - Server errors (500, 404, etc.)
        // - JSON parsing errors
        console.error('❌ API Error:', error);
        
        // Re-throw the error so the calling function can handle it
        throw error;
    }
}

/**
 * Load All Todos from Backend
 * 
 * This function fetches all todos from the server and updates the UI.
 * It's called when the page first loads and can be called again to refresh.
 * 
 * Why is this async?
 * - We need to wait for the API response before updating the UI
 * - async allows us to use 'await' to pause until data arrives
 */
async function loadTodos() {
    // Show loading spinner to give user feedback
    showLoading();
    
    // Hide any previous error messages
    hideError();

    try {
        // Make GET request to /api/todos
        // 'await' pauses execution until the request completes
        const data = await apiRequest('/todos');
        
        // Update our state with the todos from the server
        // Use empty array as fallback if data.data is undefined
        todos = data.data || [];
        
        // Update the UI to show the todos
        renderTodos();
        
        // Update the statistics (total, active, completed counts)
        updateStats();
        
    } catch (error) {
        // If anything goes wrong, show an error message to the user
        showError('Failed to load todos. Please make sure the backend server is running.');
    } finally {
        // 'finally' block always runs, whether there was an error or not
        // Hide the loading spinner since we're done loading
        hideLoading();
    }
}

/**
 * Create a New Todo
 * 
 * Sends a POST request to create a new todo on the server.
 * 
 * @param {string} title - The todo title (required)
 * @param {string} description - The todo description (optional)
 * @returns {Promise<object>} - The created todo object
 * 
 * Why POST?
 * - POST is the HTTP method for creating new resources
 * - The server will generate an ID and timestamp for us
 */
async function createTodo(title, description) {
    try {
        // Make POST request with todo data in the body
        const data = await apiRequest('/todos', {
            method: 'POST',
            // Convert JavaScript object to JSON string
            body: JSON.stringify({
                title,
                description,
                completed: false, // New todos start as incomplete
            }),
        });

        // Add the new todo to the beginning of our array
        // unshift() adds to the start, so new todos appear at the top
        todos.unshift(data.data);
        
        // Re-render the UI to show the new todo
        renderTodos();
        
        // Update statistics to reflect the new todo
        updateStats();
        
        // Return the created todo in case the caller needs it
        return data.data;
        
    } catch (error) {
        // Show user-friendly error message
        showError('Failed to create todo. Please try again.');
        
        // Re-throw so the caller knows something went wrong
        throw error;
    }
}

/**
 * Update an Existing Todo
 * 
 * Sends a PUT request to update a todo on the server.
 * 
 * @param {number} id - The ID of the todo to update
 * @param {object} updates - Object containing fields to update
 * @returns {Promise<object>} - The updated todo object
 * 
 * Why PUT?
 * - PUT is the HTTP method for updating existing resources
 * - We only send the fields that changed (partial update)
 */
async function updateTodo(id, updates) {
    try {
        // Make PUT request to /api/todos/:id
        const data = await apiRequest(`/todos/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });

        // Find the todo in our local array and update it
        const index = todos.findIndex(todo => todo.id === id);
        if (index !== -1) {
            // Replace the old todo with the updated one from the server
            todos[index] = data.data;
        }
        
        // Re-render to show the changes
        renderTodos();
        
        // Update statistics (completed count may have changed)
        updateStats();
        
        return data.data;
        
    } catch (error) {
        showError('Failed to update todo. Please try again.');
        throw error;
    }
}

/**
 * Delete a Todo
 * 
 * Sends a DELETE request to remove a todo from the server.
 * 
 * @param {number} id - The ID of the todo to delete
 * 
 * Why DELETE?
 * - DELETE is the HTTP method for removing resources
 * - After deletion, the todo no longer exists on the server
 */
async function deleteTodo(id) {
    try {
        // Make DELETE request to /api/todos/:id
        await apiRequest(`/todos/${id}`, {
            method: 'DELETE',
        });

        // Remove the todo from our local array
        // filter() creates a new array without the deleted todo
        todos = todos.filter(todo => todo.id !== id);
        
        // Re-render to remove the todo from the UI
        renderTodos();
        
        // Update statistics
        updateStats();
        
    } catch (error) {
        showError('Failed to delete todo. Please try again.');
        throw error;
    }
}

// ============================================================================
// EVENT HANDLER FUNCTIONS
// ============================================================================

/**
 * Handle Add Todo Form Submission
 * 
 * This function is called when the user submits the form (presses Enter
 * or clicks the Add button).
 * 
 * @param {Event} e - The form submission event
 * 
 * Why prevent default?
 * - By default, form submission reloads the page
 * - e.preventDefault() stops this, allowing us to handle it with JavaScript
 */
async function handleAddTodo(e) {
    // Prevent the form from reloading the page
    e.preventDefault();

    // Get the values from the input fields and remove whitespace
    const title = todoTitleInput.value.trim();
    const description = todoDescriptionInput.value.trim();

    // Validate: Make sure the user entered a title
    if (!title) {
        showError('Please enter a todo title');
        return; // Exit early if validation fails
    }

    try {
        // Create the todo on the server
        await createTodo(title, description);
        
        // Clear the input fields after successful creation
        todoTitleInput.value = '';
        todoDescriptionInput.value = '';
        
        // Hide any error messages
        hideError();
        
    } catch (error) {
        // Error already handled in createTodo, no need to do anything here
        // The user will see the error message from createTodo
    }
}

/**
 * Handle Toggle Complete Status
 * 
 * This function is called when the user clicks the checkbox or Complete button.
 * It toggles the todo between completed and incomplete.
 * 
 * @param {number} id - The ID of the todo to toggle
 * @param {boolean} currentStatus - The current completed status
 */
async function handleToggleComplete(id, currentStatus) {
    try {
        // Update the todo with the opposite of its current status
        // If it's completed (true), make it incomplete (false), and vice versa
        await updateTodo(id, { completed: !currentStatus });
    } catch (error) {
        // Error already handled in updateTodo
    }
}

/**
 * Handle Delete Todo
 * 
 * This function is called when the user clicks the Delete button.
 * It asks for confirmation before deleting.
 * 
 * @param {number} id - The ID of the todo to delete
 * 
 * Why confirm?
 * - Deletion is permanent and can't be undone
 * - Confirmation prevents accidental deletions
 */
async function handleDeleteTodo(id) {
    // Show a confirmation dialog
    // confirm() returns true if user clicks OK, false if they click Cancel
    if (confirm('Are you sure you want to delete this todo?')) {
        try {
            await deleteTodo(id);
        } catch (error) {
            // Error already handled in deleteTodo
        }
    }
}

// ============================================================================
// UI RENDERING FUNCTIONS
// ============================================================================

/**
 * Render Todos to the DOM
 * 
 * This function updates the UI to display the current list of todos.
 * It's called whenever the todos array changes or the filter changes.
 * 
 * Why separate rendering from data?
 * - Separation of concerns: Data logic is separate from UI logic
 * - Reusability: We can re-render without re-fetching data
 * - Performance: We only update the UI when needed
 */
function renderTodos() {
    // Get the filtered list based on the current filter
    const filteredTodos = getFilteredTodos();

    // If there are no todos to display, show the empty state
    if (filteredTodos.length === 0) {
        todoList.innerHTML = ''; // Clear the list
        showEmptyState();
        return; // Exit early
    }

    // Hide the empty state since we have todos to show
    hideEmptyState();

    // Generate HTML for all todos and insert it into the DOM
    // map() transforms each todo object into an HTML string
    // join('') combines all the HTML strings into one
    todoList.innerHTML = filteredTodos.map(todo => createTodoElement(todo)).join('');

    // Add event listeners to the dynamically created elements
    // We need to do this after inserting the HTML into the DOM
    filteredTodos.forEach(todo => {
        // Find the todo element we just created
        const todoElement = document.querySelector(`[data-todo-id="${todo.id}"]`);
        
        if (todoElement) {
            // Find the checkbox and delete button within this todo
            const checkbox = todoElement.querySelector('.todo-checkbox');
            const deleteBtn = todoElement.querySelector('.btn-danger');

            // Add click handlers
            checkbox.addEventListener('click', () => handleToggleComplete(todo.id, todo.completed));
            deleteBtn.addEventListener('click', () => handleDeleteTodo(todo.id));
        }
    });
}

/**
 * Create HTML for a Single Todo
 * 
 * This function generates the HTML string for one todo item.
 * 
 * @param {object} todo - The todo object from the backend
 * @returns {string} - HTML string for the todo
 * 
 * Why return a string instead of creating DOM elements?
 * - Performance: Creating HTML strings is faster than DOM manipulation
 * - Simplicity: Template literals make it easy to create complex HTML
 * - Batch updates: We can create all HTML at once, then insert it
 */
function createTodoElement(todo) {
    // Format the creation date for display
    const date = new Date(todo.created_at);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    // Return HTML string using template literals
    // Template literals allow us to embed variables with ${}
    return `
        <li class="todo-item ${todo.completed ? 'completed' : ''}" data-todo-id="${todo.id}">
            <div class="todo-content">
                <div class="todo-checkbox ${todo.completed ? 'checked' : ''}"></div>
                <div class="todo-text">
                    <h3 class="todo-title">${escapeHtml(todo.title)}</h3>
                    ${todo.description ? `<p class="todo-description">${escapeHtml(todo.description)}</p>` : ''}
                    <span class="todo-date">Created: ${formattedDate}</span>
                </div>
            </div>
            <div class="todo-actions">
                <button class="btn btn-success" title="${todo.completed ? 'Mark as incomplete' : 'Mark as complete'}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    ${todo.completed ? 'Undo' : 'Complete'}
                </button>
                <button class="btn btn-danger" title="Delete todo">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Delete
                </button>
            </div>
        </li>
    `;
}

/**
 * Get Filtered Todos
 * 
 * Returns a filtered array of todos based on the current filter.
 * 
 * @returns {Array} - Filtered array of todos
 * 
 * Why filter?
 * - Users want to see only active or completed todos sometimes
 * - Filtering happens on the frontend for instant response
 * - We could also filter on the backend, but this is faster for small datasets
 */
function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            // Return only incomplete todos
            return todos.filter(todo => !todo.completed);
        case 'completed':
            // Return only completed todos
            return todos.filter(todo => todo.completed);
        default:
            // Return all todos
            return todos;
    }
}

/**
 * Update Statistics Display
 * 
 * Calculates and displays the total, active, and completed todo counts.
 * 
 * Why calculate statistics?
 * - Gives users an overview of their progress
 * - Motivates users by showing completed tasks
 * - Helps users understand their workload
 */
function updateStats() {
    // Calculate counts
    const total = todos.length;
    const active = todos.filter(todo => !todo.completed).length;
    const completed = todos.filter(todo => todo.completed).length;

    // Update the DOM with the new counts
    totalCount.textContent = total;
    activeCount.textContent = active;
    completedCount.textContent = completed;
}

/**
 * Update Filter Button Styles
 * 
 * Updates which filter button appears "active" based on currentFilter.
 * 
 * Why update button styles?
 * - Visual feedback shows users which filter is active
 * - Improves user experience and clarity
 */
function updateFilterButtons() {
    filterButtons.forEach(btn => {
        if (btn.dataset.filter === currentFilter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// ============================================================================
// UI HELPER FUNCTIONS
// ============================================================================

/**
 * Show Loading Spinner
 * 
 * Displays a loading spinner while data is being fetched.
 * 
 * Why show loading states?
 * - Provides feedback that something is happening
 * - Prevents user confusion during network requests
 * - Improves perceived performance
 */
function showLoading() {
    loadingSpinner.classList.remove('hidden');
    todoList.classList.add('hidden');
    emptyState.classList.add('hidden');
}

/**
 * Hide Loading Spinner
 * 
 * Hides the loading spinner after data has been loaded.
 */
function hideLoading() {
    loadingSpinner.classList.add('hidden');
    todoList.classList.remove('hidden');
}

/**
 * Show Error Message
 * 
 * Displays an error message to the user.
 * 
 * @param {string} message - The error message to display
 * 
 * Why show errors?
 * - Users need to know when something goes wrong
 * - Error messages help users understand what happened
 * - Auto-dismiss prevents the error from staying forever
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    
    // Auto-hide the error after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

/**
 * Hide Error Message
 * 
 * Hides the error message.
 */
function hideError() {
    errorMessage.classList.add('hidden');
}

/**
 * Show Empty State
 * 
 * Displays a message when there are no todos to show.
 * 
 * Why show empty state?
 * - Blank screens are confusing
 * - Empty state guides users on what to do next
 * - Improves user experience
 */
function showEmptyState() {
    emptyState.classList.remove('hidden');
}

/**
 * Hide Empty State
 * 
 * Hides the empty state message.
 */
function hideEmptyState() {
    emptyState.classList.add('hidden');
}

/**
 * Escape HTML
 * 
 * Prevents XSS (Cross-Site Scripting) attacks by escaping HTML characters.
 * 
 * @param {string} text - The text to escape
 * @returns {string} - The escaped text
 * 
 * Why escape HTML?
 * - Security: Prevents malicious code injection
 * - If a user enters "<script>alert('hack')</script>" as a todo title,
 *   this function ensures it's displayed as text, not executed as code
 * 
 * How it works:
 * - Creates a temporary div element
 * - Sets the text content (which automatically escapes HTML)
 * - Returns the escaped HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

/**
 * Keyboard Shortcuts
 * 
 * Adds keyboard shortcuts for power users.
 * 
 * Why add keyboard shortcuts?
 * - Improves efficiency for frequent users
 * - Makes the app feel more professional
 * - Accessibility: Some users prefer keyboard navigation
 */
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus on the input field
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault(); // Prevent browser's default Ctrl+K behavior
        todoTitleInput.focus();
    }
});

// ============================================================================
// AUTO-REFRESH
// ============================================================================

/**
 * Auto-Refresh Todos
 * 
 * Automatically refreshes the todo list every 30 seconds.
 * 
 * Why auto-refresh?
 * - Keeps data in sync if multiple users are using the app
 * - Ensures the UI reflects the latest data from the server
 * - 30 seconds is a good balance between freshness and server load
 * 
 * setInterval() runs a function repeatedly at a specified interval
 */
setInterval(() => {
    loadTodos();
}, 30000); // 30000 milliseconds = 30 seconds

// ============================================================================
// INITIALIZATION COMPLETE
// ============================================================================

console.log('🎉 Todo App JavaScript loaded and ready!');
console.log('💡 Tip: Press Ctrl+K (or Cmd+K on Mac) to quickly add a new todo');

// Made with Bob
