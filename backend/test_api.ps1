# Test API Endpoints Script
Write-Host "=== Testing Flask Todo API ===" -ForegroundColor Cyan
Write-Host ""

# Wait for server to start
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Test 1: Health Check
Write-Host "1. Testing Health Check (GET /api/health)" -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method GET -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor White
    Write-Host "Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Get All Todos (Empty)
Write-Host "2. Testing Get All Todos - Empty (GET /api/todos)" -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/todos" -Method GET -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor White
    Write-Host "Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Create Todo
Write-Host "3. Testing Create Todo (POST /api/todos)" -ForegroundColor Green
$createBody = @{
    title = "Buy groceries"
    description = "Milk, eggs, bread, and butter"
    completed = $false
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/todos" -Method POST -Body $createBody -ContentType "application/json" -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor White
    Write-Host "Response: $($response.Content)" -ForegroundColor White
    $todoId = ($response.Content | ConvertFrom-Json).data.id
    Write-Host "Created Todo ID: $todoId" -ForegroundColor Yellow
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Create Another Todo
Write-Host "4. Testing Create Another Todo (POST /api/todos)" -ForegroundColor Green
$createBody2 = @{
    title = "Finish project"
    description = "Complete the Flask backend implementation"
    completed = $false
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/todos" -Method POST -Body $createBody2 -ContentType "application/json" -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor White
    Write-Host "Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: Get All Todos (With Data)
Write-Host "5. Testing Get All Todos - With Data (GET /api/todos)" -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/todos" -Method GET -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor White
    Write-Host "Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 6: Get Single Todo
Write-Host "6. Testing Get Single Todo (GET /api/todos/1)" -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/todos/1" -Method GET -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor White
    Write-Host "Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 7: Update Todo
Write-Host "7. Testing Update Todo (PUT /api/todos/1)" -ForegroundColor Green
$updateBody = @{
    completed = $true
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/todos/1" -Method PUT -Body $updateBody -ContentType "application/json" -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor White
    Write-Host "Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 8: Delete Todo
Write-Host "8. Testing Delete Todo (DELETE /api/todos/2)" -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/todos/2" -Method DELETE -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor White
    Write-Host "Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 9: Get All Todos After Delete
Write-Host "9. Testing Get All Todos After Delete (GET /api/todos)" -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/todos" -Method GET -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor White
    Write-Host "Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== API Testing Complete ===" -ForegroundColor Cyan

# Made with Bob
