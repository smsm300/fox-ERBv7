import requests
import json

# Test API endpoints
BASE_URL = "http://localhost:8000/api"

# Test 1: Login
print("🔐 Testing Login...")
login_response = requests.post(f"{BASE_URL}/auth/login/", json={
    "username": "admin",
    "password": "admin123"
})
print(f"Status: {login_response.status_code}")
if login_response.status_code == 200:
    token = login_response.json().get('access')
    print(f"✅ Login successful! Token: {token[:20]}...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test 2: Get Products
    print("\n📦 Testing Get Products...")
    products_response = requests.get(f"{BASE_URL}/products/", headers=headers)
    print(f"Status: {products_response.status_code}")
    print(f"Products: {products_response.json()}")
    
    # Test 3: Create Product
    print("\n➕ Testing Create Product...")
    new_product = {
        "sku": "TEST-001",
        "name": "منتج تجريبي",
        "category": "تجريبي",
        "quantity": 10,
        "costPrice": 50,
        "sellPrice": 100,
        "unit": "قطعة",
        "minStockAlert": 5,
        "image": ""
    }
    create_response = requests.post(f"{BASE_URL}/products/", json=new_product, headers=headers)
    print(f"Status: {create_response.status_code}")
    if create_response.status_code == 201:
        print(f"✅ Product created: {create_response.json()}")
    else:
        print(f"❌ Error: {create_response.text}")
    
    # Test 4: Get Products Again
    print("\n📦 Testing Get Products Again...")
    products_response2 = requests.get(f"{BASE_URL}/products/", headers=headers)
    print(f"Status: {products_response2.status_code}")
    print(f"Products Count: {len(products_response2.json())}")
    
else:
    print(f"❌ Login failed: {login_response.text}")
