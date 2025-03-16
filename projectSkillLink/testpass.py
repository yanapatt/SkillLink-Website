import requests

# Base URL of the application
BASE_URL = "http://localhost:3000"

# Hardcoded credentials
valid_username = "admin"
valid_password = "123"

# List of test cases with different username-password combinations
test_credentials = [
    {"username": "admin", "password": "password1234"},  # Valid credentials
    {"username": "admin", "password": "wrongpassword"},  # Invalid password
    {"username": "user", "password": "password123"},  # Invalid username
    {"username": "admin", "password": "123"},
    {"username": "' OR 1=1 --", "password": "any"},  # SQL Injection attempt
]

# Function to test login
def test_login(username, password):
    url = f"{BASE_URL}/login"
    data = {"username": username, "password": password}
    try:
        # Send POST request to the login endpoint
        response = requests.post(url, data=data)
        
        # Check if an error is displayed in the response body
        if "Invalid credentials for username" in response.text:
            print(f"Test with username='{username}' and password='{password}' -> LOGIN FAILED")
            #print(f"Error Message: {response.text}")
        elif "Welcome" in response.text:
            print(f"Test with username='{username}' and password='{password}' -> LOGIN SUCCESS")
            #print(f"Response: {response.text}")
        else:
            print(f"Test with username='{username}' and password='{password}' -> UNKNOWN RESULT")
            #print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error testing username='{username}' and password='{password}': {e}")

# Iterate through test cases
for creds in test_credentials:
    test_login(creds["username"], creds["password"])

